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
import { User } from '../../../shared/orm-entity/user';
import { Reason } from '../../../shared/orm-entity/reason';
import { SharedService } from '../../../shared/services/shared.service';

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
    this.queue.process(10, async job => {
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
            branchIdNext: data.branchIdNext,
          });
          await transactionalEntityManager.insert(AwbHistory, awbHistory);

          // TODO: to comment update with trigger SQL
          // await transactionalEntityManager.update(AwbItemAttr, awbItemAttr.awbItemAttrId, {
          //   awbHistoryIdLast: awbHistory.awbHistoryId,
          //   updatedTime: data.timestamp,
          // });
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

  public static async createJobByScanOutAwbBranch(
    awbItemId: number,
    awbStatusId: number,
    branchId: number,
    userId: number,
    userIdDriver: number,
    branchIdNext: number,
  ) {
    // TODO: ONLY AWB OUT_BRANCH
    let branchName = 'Kantor Pusat';
    let branchNameNext = 'Pluit';
    let cityName = 'Jakarta';
    const branch = await SharedService.getDataBranchCity(branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district ? branch.district.city.cityName : '';
    }
    // branch next
    const branchNext = await SharedService.getDataBranchCity(branchIdNext);
    if (branchNext) {
      branchNameNext = branchNext.branchName;
    }

    let employeeIdDriver = null;
    let employeeNameDriver = '';
    const userDriverRepo = await this.getDataUserEmployee(userIdDriver);
    if (userDriverRepo) {
      employeeIdDriver = userDriverRepo.employeeId;
      employeeNameDriver = userDriverRepo.employee.employeeName;
    }
    const noteInternal = `Paket keluar dari ${cityName} [${branchName}] - Supir: ${employeeNameDriver}  ke ${branchNameNext}`;
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
      branchIdNext,
    };

    return DoPodDetailPostMetaQueueService.queue.add(obj);
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
    branchIdNext: number,
    branchNameNext: string,
    addTime?: number,
  ) {
    // TODO: ONLY OUT_HUB, OUT_BRANCH
    const noteInternal = `Paket keluar dari ${cityName} [${branchName}] - Supir: ${employeeNameDriver} ke ${branchNameNext}`;
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
      timestamp: addTime ? moment().add(addTime, "seconds").toDate() : moment().toDate(),
      noteInternal,
      notePublic,
      branchIdNext,
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
    const branch = await SharedService.getDataBranchCity(branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district ? branch.district.city.cityName : '';
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

  // MOBILE SYNC
  // #region mobile sync data
  public static async createJobByMobileSync(
    awbItemId: number,
    awbStatusId: number,
    userId: number,
    branchId: number,
    userIdCreated: number,
    employeeIdDriver: number,
    reasonId: number,
    descLast: string,
    consigneeName: string,
    awbStatusName: string,
    awbStatusCode: string,
  ) {
    // TODO: find awbStatusIdLastPublic on awb_status
    const awbStatusIdLastPublic = AWB_STATUS.ON_PROGRESS;
    const awbNote = descLast;
    // TODO: create note internal and note public ??
    let noteInternal = '';
    let notePublic = '';
    let receiverName = '';

    if (awbStatusId == AWB_STATUS.DLV) {
      // TODO: title case consigneeName
      receiverName = consigneeName;
      const reason = await Reason.findOne(reasonId);

      noteInternal = `Paket diterima oleh [${consigneeName} - (${reason.reasonCode}) ${reason.reasonName}]; catatan: ${descLast}`;
      notePublic = `Paket diterima oleh [${consigneeName} - (${reason.reasonCode}) ${reason.reasonName}]`;
    } else {
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      const branch = await SharedService.getDataBranchCity(branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district ? branch.district.city.cityName : '';
      }
      noteInternal = `Paket di kembalikan di ${cityName} [${branchName}] - (${awbStatusName}) ${awbStatusCode}; catatan: ${descLast}`;
      notePublic = `Paket di kembalikan di ${cityName} [${branchName}] - (${awbStatusName}) ${awbStatusCode}`;
    }

    // provide data
    const obj = {
      awbStatusId,
      awbStatusIdLastPublic,
      awbItemId,
      userId,
      branchId,
      userIdCreated,
      userIdUpdated: userIdCreated,
      employeeIdDriver,
      timestamp: moment().toDate(),
      noteInternal,
      notePublic,
      receiverName,
      awbNote,
    };

    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }

  public static async createJobV1MobileSync(
    awbItemId: number,
    awbStatusId: number,
    userId: number,
    branchId: number,
    userIdCreated: number,
    employeeIdDriver: number,
    reasonId: number,
    descLast: string,
    consigneeName: string,
    awbStatusName: string,
    awbStatusCode: string,
    historyDate: Date,
  ) {
    // TODO: find awbStatusIdLastPublic on awb_status
    const awbStatusIdLastPublic = AWB_STATUS.ON_PROGRESS;
    const awbNote = descLast;
    // TODO: create note internal and note public ??
    let noteInternal = '';
    let notePublic = '';
    let receiverName = '';

    if (awbStatusId == AWB_STATUS.DLV) {
      // TODO: title case consigneeName
      receiverName = consigneeName;
      const reason = await Reason.findOne(reasonId);

      noteInternal = `Paket diterima oleh [${consigneeName} - (${reason.reasonCode}) ${reason.reasonName}]; catatan: ${descLast}`;
      notePublic = `Paket diterima oleh [${consigneeName} - (${reason.reasonCode}) ${reason.reasonName}]`;
    } else {
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      const branch = await SharedService.getDataBranchCity(branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district ? branch.district.city.cityName : '';
      }
      noteInternal = `Paket di kembalikan di ${cityName} [${branchName}] - (${awbStatusName}) ${awbStatusCode}; catatan: ${descLast}`;
      notePublic = `Paket di kembalikan di ${cityName} [${branchName}] - (${awbStatusName}) ${awbStatusCode}`;
    }

    // provide data
    const obj = {
      awbStatusId,
      awbStatusIdLastPublic,
      awbItemId,
      userId,
      branchId,
      userIdCreated,
      userIdUpdated: userIdCreated,
      employeeIdDriver,
      timestamp: moment(historyDate).toDate(),
      noteInternal,
      notePublic,
      receiverName,
      awbNote,
    };

    return DoPodDetailPostMetaQueueService.queue.add(obj);
  }
  // #endregion mobile sync data ===============================================

  // TODO: need refactoring
  // Manual POD Sync
  // deprecated method to be removed
  public static async createJobByManualPodSync(
    doPodDeliverDetailId: string,
    userId: number,
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
        userIdDriver: true,
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
      let employeeName = '';
      const userDriverRepo = await this.getDataUserEmployee(
        userId,
      );
      if (userDriverRepo) {
        employeeName = userDriverRepo.employee.employeeName;
      }
      const desc = `${doPodDetailDeliver.descLast} (Status Manual by ${employeeName})`;

      if (doPodDetailDeliver.awbStatusIdLast == AWB_STATUS.DLV) {
        // TODO: title case consigneeName
        receiverName = doPodDetailDeliver.consigneeName;
        noteInternal = `Paket diterima oleh [${doPodDetailDeliver.consigneeName} - (${doPodDetailDeliver.reasonLast.reasonCode}) ${doPodDetailDeliver.reasonLast.reasonName}]; catatan: ${desc}`;
        notePublic = `Paket diterima oleh [${doPodDetailDeliver.consigneeName} - (${doPodDetailDeliver.reasonLast.reasonCode}) ${doPodDetailDeliver.reasonLast.reasonName}]`;
      } else {
        let branchName = 'Kantor Pusat';
        let cityName = 'Jakarta';
        const branch = await SharedService.getDataBranchCity(
          doPodDetailDeliver.doPodDeliver.branchId,
        );
        if (branch) {
          branchName = branch.branchName;
          cityName = branch.district ? branch.district.city.cityName : '';
        }
        noteInternal = `Paket di kembalikan di ${cityName} [${branchName}] - (${doPodDetailDeliver.awbStatus.awbStatusName}) ${doPodDetailDeliver.awbStatus.awbStatusTitle}; catatan: ${desc}`;
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
        employeeIdDriver: null,
        timestamp: moment().toDate(),
        noteInternal,
        notePublic,
        receiverName,
        awbNote,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  }

  public static async createJobByManualSync(
    awbItemId: number,
    awbStatusId: number,
    userId: number,
    branchId: number,
    userIdCreated: number,
    reasonId: number,
    descLast: string,
    consigneeName: string,
    awbStatusName: string,
    awbStatusCode: string,
  ) {
      // TODO: find awbStatusIdLastPublic on awb_status
      const awbStatusIdLastPublic = AWB_STATUS.ON_PROGRESS;
      const awbNote = descLast;
      // TODO: create note internal and note public ??
      let noteInternal = '';
      let notePublic = '';
      let receiverName = '';
      let employeeName = 'Admin';
      const userDriverRepo = await this.getDataUserEmployee(userId);
      if (userDriverRepo) {
        employeeName = userDriverRepo.employee.employeeName;
      }
      const desc = `${descLast} (Status Manual by ${employeeName})`;

      if (awbStatusId == AWB_STATUS.DLV) {
        // TODO: title case consigneeName
        receiverName = consigneeName;
        const reason = await Reason.findOne(reasonId);

        noteInternal = `Paket diterima oleh [${consigneeName} - (${
          reason.reasonCode
        }) ${reason.reasonName}]; catatan: ${desc}`;
        notePublic = `Paket diterima oleh [${consigneeName} - (${
          reason.reasonCode
        }) ${reason.reasonName}]`;
      } else {
        let branchName = 'Kantor Pusat';
        let cityName = 'Jakarta';
        const branch = await SharedService.getDataBranchCity(branchId);
        if (branch) {
          branchName = branch.branchName;
          cityName = branch.district ? branch.district.city.cityName : '';
        }
        noteInternal = `Paket di kembalikan di ${cityName} [${branchName}] - (${
          awbStatusName
        }) ${awbStatusCode}; catatan: ${desc}`;
        notePublic = `Paket di kembalikan di ${cityName} [${branchName}] - (${
          awbStatusName
        }) ${awbStatusCode}`;
      }

      // provide data
      const obj = {
        awbStatusId,
        awbStatusIdLastPublic,
        awbItemId,
        userId,
        branchId,
        userIdCreated,
        userIdUpdated: userIdCreated,
        employeeIdDriver: null,
        timestamp: moment().toDate(),
        noteInternal,
        notePublic,
        receiverName,
        awbNote,
      };

      return DoPodDetailPostMetaQueueService.queue.add(obj);
    }

  // Manual POD Sync
  public static async createJobByManualStatus(
    awbItemId: number,
    awbStatusId: number,
    userId: number,
    branchId: number,
    reasonNote: string,
  ) {
    // TODO: find awbStatusIdLastPublic on awb_status
    const awbStatusIdLastPublic = AWB_STATUS.ON_PROGRESS;
    const awbNote = reasonNote;

    let noteInternal = '';
    let notePublic = '';
    let employeeName = '';
    const userDriverRepo = await this.getDataUserEmployee(
      userId,
    );
    if (userDriverRepo) {
      employeeName = userDriverRepo.employee.employeeName;
    }
    const desc = `${reasonNote} (Status Manual by ${employeeName})`;

    let branchName = 'Kantor Pusat';
    let cityName = 'Jakarta';
    const branch = await SharedService.getDataBranchCity(
      branchId,
    );
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district ? branch.district.city.cityName : '';
    }
    const awbStatus = await this.getDataAwbStatus(awbStatusId);
    if (awbStatus) {
      // awbStatusIdLastPublic = ??; // is final or is public
      noteInternal = `Paket di kembalikan di ${cityName} [${branchName}] - (${awbStatus.awbStatusName}) ${awbStatus.awbStatusTitle}; catatan: ${desc}`;
      notePublic = `Paket di kembalikan di ${cityName} [${branchName}] - (${awbStatus.awbStatusName}) ${awbStatus.awbStatusTitle}`;
    }

    // provide data
    const obj = {
      awbStatusId,
      awbStatusIdLastPublic,
      awbItemId,
      userId,
      branchId,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
      timestamp: moment().toDate(),
      noteInternal,
      notePublic,
      awbNote,
    };

    return DoPodDetailPostMetaQueueService.queue.add(obj);
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
    const branch = await SharedService.getDataBranchCity(branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district ? branch.district.city.cityName : '';
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

  // TODO: need refactoring
  private static async getDataUserEmployee(userId: number): Promise<User> {
    const userhRepository = new OrionRepositoryService(User);
    const q = userhRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.employee);
    q.select({
      userId: true,
      username: true,
      employee: {
        employeeId: true,
        employeeName: true,
      },
    });
    q.where(e => e.userId, w => w.equals(userId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    return await q.exec();
  }

  private static async getDataAwbStatus(awbStatusId: number): Promise<AwbStatus> {
    const awbStatus = await AwbStatus.findOne({
      where: {
        awbStatusId,
        isDeleted: false,
      },
    });
    return awbStatus;
  }

}
