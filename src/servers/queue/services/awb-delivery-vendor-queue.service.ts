import moment = require('moment');
import { getManager } from 'typeorm';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { AwbStatus } from '../../../shared/orm-entity/awb-status';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { ConfigService } from '../../../shared/services/config.service';
import { OrionRepositoryService } from '../../../shared/services/orion-repository.service';
import { QueueBullBoard } from './queue-bull-board';
import { User } from '../../../shared/orm-entity/user';
import { Reason } from '../../../shared/orm-entity/reason';
import { SharedService } from '../../../shared/services/shared.service';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';
import { VendorLogisticService } from '../../../shared/services/vendor.logistic.service';

export class AwbDeliveryVendorQueueService {
  public static queue = QueueBullBoard.createQueue.add('awb-vendor', {
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
      try {
        const data = job.data;
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
            // employeeIdDriver: data.employeeIdDriver,
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
          // try{
          //   VendorLogisticService.sendVendor(awbItemAttr.awbNumber, data.vendorId, data.orderVendorCode, data.userId, data.tokenPayload);
          // }catch(err){
          //   console.error(`[awb-history-while-send-vendor-queue] `, err);
          //   throw err;
          // }
        }
      // }); // end transaction
      } catch (error) {
        console.error(`[awb-history-vendor-queue] `, error);
        throw error;
      }

    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      PinoLoggerService.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      PinoLoggerService.log(`Cleaned ${job.length} ${type} jobs`);
    });
  }

  // NOTE: ONLY awb status ANT but by vendor
  public static async createJobSendVendor(
    awbItemId: number,
    awbStatusId: number,
    branchId: number,
    userId: number,
    vendorName: string,
    vendorId : string,
    orderVendorCode : string,
    tokenPayload : string
  ) {
    const noteInternal = `Pengiriman dilanjutkan oleh ${vendorName}`;
    const notePublic = `Pengiriman dilanjutkan oleh ${vendorName}`;
    // provide data
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      timestamp: moment().toDate(),
      noteInternal,
      notePublic,
      vendorId,
      orderVendorCode,
      tokenPayload
    };
    return AwbDeliveryVendorQueueService.queue.add(obj);
  }

  public static async createJobInserTracking(
    awbItemId: number,
    awbStatusId: number,
    noteInternal: string,
    notePublic :string,
    latitude: string,
    longitude: string,
    branchId : number,
    userId : number
  ){
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      timestamp: moment().toDate(),
      noteInternal,
      notePublic,
      longitude,
      latitude
    };
    return AwbDeliveryVendorQueueService.queue.add(obj);
  }
}