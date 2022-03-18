import moment = require('moment');
import { last } from 'lodash';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { createQueryBuilder, getManager, LessThan, MoreThan } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  MobileScanAwbReturnPayloadVm,
  MobileSyncReturnImageDataPayloadVm,
  MobileSyncReturnPayloadVm,
  PhotoReturnDetailVm
} from '../../models/first-mile/do-pod-return-payload.vm';
import {
  MobileCreateDoPodResponseVm,
  MobileInitDataReturnResponseVm,
  MobileReturnVm,
  MobileScanAwbReturnResponseVm,
  MobileScanAwbReturnVm,
  MobileSyncAwbReturnVm,
  MobileSyncDataReturnResponseVm,
  MobileSyncReturnImageDataResponseVm,
} from '../../models/first-mile/do-pod-return-response.vm';
import { PhotoResponseVm } from '../../models/bag-order-detail-response.vm';
import { DoPodReturnService } from '../master/do-pod-return.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { DoPodReturnDetailService } from '../master/do-pod-return-detail.service';
import { DoPodDetailPostMetaQueueService } from '../../../../servers/queue/services/do-pod-detail-post-meta-queue.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoPodReturnDetail } from '../../../../shared/orm-entity/do-pod-return-detail';
import { AwbReturnService } from '../master/awb-return.service';
import { AwbNotificationMailQueueService } from '../../../../servers/queue/services/notification/awb-notification-mail-queue.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { UploadImagePodQueueService } from '../../../../servers/queue/services/upload-pod-image-queue.service';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { DoPodReturn } from '../../../../shared/orm-entity/do-pod-return';
import { AttachmentTms } from '../../../../shared/orm-entity/attachment-tms';
import { DoPodReturnAttachment } from '../../../../shared/orm-entity/do-pod-return-attachment';
import { DoPodReturnHistory } from '../../../../shared/orm-entity/do-pod-return-history';
import { AwbStatusService } from '../master/awb-status.service';
import { ImgProxyHelper } from '../../../../shared/helpers/imgproxy-helper';

export class MobileFirstMileDoPodReturnService {

  static async createDoPodReturn(): Promise<MobileCreateDoPodResponseVm> {
    const result = new MobileCreateDoPodResponseVm();

    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // create do_pod_return (jalan Antar Retur Sigesit)
    const doPodReturn = await DoPodReturnService.createDoPodReturn(
      authMeta.userId,
      null,
      permissonPayload.branchId,
      authMeta.userId,
      true,
    );

    await DoPodReturnService.createAuditReturnHistory(doPodReturn.doPodReturnId, false);

    result.status = 'ok';
    result.message = 'Surat Jalan Berhasil dibuat';
    result.doPodReturnId = doPodReturn.doPodReturnId;
    return result;
  }

  static async scanAwbReturnMobile(
    payload: MobileScanAwbReturnPayloadVm,
  ): Promise<MobileScanAwbReturnResponseVm> {
    const result = new MobileScanAwbReturnResponseVm();
    const response = new MobileScanAwbReturnVm();

    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbNumber = payload.awbNumber;

    const qb = createQueryBuilder();
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');
    qb.addSelect('aia.awb_item_id', 'awbItemId');
    qb.addSelect('aia.awb_id', 'awbId');
    qb.addSelect('aia.awb_status_id_last', 'awbStatusIdLast');
    qb.from('awb_item_attr', 'aia');
    qb.innerJoin(
      'awb',
      'awb',
      'aia.awb_id = awb.awb_id AND awb.is_deleted = false',
    );
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id AND pt.is_deleted = false',
    );
    qb.andWhere('aia.is_deleted = false');
    qb.andWhere('aia.awb_number = :awbNumber', {
      awbNumber,
    });
    const awb = await qb.getRawOne();

    const doPodReturn = await DoPodReturnService.byIdCache(
      payload.doPodReturnId,
    );
    if (!doPodReturn) {
      throw new BadRequestException('Surat Jalan tidak valid!');
    }

    response.status = 'error';
    response.awbNumber = awbNumber;
    response.trouble = true;

    if (awb) {
      const checkValidAwbStatusIdLast = await AwbStatusService.checkValidAwbStatusIdLast(awb, true, true, false);
      if (checkValidAwbStatusIdLast.isValid) {
        // Add Locking setnx redis
        const holdRedis = await RedisService.lockingWithExpire(
          `hold:scanoutant:${awb.awbItemId}`,
          'locking',
          60,
        );

        if (holdRedis) {
          try {
            await getManager().transaction(async transactionManager => {
              // save table do_pod_return_detail
              await DoPodReturnDetailService.createDoPodReturnDetail(
                payload.doPodReturnId,
                awb,
                awbNumber,
                transactionManager,
              );

              // counter total scan out
              const totalSuccess = doPodReturn.totalAwb + 1;
              await DoPodReturnService.updateTotalAwbById(
                doPodReturn.totalAwb,
                totalSuccess,
                doPodReturn.doPodReturnId,
              );

              // NOTE: queue by Bull ANT
              DoPodDetailPostMetaQueueService.createJobByAwbReturn(
                awb.awbItemId,
                AWB_STATUS.ANT,
                permissonPayload.branchId,
                authMeta.userId,
                authMeta.employeeId,
                authMeta.displayName,
              );

            }); // end transaction

            response.status = 'ok';
            response.trouble = false;

            result.service = awb.service;
            result.awbNumber = awb.awbNumber;
            result.consigneeName = awb.consigneeName;
            result.consigneeAddress = awb.consigneeAddress;
            result.consigneePhone = awb.consigneePhone;
            result.totalCodValue = awb.totalCodValue;
            result.dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            result.doPodReturnId = payload.doPodReturnId;
          } catch (e) {
            response.status = 'error';
            response.message = `Gangguan Server: ${e.message}`;
          }

          // remove key holdRedis
          RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
        } else {
          response.status = 'error';
          response.message = `Server Busy: Resi ${awbNumber} sudah di proses.`;
        }
      } else {
        response.status = 'error';
        response.message = checkValidAwbStatusIdLast.message;
      }

      result.data = response;
      return result;
    } else {
      response.message = 'Nomor tidak valid atau tidak ditemukan';
      result.data = response;
      return result;
    }
  }

  static async getInitDataReturn(
    dateFrom?: string,
    awbNumber?: string,
  ): Promise<MobileInitDataReturnResponseVm> {
    const result = new MobileInitDataReturnResponseVm();
    result.returnsData = await this.getReturnDetail(dateFrom, null, awbNumber, true);
    result.serverDateTime = moment().format();
    return result;
  }

  static async historyReturn(
    dateFrom?: string,
    dateTo?: string,
  ): Promise<MobileInitDataReturnResponseVm> {
    const result = new MobileInitDataReturnResponseVm();
    result.returnsData = await this.getReturnDetail(dateFrom, dateTo, null, false);
    result.serverDateTime = moment().format();
    return result;
  }

  static async syncByRequest(
    payload: MobileSyncReturnPayloadVm,
  ): Promise<MobileSyncDataReturnResponseVm> {
    const result = new MobileSyncDataReturnResponseVm();
    const dataItem: MobileSyncAwbReturnVm[] = [];
    for (const returnData of payload.returnsData) {
      // Locking redis
      const holdRedis = await RedisService.redlock(
        `hold:mobileSync:${returnData.awbNumber}`,
        10,
      );
      const response = {
        process: false,
        message: 'Data Not Valid',
      };

      if (holdRedis) {
        const process = await this.syncReturn(returnData);
        if (process) {
          response.process = process;
          response.message = 'Success';
        }
        // remove key holdRedis
        RedisService.del(`hold:mobileSync:${returnData.awbNumber}`);
      }

      // push item
      dataItem.push({
        awbNumber: returnData.awbNumber,
        ...response,
      });

    } // endof loop

    result.data = dataItem;
    return result;
  }

  static async syncImageData(
    payload: MobileSyncReturnImageDataPayloadVm,
    file,
  ): Promise<MobileSyncReturnImageDataResponseVm> {
    const result = new MobileSyncReturnImageDataResponseVm();

    let url = null;
    let attachmentId = null;

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      },
      lock: { mode: 'pessimistic_write' },
    });

    if (attachment) {
      // attachment exist
      attachmentId = attachment.attachmentTmsId;
      url = attachment.url;
    } else {
      // upload image
      const pathId = `tms-delivery-${payload.imageType}`;
      attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        pathId,
      );
      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
        url = attachment.url;
      }
    }

    // NOTE: insert data array
    let total = 0;
    if (attachmentId && payload.data) {
      const data = payload.data.split(';');
      for (const item of data) {
        if (item) {
          const doPodReturnAttachment = await DoPodReturnAttachment.create();
          doPodReturnAttachment.doPodReturnDetailId = item;
          doPodReturnAttachment.attachmentTmsId = attachmentId;
          doPodReturnAttachment.type = payload.imageType;
          await DoPodReturnAttachment.save(doPodReturnAttachment);

          // send to background reupload s3 with awb number
          UploadImagePodQueueService.perform(
            item,
            url,
            payload.imageType,
          );
          total += 1;
        }
      }
    } else {
      PinoLoggerService.log('#### Payload Data Not Valid : ', payload.data);
    }

    result.url = url;
    result.attachmentId = attachmentId;
    result.totalData = total;
    return result;
  }

  static async getHistoryReturnDetail(doPodReturnrDetailId: string) {
    const repo = new OrionRepositoryService(DoPodReturnHistory, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.do_pod_return_history_id', 'doPodReturnHistoryId'],
      ['t1.history_date_time', 'historyDateTime'],
      ['t1.desc', 'desc'],
      ['t1.awb_status_id', 'awbStatusId'],
      ['t1.latitude_return', 'latitudeReturn'],
      ['t1.longitude_return', 'longitudeReturn'],
      ['t2.reason_id', 'reasonId'],
      ['t2.reason_code', 'reasonCode'],
      ['t4.employee_id', 'employeeId'],
      ['t4.fullname', 'employeeName'],
      ['t3.awb_status_name', 'awbStatusCode'],
      ['t3.awb_status_title', 'awbStatusName'],
    );

    q.leftJoin(e => e.reason, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbStatus, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.employee, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.doPodReturnDetailId, w => w.equals(doPodReturnrDetailId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    return await q.exec();
  }

  static async getPhotoReturnDetail(
    payload: PhotoReturnDetailVm
  ): Promise<PhotoResponseVm> {
    const result = new PhotoResponseVm();
    result.data = await DoPodReturnDetailService.getPhotoDetail(payload.doPodReturnDetailId, payload.attachmentType);
    for(let i = 0; i < result.data.length; i++){
      result.data[i].url = ImgProxyHelper.sicepatProxyUrl(result.data[i].url);
    }
    return result;
  }

  private static async getReturnDetail(
    payloadDateFrom?: string,
    payloadDateTo?: string,
    awbNumber?: string,
    isHistoryReturn?: boolean) {
    const authMeta = AuthService.getAuthMetadata();


    const qb = createQueryBuilder();
    qb.addSelect('t1.do_pod_return_detail_id', 'doPodReturnDetailId');
    qb.addSelect('t1.awb_item_id', 'awbItemId');
    qb.addSelect('t1.awb_status_date_time_last', 'awbStatusDateTimeLast');
    qb.addSelect('t1.consignee_name', 'consigneeNameNote');
    qb.addSelect('t1.desc_last', 'reasonNotes');
    qb.addSelect('t2.do_pod_return_id', 'doPodReturnId');
    qb.addSelect('t2.do_pod_return_date_time', 'doPodReturnDateTime');
    qb.addSelect('t3.awb_id', 'awbId');
    qb.addSelect('t3.awb_date', 'awbDate');
    qb.addSelect('t3.awb_number', 'awbNumber');
    qb.addSelect('t3.ref_customer_account_id', 'merchant');
    qb.addSelect('t3.consignee_name', 'consigneeName');
    qb.addSelect('t3.consignee_address', 'consigneeAddress');
    qb.addSelect('t3.notes', 'consigneeNote');
    qb.addSelect('t3.consignee_phone', 'consigneeNumber');
    qb.addSelect('t3.total_cod_value', 'totalCodValue');
    qb.addSelect('t3.is_cod', 'isCOD');
    qb.addSelect(`COALESCE(t4.is_high_value, t8.is_high_value, false)`, 'isHighValue');
    qb.addSelect('t5.awb_status_id', 'awbStatusId');
    qb.addSelect('t5.awb_status_name', 'awbStatusName');
    qb.addSelect('t6.employee_id', 'employeeId');
    qb.addSelect('t6.fullname', 'employeeName');
    qb.addSelect('t7.package_type_name', 'packageTypeName');
    qb.addSelect('t8.recipient_longitude', 'longitudeReturn');
    qb.addSelect('t8.recipient_latitude', 'latitudeReturn');
    qb.addSelect('t8.do_return', 'isDoReturn');
    qb.addSelect('t8.do_return_number', 'doReturnNumber');
    qb.addSelect('t9.reason_id', 'reasonId');
    qb.addSelect('t9.reason_code', 'reasonCode');
    qb.addSelect('t9.reason_name', 'reasonName');

    qb.from('do_pod_return_detail', 't1');
    qb.innerJoin(
      'do_pod_return',
      't2',
      't2.do_pod_return_id = t1.do_pod_return_id AND t2.is_deleted = false',
      );
    qb.innerJoin(
      'awb',
      't3',
      't3.awb_id = t1.awb_id AND t3.is_deleted = false',
      );
    qb.innerJoin(
      'awb_item_attr',
      't4',
      't4.awb_item_id = t1.awb_item_id AND t4.is_deleted = false',
      );
    qb.innerJoin(
      'awb_status',
      't5',
      't5.awb_status_id = t4.awb_status_id_last AND t5.is_deleted = false',
      );
    qb.innerJoin(
      'users',
      'users',
      'users.user_id = t2.user_id_driver',
      );
    qb.innerJoin(
      'employee',
      't6',
      't6.employee_id = users.employee_id AND t6.is_deleted = false',
      );
    qb.leftJoin(
      'package_type',
      't7',
      't7.package_type_id = t3.package_type_id AND t7.is_deleted = false',
      );
    qb.leftJoin(
      'pickup_request_detail',
      't8',
      't8.awb_item_id = t1.awb_item_id AND t8.is_deleted = false',
      );
    qb.leftJoin(
      'reason',
      't9',
      't9.reason_id = t1.reason_id_last AND t9.is_deleted = false',
      );

      qb.andWhere('t2.user_id_driver = :userIdDriver',{
        userIdDriver: authMeta.userId,
      });

      if (!isHistoryReturn) {
        qb.andWhere('t5.awb_status_id != 14000',{
          userIdDriver: authMeta.userId,
        });

        qb.andWhere('t1.updated_time > :dateFrom',{
          dateFrom: payloadDateFrom,
        });

        if(payloadDateTo){
          qb.andWhere('t1.updated_time <= :dateTo',{
            dateTo: payloadDateTo,
          });
        }
      } else {
        qb.andWhere('t5.awb_status_id = 14000',{
          userIdDriver: authMeta.userId,
        });

        const dateFrom = moment().subtract(1, 'd');
        const dateTo = moment();

        qb.andWhere('t2.do_pod_return_date_time >= :currentDateTimeStart',{
          currentDateTimeStart: dateFrom.format('YYYY-MM-DD 00:00:00'),
        });

        qb.andWhere('t2.do_pod_return_date_time <= :currentDateTimeEnd',{
          currentDateTimeEnd: dateTo.format('YYYY-MM-DD 23:59:59'),
        });

        qb.andWhere('t1.created_time >= :dateFrom',{
          dateFrom: payloadDateFrom,
        });

        if(awbNumber){
          qb.andWhere('t3.awb_number = :awbNumber',{
            awbNumber: awbNumber,
          });
        }
      }

      return await qb.getRawMany();
  }

  private static async syncReturn(returnsData: MobileReturnVm) {
    const doPodReturnHistories: DoPodReturnHistory[] = [];
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    let process = false;
    for (const returnHistory of returnsData.returnHistory) {
      if (!returnHistory.doPodReturnHistoryId) {
        const doPodReturnHistory = DoPodReturnHistory.create({
          doPodReturnDetailId: returnsData.doPodReturnDetailId,
          awbStatusId: returnHistory.awbStatusId,
          reasonId: returnHistory.reasonId,
          syncDateTime: moment().toDate(),
          latitudeReturn: returnHistory.latitudeReturn,
          longitudeReturn: returnHistory.longitudeReturn,
          desc: returnHistory.reasonNotes,
          awbStatusDateTime: moment(returnHistory.historyDateTime).toDate(),
          historyDateTime: moment(returnHistory.historyDateTime).toDate(),
          employeeIdDriver: returnHistory.employeeId,
        });
        doPodReturnHistories.push(doPodReturnHistory);
      }
    }

    if (doPodReturnHistories.length) {
      const lastDoPodReturnHistory = last(doPodReturnHistories);
      // NOTE: check data timestamp and time server
      // handle time status offline
      const returnDateTime =
        lastDoPodReturnHistory.awbStatusDateTime <
          lastDoPodReturnHistory.syncDateTime
          ? lastDoPodReturnHistory.awbStatusDateTime
          : lastDoPodReturnHistory.syncDateTime;

      try {
        const awbdReturn = await DoPodReturnDetailService.getDoPodReturnDetail(returnsData.doPodReturnDetailId);
        const finalStatus = [AWB_STATUS.DLV, AWB_STATUS.BROKE, AWB_STATUS.RTS];
        if (awbdReturn && !finalStatus.includes(awbdReturn.awbStatusIdLast)) {
          const awbStatus = await AwbStatus.findOne(
            { awbStatusId: lastDoPodReturnHistory.awbStatusId },
            { cache: true },
          );

          // #region transaction data
          await getManager().transaction(async transactionEntityManager => {
            await transactionEntityManager.insert(
              DoPodReturnHistory,
              doPodReturnHistories,
            );

            // Update data DoPodReturnDetail
            await transactionEntityManager.update(
              DoPodReturnDetail,
              returnsData.doPodReturnDetailId,
              {
                awbStatusIdLast: lastDoPodReturnHistory.awbStatusId,
                latitudeDeliveryLast: lastDoPodReturnHistory.latitudeReturn,
                longitudeDeliveryLast: lastDoPodReturnHistory.longitudeReturn,
                awbStatusDateTimeLast: lastDoPodReturnHistory.awbStatusDateTime,
                reasonIdLast: lastDoPodReturnHistory.reasonId,
                syncDateTimeLast: lastDoPodReturnHistory.syncDateTime,
                descLast: lastDoPodReturnHistory.desc,
                consigneeName: returnsData.consigneeNameNote,
                userIdUpdated: authMeta.userId,
                updatedTime: moment().toDate(),
              },
            );

            // NOTE: handle only awb status return
            if (awbStatus.isReturn) {
              await AwbReturnService.createAwbReturn(
                returnsData.awbNumber,
                returnsData.awbId,
                permissonPayload.branchId,
                authMeta.userId,
                true,
              );
            }

            const doPodReturn = await DoPodReturn.findOne({
              where: {
                doPodReturnId: returnsData.doPodReturnId,
                isDeleted: false,
              },
            });
            if (doPodReturn) {
          if (AWB_STATUS.UNRTS == awbStatus.awbStatusId) {
            await transactionEntityManager.increment(
              DoPodReturn,
              {
                doPodReturnId: returnsData.doPodReturnId,
                totalProblem: LessThan(doPodReturn.totalAwb),
              },
              'totalProblem',
              1,
            );
          } else if ([AWB_STATUS.RTC, AWB_STATUS.RTS].includes(awbStatus.awbStatusId)) {
            await transactionEntityManager.increment(
              DoPodReturn,
              {
                doPodReturnId: returnsData.doPodReturnId,
                totalReturn: LessThan(doPodReturn.totalAwb),
              },
              'totalReturn',
              1,
            );
            // balance total problem
            await transactionEntityManager.decrement(
              DoPodReturn,
              {
                doPodReturnId: returnsData.doPodReturnId,
                totalProblem: MoreThan(0),
              },
              'totalProblem',
              1,
            );
          }
        }
          });
          // #endregion of transaction

          // NOTE: queue by Bull
          DoPodDetailPostMetaQueueService.createJobV1MobileSync(
            awbdReturn.awbItemId,
            lastDoPodReturnHistory.awbStatusId,
            authMeta.userId,
            awbdReturn.branchId,
            authMeta.userId,
            returnsData.employeeId,
            lastDoPodReturnHistory.reasonId,
            lastDoPodReturnHistory.desc,
            returnsData.consigneeNameNote,
            awbStatus.awbStatusName,
            awbStatus.awbStatusTitle,
            returnDateTime,
            lastDoPodReturnHistory.latitudeReturn,
            lastDoPodReturnHistory.longitudeReturn,
          );

          // NOTE: mail notification status problem
          AwbNotificationMailQueueService.perform(
            awbdReturn.awbItemId,
            awbStatus.awbStatusId,
          );
          process = true;
        } else {
          PinoLoggerService.log('##### Data Not Valid', returnsData);
        }
      } catch (error) {
        console.error(error);
        throw new ServiceUnavailableException(error);
      }
    } // end of doPodDeliverHistor.length
    return process;
  }
}
