import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { OrionRepositoryService } from '../../../shared/services/orion-repository.service';
import { getManager } from 'typeorm';
import { DoPodDeliverDetail } from '../../../shared/orm-entity/do-pod-deliver-detail';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { QueueBullBoard } from './queue-bull-board';

export class DoPodDetailPostMetaQueueService {
  public static queue = QueueBullBoard.createQueue.add('awb-history-post-meta', {
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
  });

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(async job => {
      const data = job.data;
      console.log('### JOB ID =========', job.id);
      await getManager().transaction(async transactionalEntityManager => {

        // NOTE: get awb_ite_attr and update awb_history_id
        const awbItemAttr = await AwbItemAttr.findOne({
          where: {
            awbItemId: data.awbItemId,
            isDeleted: false,
          },
        });
        // TODO: to be fixed create data awb history
        if (awbItemAttr) {
          // NOTE: Insert Data awb history
          const awbHistory = AwbHistory.create({
            awbItemId: data.awbItemId,
            refAwbNumber: awbItemAttr.awbNumber,
            userId: data.userId,
            branchId: data.branchId,
            employeeIdDriver: data.employeeIdDriver,
            historyDate: data.timestamp,
            awbStatusId: data.awbStatusId,
            awbHistoryIdPrev: awbItemAttr.awbHistoryIdLast,
            userIdCreated: data.userIdCreated,
            userIdUpdated: data.userIdUpdated,
          });
          await transactionalEntityManager.insert(AwbHistory, awbHistory);

          // NOTE: SKIP this step
          // // NOTE: update if exists or insert awbItemSummary
          // let awbItemSummary = await AwbItemSummary.findOne({
          //   where: {
          //     awbItemId: data.awbItemId,
          //     summaryDate: moment().format('YYYY-MM-DD'),
          //     isDeleted: false,
          //   },
          // });

          // if (!awbItemSummary) {
          //   // create data
          //   awbItemSummary = AwbItemSummary.create();
          //   awbItemSummary.userIdCreated = data.userIdCreated;
          // }
          // const convertTimeObject = moment().startOf('day').toDate();

          // // Update data
          // awbItemSummary.summaryDate = convertTimeObject;
          // awbItemSummary.awbItemId = awbHistory.awbItemId;
          // awbItemSummary.awbHistoryIdLast = awbHistory.awbHistoryId;
          // awbItemSummary.awbStatusIdLast = awbHistory.awbStatusId;
          // awbItemSummary.awbStatusIdLastPublic = data.awbStatusIdLastPublic;
          // awbItemSummary.userIdLast = awbHistory.userId;
          // awbItemSummary.branchIdLast = awbHistory.branchId;
          // awbItemSummary.historyDateLast = awbHistory.historyDate;
          // awbItemSummary.userIdUpdated = data.userIdUpdated;
          // await transactionalEntityManager.save(awbItemSummary);

          // update data awb_item_attr
          // awbItemAttr.awbHistoryIdLast = awbHistory.awbHistoryId;
          // awbItemAttr.updatedTime = data.timestamp;
          await transactionalEntityManager.update(AwbItemAttr, awbItemAttr.awbItemAttrId, {
            awbHistoryIdLast: awbHistory.awbHistoryId,
            updatedTime: data.timestamp,
          });
        }
      }); // end transaction

    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      console.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  // TODO: simplify get data
  public static async createJobByScanOutAwb(doPodDetailId: string) {

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
        // userId: true,
      },
    });
    q.where(e => e.doPodDetailId, w => w.equals(doPodDetailId));
    const doPodDetail = await q.exec();

    if (doPodDetail) {

      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetail.awbItemId,
        // userId: null,
        branchId: doPodDetail.doPod.branchId,
        awbStatusId: AWB_STATUS.OUT_BRANCH,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
        timestamp: moment().toDate(),
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  public static async createJobByScanOutAwbDeliver(doPodDeliverDetailId: string) {

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
        employeeIdDriver: null,
        timestamp: moment().toDate(),
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  // NOTE: same provide data
  public static async createJobByScanOutBag(
    awbItemId: number,
    branchId: number,
    userId: number,
    employeeIdDriver: number,
    awbStatusId: number,
  ) {
    // TODO: find awbStatusIdLastPublic on awb_status
    // provide data
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver,
      timestamp: moment().toDate(),
    };

    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  public static async createJobByScanInAwb(doPodDetailId: string) {
    // TODO: ???
    const doPodDetailRepository = new OrionRepositoryService(
      DoPodDetail,
    );
    const q = doPodDetailRepository.findOne();
    // Manage relation (default inner join)
    // q.innerJoin(e => e.podScanIn);

    q.select({
      doPodDetailId: true,
      awbItemId: true,
      userIdCreated: true,
      userIdUpdated: true,
      // podScanIn: {
      //   podScanInId: true,
      //   branchId: true,
      //   userId: true,
      //   employeeId: true,
      // },
    });
    q.where(e => e.doPodDetailId, w => w.equals(doPodDetailId));
    const doPodDetail = await q.exec();

    if (doPodDetail) {
      // TODO: find awbStatusIdLastPublic on awb_status
      // provide data
      const obj = {
        awbItemId: doPodDetail.awbItemId,
        // userId: doPodDetail.podScanIn.userId,
        // branchId: doPodDetail.podScanIn.branchId,
        awbStatusId: AWB_STATUS.IN_BRANCH,
        awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
        userIdCreated: doPodDetail.userIdCreated,
        userIdUpdated: doPodDetail.userIdUpdated,
        employeeIdDriver: null,
        timestamp: moment().toDate(),
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }
  }

  // NOTE: same provide data
  public static async createJobByDropoffBag(
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
      timestamp: moment().toDate(),
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

    public static async createJobByDoSortBag(
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
      awbStatusId: AWB_STATUS.DO_SORTIR,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
      timestamp: moment().toDate(),
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
      awbStatusId: AWB_STATUS.IN_HUB,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
      timestamp: moment().toDate(),
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  // TODO: fix get data
  public static async createJobByMobileSyncAwb(
    doPodDeliverDetailId: string,
    employeeIdDriver: number,
    awbStatusId: number,
    ) {

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
        employeeIdDriver,
        timestamp: moment().toDate(),
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  // NOTE: general purpose
  public static async createJobByAwbUpdateStatus(
    awbItemId: number,
    awbStatusId: number,
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
      awbStatusId,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
      timestamp: moment().toDate(),
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  public static async createJobByAwbDeliver(
    awbItemId: number,
    awbStatusId: number,
    branchId: number,
    userId: number,
    employeeIdDriver: number,
  ) {
    // TODO: need to be reviewed ??
    // find awbStatusIdLastPublic on awb_status
    // provide data
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver,
      timestamp: moment().toDate(),
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  public static async createJobByScanInAwbBranch(
    awbItemId: number,
    branchId: number,
    userId: number,
  ) {
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId: AWB_STATUS.IN_BRANCH,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
      timestamp: moment().toDate(),
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }
}
