import moment = require('moment');
import { getManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { AwbStatus } from '../../../shared/orm-entity/awb-status';
import { DoPodDeliverDetail } from '../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { ConfigService } from '../../../shared/services/config.service';
import { OrionRepositoryService } from '../../../shared/services/orion-repository.service';
import { QueueBullBoard } from './queue-bull-board';
import { Branch } from '../../../shared/orm-entity/branch';

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
      Logger.log('### JOB ID =========', job.id);
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
            noteInternal: data.noteInternal,
            notePublic: data.notePublic,
            receiverName: data.receiverName,
            awbNote: data.awbNote,
          });
          await transactionalEntityManager.insert(AwbHistory, awbHistory);

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
      Logger.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      Logger.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  // NOTE: not used now =======================
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
  // NOTE: not used now =======================
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
  // use on batch from bag service ??
  public static async createJobByScanOutBag(
    awbItemId: number,
    branchId: number,
    userId: number,
    employeeIdDriver: number,
    employeeNameDriver: string,
    awbStatusId: number,
    branchName: string,
    cityName: string,
  ) {
    // TODO: ONLY IN_HUB, OUT_HUB, IN_BRANCH, OUT_BRANCH
    const noteInternal = `Paket keluar dari ${cityName} [${branchName}] - Supir: ${employeeNameDriver}`;
    const notePublic = `Paket keluar dari ${cityName} [${branchName}]`;

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
      noteInternal,
      notePublic,
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
        noteInternal: '',
        notePublic: '',
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
      noteInternal: '',
      notePublic: '',
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
      noteInternal: '',
      notePublic: '',
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  // NOTE: status ONLY IN_HUB
  public static async createJobByAwbFilter(
    awbItemId: number,
    branchId: number,
    userId: number,
  ) {
    // TODO: need to be reviewed ??
    // TODO: ONLY IN_HUB IN_BRANCH
    let branchName = 'Kantor Pusat';
    let cityName = 'Jakarta';
    const branch = await this.getDataBranchCity(branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district.city.cityName;
    }
    const noteInternal = `Paket telah di terima di ${cityName} [${branchName}]`;
    const notePublic = `Paket telah di terima di ${cityName} [${branchName}]`;

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
      noteInternal,
      notePublic,
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
    q.leftJoin(e => e.reasonLast);

    q.select({
      doPodDeliverDetailId: true,
      descLast: true,
      consigneeName: true,
      awbItemId: true,
      reasonLast: {
        reasonId: true,
        reasonCode: true,
        reasonName: true,
      },
      awbStatusIdLast: true,
      awbStatus: {
        awbStatusId: true,
        awbStatusName: true,
        awbStatusTitle: true,
      },
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
      const awbStatusIdLastPublic = AWB_STATUS.ON_PROGRESS;
      const awbNote = doPodDetailDeliver.descLast;
      // TODO: create note internal and note public ??
      let noteInternal = '';
      let notePublic = '';
      let receiverName = '';
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      const branch = await this.getDataBranchCity(doPodDetailDeliver.doPodDeliver.branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district.city.cityName;
      }
      if (doPodDetailDeliver.awbStatusIdLast == AWB_STATUS.DLV) {
        // TODO: title case consigneeName
        receiverName = doPodDetailDeliver.consigneeName;
        noteInternal = `Paket diterima oleh [${doPodDetailDeliver.consigneeName} - (${doPodDetailDeliver.reasonLast.reasonCode}) ${doPodDetailDeliver.reasonLast.reasonName}]; catatan: ${doPodDetailDeliver.descLast}`;
        notePublic = `Paket diterima oleh [${doPodDetailDeliver.consigneeName} - (${doPodDetailDeliver.reasonLast.reasonCode}) ${doPodDetailDeliver.reasonLast.reasonName}]`;
      } else {
        noteInternal = `Paket di kembalikan di ${cityName} [${branchName}] - (${doPodDetailDeliver.awbStatus.awbStatusName}) ${doPodDetailDeliver.awbStatus.awbStatusTitle}; catatan: ${
          doPodDetailDeliver.descLast
        }`;
        notePublic = `Paket di kembalikan di ${cityName} [${branchName}] - (${doPodDetailDeliver.awbStatus.awbStatusName}) ${doPodDetailDeliver.awbStatus.awbStatusTitle}`;
      }

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
        noteInternal,
        notePublic,
        receiverName,
        awbNote,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  // NOTE: general purpose (IN / OUT)
  public static async createJobByAwbUpdateStatus(
    awbItemId: number,
    awbStatusId: number,
    branchId: number,
    userId: number,
  ) {
    // TODO: need to be reviewed ??
    const noteInternal = ``;
    const notePublic = ``;

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
      noteInternal,
      notePublic,
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  // NOTE: ONLY awb status ANT
  public static async createJobByAwbDeliver(
    awbItemId: number,
    awbStatusId: number,
    branchId: number,
    userId: number,
    employeeIdDriver: number,
    employeeName: string,
  ) {
    const noteInternal = `Paket dibawa [SIGESIT - ${employeeName}]`;
    const notePublic = `Paket dibawa [SIGESIT - ${employeeName}]`;
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
      noteInternal,
      notePublic,
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  // NOTE: ONLY AWB_STATUS.IN_BRANCH
  public static async createJobByScanInAwbBranch(
    awbItemId: number,
    branchId: number,
    userId: number,
  ) {
    let branchName = 'Kantor Pusat';
    let cityName = 'Jakarta';
    const branch = await this.getDataBranchCity(branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district.city.cityName;
    }
    const noteInternal = `Paket telah di terima di ${cityName} [${branchName}]`;
    const notePublic = `Paket telah di terima di ${cityName} [${branchName}]`;

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
      noteInternal,
      notePublic,
    };
    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  private static async getDataAwbStatus(awbStatusId: number): Promise<AwbStatus> {
    const awbStatus = await AwbStatus.findOne({
      select: ['awbStatusId', 'awbVisibility', 'awbStatusTitle', 'awbStatusName', 'isProblem'],
      // cache: true,
      where: {
        awbStatusId,
        isDeleted: false,
      },
    });
    return awbStatus;
  }

  private static async getDataBranchCity(branchId: number): Promise<Branch> {
    const branchRepository = new OrionRepositoryService(Branch);
    const q = branchRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.district);

    q.select({
      branchId: true,
      branchCode: true,
      branchName: true,
      districtId: true,
      district: {
        cityId: true,
        city: {
          cityName: true,
        },
      },
    });
    q.where(e => e.branchId, w => w.equals(branchId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    return await q.exec();
  }
}
