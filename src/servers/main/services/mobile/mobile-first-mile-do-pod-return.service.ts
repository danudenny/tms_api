import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { createQueryBuilder, getManager } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AuthService } from '../../../../shared/services/auth.service';
import { DoPodReturnService } from '../master/do-pod-return.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { DoPodReturnDetailService } from '../master/do-pod-return-detail.service';
import { DoPodDetailPostMetaQueueService } from '../../../../servers/queue/services/do-pod-detail-post-meta-queue.service';
import { MobileScanAwbReturnPayloadVm } from '../../models/first-mile/do-pod-return-payload.vm';
import {
  MobileCreateDoPodResponseVm,
  MobileInitDataReturnResponseVm,
  MobileScanAwbReturnResponseVm,
  MobileScanAwbReturnVm,
} from '../../models/first-mile/do-pod-return-response.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoPodReturnDetail } from '../../../../shared/orm-entity/do-pod-return-detail';

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
      const checkValidAwbStatusIdLast = this.checkValidAwbStatusIdLast(awb);
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
        response.message = `Resi ${awbNumber} sudah di proses.`;
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
    fromDate?: string,
  ): Promise<MobileInitDataReturnResponseVm> {
    const result = new MobileInitDataReturnResponseVm();
    result.delivery = await this.getDelivery(fromDate);
    result.serverDateTime = moment().format();
    return result;
  }

  private static async getDelivery(fromDate?: string) {
    const qb = createQueryBuilder();
    const authMeta = AuthService.getAuthMetadata();

    const repo = new OrionRepositoryService(DoPodReturnDetail, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.do_pod_return_detail_id', 'doPodReturnDetailId'],
      ['t1.awb_item_id', 'awbItemId'],
      ['t1.awb_status_date_time_last', 'awbStatusDateTimeLast'],
      ['t1.consignee_name', 'consigneeNameNote'],
      ['t2.do_pod_return_id', 'doPodReturnId'],
      ['t2.do_pod_return_date_time', 'doPodRetrunDateTime'],
      ['t3.awb_id', 'awbId'],
      ['t3.awb_date', 'awbDate'],
      ['t3.awb_number', 'awbNumber'],
      ['t3.ref_customer_account_id', 'merchant'],
      ['t3.consignee_name', 'consigneeName'],
      ['t3.consignee_address', 'consigneeAddress'],
      ['t3.notes', 'consigneeNote'],
      ['t3.consignee_phone', 'consigneeNumber'],
      ['t3.total_cod_value', 'totalCodValue'],
      ['t3.is_cod', 'isCOD'],
      [`COALESCE(t4.is_high_value, t8.is_high_value, false)`, 'isHighValue'],
      ['t5.awb_status_id', 'awbStatusId'],
      ['t5.awb_status_name', 'awbStatusName'],
      ['t6.employee_id', 'employeeId'],
      ['t6.fullname', 'employeeName'],
      ['t7.package_type_name', 'packageTypeName'],
      ['t8.recipient_longitude', 'recipientLongitude'],
      ['t8.recipient_latitude', 'recipientLatitude'],
      ['t8.do_return', 'isDoReturn'],
      ['t8.do_return_number', 'doReturnNumber'],
      ['t9.reason_code', 'reasonCode'],
      ['t9.reason_name', 'reasonName'],
    );

    q.innerJoin(e => e.doPodReturn, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbItemAttr, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbItemAttr.awbStatus, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodReturn.userDriver.employee, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.awb.packageType, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.pickupRequestDetail, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.reasonLast, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.doPodReturn.userIdDriver, w => w.equals(authMeta.userId));

    const dateFrom = moment().subtract(1, 'd');
    const dateTo = moment();
    q.andWhere(
      e => e.doPodReturn.doPodReturnDateTime,
      w => w.greaterThanOrEqual(moment(dateFrom).toDate()),
    );

    q.andWhere(
      e => e.doPodReturn.doPodReturnDateTime,
      w => w.lessThanOrEqual(moment(dateTo).toDate()),
    );

    if (fromDate) {
      q.andWhere(
        e => e.updatedTime,
        w => w.greaterThanOrEqual(moment(fromDate).toDate()),
      );
      q.orWhere(
        e => e.createdTime,
        w => w.lessThanOrEqual(moment(fromDate).toDate()),
      );
    }
    return await q.exec();
  }

  private static checkValidAwbStatusIdLast(awbItemAttr: any) {
    let message = null;
    let isValid = false;
    if (awbItemAttr.awbStatusIdLast) {
      if (AWB_STATUS.ANT == awbItemAttr.awbStatusIdLast) {
        message = `Resi ${awbItemAttr.awbNumber} sudah di proses.`;
      }
      if (AWB_STATUS.IN_BRANCH != awbItemAttr.awbStatusIdLast) {
        message = `Resi ${awbItemAttr.awbNumber} belum di Scan In`;
      }
      if (AWB_STATUS.DLV == awbItemAttr.awbStatusIdLast) {
        message = `Resi ${awbItemAttr.awbNumber} sudah deliv`;
      }
      if (AWB_STATUS.CANCEL_DLV == awbItemAttr.awbStatusIdLast) {
        message = `Resi ${awbItemAttr.awbNumber} telah di CANCEL oleh Partner`;
      }
    }

    if (null == message) {
      isValid = true;
    }

    const result = {
      isValid,
      message,
    };
    return result;
  }
}
