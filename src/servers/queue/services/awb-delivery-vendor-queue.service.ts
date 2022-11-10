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
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { AttachmentTms } from '../../../shared/orm-entity/attachment-tms';
import { FILE_PROVIDER } from '../../../shared/constants/file-provider.constant';
import { PodWebAttachmentModel } from '../../../shared/models/pod-web-attachment.model';
import { PodAttachment } from '../../../shared/services/pod-attachment';

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

          if(data.awbStatusId == AWB_STATUS.DLV || data.awbStatusId == AWB_STATUS.BA){
            //handle upload photo
            this.uploadPhotoVendor(data.urlPhoto, awbItemAttr.awbNumber, data.awbItemId, data.awbStatusId, 'photo')
            this.uploadPhotoVendor(data.urlPhotoSignature, awbItemAttr.awbNumber, data.awbItemId, data.awbStatusId, 'signature')
          }

          // try{
          //   VendorLogisticService.sendVendor(awbItemAttr.awbNumber, data.vendorId, data.orderVendorCode, data.userId, data.tokenPayload);
          // }catch(err){
          //   console.error(`[awb-history-while-send-vendor-queue] `, err);
          //   throw err;
          // }
        }
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
    tokenPayload : string,
    keterangan : string
  ) {
    const noteInternal = `Pengiriman dilanjutkan oleh ${vendorName}`;
    const notePublic = `Paket di teruskan ke Partner; catatan :${keterangan}`;
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
    userId : number,
    urlPhoto : string,
    urlPhotoSignature : string,
    urlPhotoRetur : string
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
      latitude,
      urlPhoto,
      urlPhotoSignature,
      urlPhotoRetur
    };
    return AwbDeliveryVendorQueueService.queue.add(obj);
  }

  static async uploadPhotoVendor(
    url : string, 
    awbNumber : string, 
    awbItemId : number, 
    awbStatusId : number,
    photoType: string, 
    )
    {
      const awsKey = `attachments/${photoType}POD/${awbNumber}`;
      const response = await AwsS3Service.uploadFromUrlV2(
        url,
        awsKey,
      );
      const fileMime = response.res.headers['content-type'];

      let bucketName = null;
      if (!bucketName && ConfigService.has('cloudStorage.cloudBucket')) {
        bucketName = ConfigService.get('cloudStorage.cloudBucket');
      }

      const attachment = AttachmentTms.create({
        s3BucketName: bucketName,
        fileMime,
        fileProvider: FILE_PROVIDER.AWS_S3,
        attachmentPath: response.awsKey,
        attachmentName: awbNumber,
        fileName: awbNumber,
        url : `https://${bucketName}.s3.amazonaws.com/${awsKey}`,
        userIdCreated: 1,
        userIdUpdated: 1,
      });

      let saveAttachment = await AttachmentTms.save(attachment);

      if (saveAttachment) {
        let propUpload = new PodWebAttachmentModel();
        propUpload.awbNumber = awbNumber;
        propUpload.awbItemId = awbItemId;
        propUpload.attachmentTmsId =  saveAttachment.attachmentTmsId;
        propUpload.awbStatusId = awbStatusId;
        propUpload.photoType = photoType;
        propUpload.userIdCreated = 1;
        propUpload.userIdUpdated = 1;
        await PodAttachment.upsertPodAttachment(propUpload, true);
      }
    }
}