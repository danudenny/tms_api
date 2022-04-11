import moment = require('moment');
import { getManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { SharedService } from '../../../shared/services/shared.service';

export class DoSmdPostAwbHistoryMetaQueueService {
  public static queue = QueueBullBoard.createQueue.add('awb-history-post-meta', {
    defaultJobOptions: {
      timeout: 0,
      attempts: Math.round(
        (+ConfigService.get('queue.doSmdDetailPostMeta.keepRetryInHours') *
          60 *
          60 *
          1000) /
          +ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
      ),
      backoff: {
        type: 'fixed',
        delay: ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
      },
    },
  });

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(10, async job => {
      try {
        const data = job.data;
        Logger.log('### JOB ID =========', job.id);
        // await getManager().transaction(async transactionalEntityManager => {
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
              latitude: data.latitude,
              longitude: data.longitude,
              reasonId: data.reasonId,
              reasonName: data.reasonName,
              location: data.location,
            });
            await AwbHistory.insert(awbHistory);
            // await transactionalEntityManager.insert(AwbHistory, awbHistory);

            // TODO: to comment update with trigger SQL
            // await transactionalEntityManager.update(AwbItemAttr, awbItemAttr.awbItemAttrId, {
            //   awbHistoryIdLast: awbHistory.awbHistoryId,
            //   updatedTime: data.timestamp,
            // });
          }
        // }); // end transaction
      } catch (error) {
        console.error(`[awb-history-post-meta] `, error);
        throw error;
      }

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

  // NOTE: same provide data
  // use on batch from bag service ??
  public static async createJobByScanInBag(
    awbItemId: number,
    branchId: number,
    userId: number,
    employeeIdDriver: number,
    awbStatusId: number,
    branchName: string,
    cityName: string,
    branchIdNext: number,
    addTime?: number,
  ) {
    // TODO: ONLY DO_HUB
    const noteInternal = `Paket masuk ke ${cityName} [${branchName}]`;
    const notePublic = null;

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
      timestamp: addTime ? moment().add(addTime, 'minutes').toDate() : moment().toDate(),
      noteInternal,
      notePublic,
      branchIdNext,
    };

    return DoSmdPostAwbHistoryMetaQueueService.queue.add(obj);
  }

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
    // TODO: OUT_HUB
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
      timestamp: addTime ? moment().add(addTime, 'minutes').toDate() : moment().toDate(),
      noteInternal,
      notePublic,
      branchIdNext,
    };

    return DoSmdPostAwbHistoryMetaQueueService.queue.add(obj);
  }

  public static async createJobByScanDoSmd(
    awbItemId: number,
    branchId: number,
    userId: number,
    awbStatusId: number,
  ) {
    // TODO: ONLY IN_HUB
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
      awbStatusId,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
      timestamp: moment().toDate(),
      noteInternal,
      notePublic,
      branchIdNext: null,
    };
    return DoSmdPostAwbHistoryMetaQueueService.queue.add(obj);
  }

  public static async createJobByVendorSmd(
    awbItemId: number,
    branchId: number,
    userId: number,
    awbStatusId: number,
    vendorName: string,
    date?: Date,
  ) {
    // TODO: ONLY OUT_HUB GSK
    let branchName = 'Kantor Pusat';
    let cityName = 'Jakarta';
    const branch = await SharedService.getDataBranchCity(branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district ? branch.district.city.cityName : '';
    }
    const noteInternal = `Paket keluar dari ${cityName} [${branchName}] - Vendor: ${vendorName}`;
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
      employeeIdDriver: null,
      timestamp: date ? date : moment().toDate(),
      noteInternal,
      notePublic,
      branchIdNext: null,
    };
    return DoSmdPostAwbHistoryMetaQueueService.queue.add(obj);
  }
}
