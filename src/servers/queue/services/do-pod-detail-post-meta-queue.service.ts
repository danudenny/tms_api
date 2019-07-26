import * as Bull from 'bull';

import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemSummary } from '../../../shared/orm-entity/awb-item-summary';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { OrionRepositoryService } from '../../../shared/services/orion-repository.service';
import { getManager } from 'typeorm';
import { DoPodDeliverDetail } from '../../../shared/orm-entity/do-pod-deliver-detail';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';

export class DoPodDetailPostMetaQueueService {
  public static queue = new Bull('awb-history-post-meta', {
    defaultJobOptions: {
      timeout: 0,
      attempts: Math.round(
        (+ConfigService.get('queue.doPodDetailPostMeta.keepRetryInHours') *
          60 *
          60 *
          1000) /
          +ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
      ),
      backoff: {
        type: 'fixed',
        delay: ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
      },
    },
    redis: ConfigService.get('redis'),
  });

  public static boot() {
    this.queue.process(async job => {
      const data = job.data;
      await getManager().transaction(async transactionalEntityManager => {

        // TODO: get awb_ite_attr and update awb_history_id
        // NOTE: Insert Data awb history
        const awbHistory = AwbHistory.create({
          awbItemId: data.awbItemId,
          userId: data.userId,
          branchId: data.branchId,
          employeeIdDriver: data.employeeIdDriver,
          historyDate: moment().toDate(),
          awbStatusId: data.awbStatusId,
          awbHistoryIdPrev: data.awbHistoryIdPrev,
          userIdCreated: data.userIdCreated,
          userIdUpdated: data.userIdUpdated,
        });
        await transactionalEntityManager.save(awbHistory);

        // NOTE: update if exists or insert awbItemSummary
        let awbItemSummary = await AwbItemSummary.findOne({
          where: {
            awbItemId: data.awbItemId,
            summaryDate: moment().format('YYYY-MM-DD'),
            isDeleted: false,
          },
        });

        if (!awbItemSummary) {
          // create data
          awbItemSummary = AwbItemSummary.create();
          awbItemSummary.userIdCreated = data.userIdCreated;
        }
        const convertTimeObject = moment().startOf('day').toDate();

        // Update data
        awbItemSummary.summaryDate = convertTimeObject;
        awbItemSummary.awbItemId = awbHistory.awbItemId;
        awbItemSummary.awbHistoryIdLast = awbHistory.awbHistoryId;
        awbItemSummary.awbStatusIdLast = awbHistory.awbStatusId;
        awbItemSummary.awbStatusIdLastPublic = data.awbStatusIdLastPublic;
        awbItemSummary.userIdLast = awbHistory.userId;
        awbItemSummary.branchIdLast = awbHistory.branchId;
        awbItemSummary.historyDateLast = awbHistory.historyDate;
        awbItemSummary.userIdUpdated = data.userIdUpdated;
        await transactionalEntityManager.save(awbItemSummary);
      }); // end transaction

    });
  }

  public static async createJobByDoPodDetailId(doPodDetailId: number) {

    const doPodDetailRepository = new OrionRepositoryService(DoPodDetail);
    const q = doPodDetailRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.doPod);

    q.select({
      doPodDetailId: true,
      awbItemId: true,
      userIdCreated: true,
      userIdUpdated: true,
      doPod: {
        doPodId: true,
        branchId: true,
        userId: true,
      },
    });
    q.where(e => e.doPodDetailId, w => w.equals(doPodDetailId));
    const doPodDetail = await q.exec();
    let awbHistoryIdPrev = null;

    if (doPodDetail) {
      // find last data awb history
      const awbHistoryLast = await AwbHistory.find({
        select: ['awbHistoryId'],
        where: {
          awbItemId:  doPodDetail.awbItemId,
        },
        order: { awbHistoryId: 'DESC'},
        take: 1,
      });

      if (awbHistoryLast && awbHistoryLast.length) {
        awbHistoryIdPrev = awbHistoryLast[0].awbHistoryId;
      }
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetail.awbItemId,
        userId: doPodDetail.doPod.userId,
        branchId: doPodDetail.doPod.branchId,
        awbStatusId: AWB_STATUS.OUT_BRANCH,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        awbHistoryIdPrev,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  public static async createJobByDoPodDeliverDetailId(doPodDeliverDetailId: number) {

    const doPodDetailRepository = new OrionRepositoryService(
      DoPodDeliverDetail,
    );
    const q = doPodDetailRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.doPodDeliver);

    q.select({
      doPodDeliverDetailId: true,
      awbItemId: true,
      userIdCreated: true,
      userIdUpdated: true,
      doPodDeliver: {
        doPodDeliverId: true,
        employeeIdDriver: true,
        branchId: true,
        userId: true,
      },
    });
    q.where(e => e.doPodDeliverDetailId, w => w.equals(doPodDeliverDetailId));
    const doPodDetailDeliver = await q.exec();

    let awbHistoryIdPrev = null;

    if (doPodDetailDeliver) {
      // find last data awb history
      const awbHistoryLast = await AwbHistory.find({
        select: ['awbHistoryId'],
        where: {
          awbItemId: doPodDetailDeliver.awbItemId,
        },
        order: { awbHistoryId: 'DESC' },
        take: 1,
      });

      if (awbHistoryLast && awbHistoryLast.length) {
        awbHistoryIdPrev = awbHistoryLast[0].awbHistoryId;
      }
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetailDeliver.awbItemId,
        userId: doPodDetailDeliver.doPodDeliver.userId,
        branchId: doPodDetailDeliver.doPodDeliver.branchId,
        awbStatusId: AWB_STATUS.ANT,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        awbHistoryIdPrev,
        userIdCreated: doPodDetailDeliver.userIdCreated,
        userIdUpdated: doPodDetailDeliver.userIdUpdated,
        employeeIdDriver: doPodDetailDeliver.doPodDeliver.employeeIdDriver,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  public static async createJobByScanOutBag(doPodDetailId: number, awbItemId: number) {
    // TODO: ???
    const doPodDetailRepository = new OrionRepositoryService(DoPodDetail);
    const q = doPodDetailRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.doPod);

    q.select({
      doPodDetailId: true,
      bagItemId: true,
      userIdCreated: true,
      userIdUpdated: true,
      doPod: {
        doPodId: true,
        branchId: true,
        userId: true,
      },
    });
    q.where(e => e.doPodDetailId, w => w.equals(doPodDetailId));
    const doPodDetail = await q.exec();
    let awbHistoryIdPrev = null;

    if (doPodDetail) {
      // find last data awb history
      const awbHistoryLast = await AwbHistory.find({
        select: ['awbHistoryId'],
        where: {
          awbItemId,
        },
        order: { awbHistoryId: 'DESC' },
        take: 1,
      });

      if (awbHistoryLast && awbHistoryLast.length) {
        awbHistoryIdPrev = awbHistoryLast[0].awbHistoryId;
      }
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId,
        userId: doPodDetail.doPod.userId,
        branchId: doPodDetail.doPod.branchId,
        awbStatusId: AWB_STATUS.OUT_HUB,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        awbHistoryIdPrev,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }
  }

  public static async createJobByScanInAwb(doPodDetailId: number) {
    // TODO: ???
    const doPodDetailRepository = new OrionRepositoryService(
      DoPodDetail,
    );
    const q = doPodDetailRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.podScanIn);

    q.select({
      doPodDetailId: true,
      awbItemId: true,
      userIdCreated: true,
      userIdUpdated: true,
      podScanIn: {
        podScanInId: true,
        branchId: true,
        userId: true,
        employeeId: true,
      },
    });
    q.where(e => e.doPodDetailId, w => w.equals(doPodDetailId));
    const doPodDetail = await q.exec();
    let awbHistoryIdPrev = null;

    if (doPodDetail) {
      // find last data awb history
      const awbHistoryLast = await AwbHistory.find({
        select: ['awbHistoryId'],
        where: {
          awbItemId: doPodDetail.awbItemId,
        },
        order: { awbHistoryId: 'DESC' },
        take: 1,
      });

      if (awbHistoryLast && awbHistoryLast.length) {
        awbHistoryIdPrev = awbHistoryLast[0].awbHistoryId;
      }
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetail.awbItemId,
        userId: doPodDetail.podScanIn.userId,
        branchId: doPodDetail.podScanIn.branchId,
        awbStatusId: AWB_STATUS.IN_BRANCH,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        awbHistoryIdPrev,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }
  }

  public static async createJobByScanInBag(doPodDetailId: number, awbItemId: number) {
    // TODO: ???
    const doPodDetailRepository = new OrionRepositoryService(
      DoPodDetail,
    );
    const q = doPodDetailRepository.findOne();
    // Manage relation (default inner join)
    q.innerJoin(e => e.podScanIn);

    q.select({
      doPodDetailId: true,
      bagItemId: true,
      userIdCreated: true,
      userIdUpdated: true,
      podScanIn: {
        podScanInId: true,
        branchId: true,
        userId: true,
        employeeId: true,
      },
    });
    q.where(e => e.doPodDetailId, w => w.equals(doPodDetailId));
    const doPodDetail = await q.exec();
    let awbHistoryIdPrev = null;

    if (doPodDetail) {
      // find last data awb history
      const awbHistoryLast = await AwbHistory.find({
        select: ['awbHistoryId'],
        where: {
          awbItemId,
        },
        order: { awbHistoryId: 'DESC' },
        take: 1,
      });

      if (awbHistoryLast && awbHistoryLast.length) {
        awbHistoryIdPrev = awbHistoryLast[0].awbHistoryId;
      }
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId,
        userId: doPodDetail.doPod.userId,
        branchId: doPodDetail.doPod.branchId,
        awbStatusId: AWB_STATUS.IN_BRANCH,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        awbHistoryIdPrev,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }
  }
}
