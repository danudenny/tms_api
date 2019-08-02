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
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { AwbStatus } from '../../../shared/orm-entity/awb-status';

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

        // NOTE: get awb_ite_attr and update awb_history_id
        const awbItemAttr = await AwbItemAttr.findOne({
          where: {
            awbItemId: data.awbItemId,
          },
        });

        if (awbItemAttr) {
          // NOTE: Insert Data awb history
          const awbHistory = AwbHistory.create({
            awbItemId: data.awbItemId,
            userId: data.userId,
            branchId: data.branchId,
            employeeIdDriver: data.employeeIdDriver,
            historyDate: moment().toDate(),
            awbStatusId: data.awbStatusId,
            awbHistoryIdPrev: awbItemAttr.awbHistoryIdLast,
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

          // update data awb_item_attr
          awbItemAttr.awbHistoryIdLast = awbHistory.awbHistoryId;
          awbItemAttr.updatedTime = moment().toDate();
          await transactionalEntityManager.save(awbItemAttr);
        }
      }); // end transaction

    });
  }

  // TODO: simplify get data
  public static async createJobByScanOutAwb(doPodDetailId: number) {

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

    if (doPodDetail) {

      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetail.awbItemId,
        userId: doPodDetail.doPod.userId,
        branchId: doPodDetail.doPod.branchId,
        awbStatusId: AWB_STATUS.OUT_BRANCH,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  public static async createJobByScanOutAwbDeliver(doPodDeliverDetailId: number) {

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

    if (doPodDetailDeliver) {
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetailDeliver.awbItemId,
        userId: doPodDetailDeliver.doPodDeliver.userId,
        branchId: doPodDetailDeliver.doPodDeliver.branchId,
        awbStatusId: AWB_STATUS.ANT,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
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

    if (doPodDetail) {
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId,
        userId: doPodDetail.doPod.userId,
        branchId: doPodDetail.doPod.branchId,
        awbStatusId: AWB_STATUS.OUT_HUB,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
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

    if (doPodDetail) {
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetail.awbItemId,
        userId: doPodDetail.podScanIn.userId,
        branchId: doPodDetail.podScanIn.branchId,
        awbStatusId: AWB_STATUS.IN_BRANCH,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }
  }

  public static async createJobByScanInBag(
    awbItemId: number,
    branchId: number,
    userId: number,
  ) {
    // TODO: need to be reviewed ??
    // find awbStatusIdLastPublic on awb_status
    // provide data
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId: AWB_STATUS.DO_HUB,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  public static async createJobByAwbFilter(
    awbItemId: number,
    branchId: number,
    userId: number,
  ) {
    // TODO: need to be reviewed ??
    // find awbStatusIdLastPublic on awb_status
    // provide data
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId: AWB_STATUS.IN_BRANCH,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  public static async createJobByMobileSyncAwb(doPodDeliverDetailId: number, awbStatusId: number) {

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

    if (doPodDetailDeliver) {
      // TODO: find awbStatusIdLastPublic on awb_status
      // need to be reviewed ??
      const awbStatusIdLastPublic = AWB_STATUS.ON_PROGRESS;
      // const awbStatus = await AwbStatus.findOne({
      //   select: ['awbStatusId', 'awbVisibility'],
      //   where: {
      //     awbStatusId,
      //   },
      // });
      // if (awbStatus.awbVisibility == 20) {
      //   awbStatusIdLastPublic = awbStatusId;
      // }

      // provide data
      const obj = {
        awbStatusId,
        awbStatusIdLastPublic,
        awbItemId: doPodDetailDeliver.awbItemId,
        userId: doPodDetailDeliver.doPodDeliver.userId,
        branchId: doPodDetailDeliver.doPodDeliver.branchId,
        userIdCreated: doPodDetailDeliver.userIdCreated,
        userIdUpdated: doPodDetailDeliver.userIdUpdated,
        employeeIdDriver:
          doPodDetailDeliver.doPodDeliver.employeeIdDriver,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }
}
