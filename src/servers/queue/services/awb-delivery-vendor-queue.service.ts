import moment = require('moment');
import { getManager } from 'typeorm';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { Awb } from '../../../shared/orm-entity/awb';
import { PickupRequestDetail } from '../../../shared/orm-entity/pickup-request-detail';
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
import { AwbCodService } from '../../main/services/cod/awb-cod.service';
import { DoPodDeliver } from '../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverAttachment } from '../../../shared/orm-entity/do_pod_deliver_attachment';

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
            awbNumber: data.awbNumber,
            isDeleted: false,
          },
        });
        // TODO: to be fixed create data awb history
        if (awbItemAttr) {
          // NOTE: Insert Data awb history
          const awbHistory = AwbHistory.create({
            awbItemId: awbItemAttr.awbItemId,
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

          let idAttachmentPhoto = null;
          let idAttachmentSignature = null;
          if(data.urlPhoto){
            if(data.awbStatusId == AWB_STATUS.DLV || data.awbStatusId == AWB_STATUS.BA){
              //handle upload photo
              idAttachmentPhoto = await this.uploadPhotoVendor(data.urlPhoto, awbItemAttr.awbNumber, awbItemAttr.awbItemId, data.awbStatusId, 'photo')
              idAttachmentSignature = await this.uploadPhotoVendor(data.urlPhotoSignature, awbItemAttr.awbNumber, awbItemAttr.awbItemId, data.awbStatusId, 'signature')
            }
          }
          
          if(data.awbStatusId == AWB_STATUS.DLV && data.isCod){
            const pickupRequestDetail = await PickupRequestDetail.findOne({
              where: {
                refAwbNumber: awbItemAttr.awbNumber,
                isDeleted: false,
              },
            });

            if(Number(pickupRequestDetail.codValue) > 0){
              //check and insert doPodDeliver
              let doPodDeliverID = null;
              let doPodDeliverDetailID = null;
      
              let dataPodDeliver = await DoPodDeliver.findOne({
                where:{
                  doPodDeliverCode : data.orderVendorCode,
                  isDeleted : false
                }
              })
               
              if(!dataPodDeliver){
                const doPod = DoPodDeliver.create();
                const doPodDateTime = moment().toDate();
                doPod.doPodDeliverCode = data.orderVendorCode;
                doPod.userIdDriver = data.userId;
                doPod.doPodDeliverDateTime = doPodDateTime;
                doPod.doPodDeliverDate = doPodDateTime;
                doPod.description = null;
                doPod.branchId = data.branchId;
                doPod.isPartner = true;
                doPod.userIdCreated = data.userId;
                doPod.userIdUpdated = data.userId;
                await DoPodDeliver.save(doPod);
                doPodDeliverID = doPod.doPodDeliverId;
              }else{
                doPodDeliverID = dataPodDeliver.doPodDeliverId;
              }
      
              let dataPodDeliverDetail = await DoPodDeliverDetail.findOne({
                where:{
                  doPodDeliverId : doPodDeliverID,
                  awbId : awbItemAttr.awbId,
                  isDeleted : false
                }
              })
      
              if(dataPodDeliverDetail){
                doPodDeliverDetailID = dataPodDeliverDetail.doPodDeliverDetailId;
              }else{
                //insert datanya
                const uuidv1 = require('uuid/v1');
                const uuidFix = uuidv1();
                const doPodDeliverDetail = DoPodDeliverDetail.create();
                doPodDeliverDetail.doPodDeliverDetailId = uuidFix;
                doPodDeliverDetail.doPodDeliverId = doPodDeliverID;
                doPodDeliverDetail.awbId = awbItemAttr.awbId;
                doPodDeliverDetail.awbItemId = awbItemAttr.awbItemId;
                doPodDeliverDetail.awbNumber = awbItemAttr.awbNumber;
                doPodDeliverDetail.awbStatusIdLast = data.awbStatusId;
                doPodDeliverDetail.userIdCreated = data.userId;
                doPodDeliverDetail.userIdUpdated = data.userId;
      
                await DoPodDeliverDetail.save(doPodDeliverDetail);
                doPodDeliverDetailID = doPodDeliverDetail.doPodDeliverDetailId;

                const doPodDeliverAttachment = await DoPodDeliverAttachment.create();
                doPodDeliverAttachment.doPodDeliverDetailId = doPodDeliverDetailID;
                doPodDeliverAttachment.attachmentTmsId = idAttachmentPhoto;
                doPodDeliverAttachment.type = 'photo';
                doPodDeliverAttachment.userIdCreated = data.userId;
                doPodDeliverAttachment.userIdUpdated = data.userId;
                await DoPodDeliverAttachment.save(doPodDeliverAttachment);

                const doPodDeliverAttachmentSignature = await DoPodDeliverAttachment.create();
                doPodDeliverAttachmentSignature.doPodDeliverDetailId = doPodDeliverDetailID;
                doPodDeliverAttachmentSignature.attachmentTmsId = idAttachmentSignature;
                doPodDeliverAttachmentSignature.type = 'signature';
                doPodDeliverAttachmentSignature.userIdCreated = data.userId;
                doPodDeliverAttachmentSignature.userIdUpdated = data.userId;
                await DoPodDeliverAttachment.save(doPodDeliverAttachmentSignature);
              }
      
              await AwbCodService.transfer(
                {
                  doPodDeliverDetailId: doPodDeliverDetailID,
                  awbNumber: awbItemAttr.awbNumber,
                  awbItemId: awbItemAttr.awbItemId,
                  amount: Number(pickupRequestDetail.codValue),
                  method: 'cash',
                  service: null,
                  noReference: null,
                  note: null,
                },
                data.branchId,
                data.userId,
                null,
              );
            }
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
    awbNumber: string,
    awbStatusId: number,
    branchId: number,
    userId: number,
    vendorName: string,
    vendorId : string,
    orderVendorCode : string,
    tokenPayload : string,
    keterangan : string
  ) {
    const noteInternal = `Pengiriman dilanjutkan oleh ${vendorName}; catatan :${keterangan}`;
    const notePublic = `Paket di teruskan ke Partner`;
    // provide data
    const obj = {
      awbNumber,
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
    awbNumber: string,
    awbStatusId: number,
    noteInternal: string,
    notePublic :string,
    latitude: string,
    longitude: string,
    branchId : number,
    userId : number,
    urlPhoto : string,
    urlPhotoSignature : string,
    urlPhotoRetur : string,
    orderVendorCode : string = null,
    isCod : boolean = false,
    codValue : number = 0,
  ){

    const obj = {
      awbNumber,
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
      urlPhotoRetur,
      orderVendorCode,
      isCod,
      codValue
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
      //upload for partner | data not save to DB
      const awsKey = `attachments/${photoType}POD/${awbNumber}`;
      await AwsS3Service.uploadFromUrlV2( 
        url,
        awsKey,
      );

      //upload for internal pod | data save to DB
      const pathId = `tms-delivery-${photoType}`;
      const uuidv1 = require('uuid/v1');
      const fileName = await uuidv1();
      const awsKeyInternal = `attachments/${pathId}/${moment().format('Y/M/D')}/${fileName}`;
      const response = await AwsS3Service.uploadFromUrlV2( 
        url,
        awsKeyInternal,
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
        attachmentName: fileName,
        fileName: fileName,
        url : `https://${bucketName}.s3.amazonaws.com/${awsKeyInternal}`,
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
      return saveAttachment.attachmentTmsId;
    }
}