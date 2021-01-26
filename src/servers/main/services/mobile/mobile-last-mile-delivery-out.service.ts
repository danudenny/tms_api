// #region import
import { createQueryBuilder } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverRepository } from '../../../../shared/orm-repository/do-pod-deliver.repository';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../shared/services/awb-trouble.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
  TransferAwbDeliverVm,
  ScanAwbDeliverPayloadVm,
} from '../../models/mobile-scanout.vm';
import { AwbService } from '../v1/awb.service';
import {
  MobileScanOutAwbResponseVm,
  CreateDoPodResponseVm,
} from '../../models/mobile-scanout-response.vm';
import { ScanAwbVm } from '../../models/mobile-scanin-awb.response.vm';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuditHistory } from '../../../../shared/orm-entity/audit-history';

// #endregion

export class LastMileDeliveryOutService {
  /**
   * Create DO POD Deliver
   * with type: Deliver (Sigesit)
   * @param {TransferAwbDeliverVm} payload
   * @returns {Promise<MobileScanOutAwbResponseVm>}
   * @memberof LastMileDeliveryOutService
   */

   // TODO: need refactoring
  static async scanOutDeliveryAwb(
    payload: TransferAwbDeliverVm,
  ): Promise<MobileScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileScanOutAwbResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbNumber = payload.scanValue;

    // check if awb_number belongs to user
    const qb = createQueryBuilder();
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');
    qb.addSelect('aia.awb_item_id', 'awbItemId');
    qb.addSelect('aia.awb_id', 'awbId');
    qb.addSelect('aia.awb_status_id_last', 'awbLastStatus');
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
    const response = new ScanAwbVm();

    if (awb) {
      response.status = 'error';
      response.awbNumber = payload.scanValue;
      response.trouble = true;

      // validation
      if (awb.awbLastStatus == AWB_STATUS.ANT) {
        response.message = `Resi ${awbNumber} sudah di proses.`;
        result.data = response;
        return result;
      } else if (awb.awbLastStatus != AWB_STATUS.IN_BRANCH) {
        response.message = `Resi ${awbNumber} belum di Scan In`;
        result.data = response;
        return result;
      } else {
        // check resi cancel delivery
        const isCancel = await AwbService.isCancelDelivery(awb.awbItemId);
        if (isCancel == true) {
          response.message = `Resi ${awbNumber} telah di CANCEL oleh Partner`;
          result.data = response;
          return result;
        }

        // Create Delivery Do POD (surat jalan antar)
        const res = await this.createDeliveryDoPod();
        // TODO: validation need improvement
        // handle if awb status is null
        let notDeliver = true;
        if (awb.awbStatusIdLast && awb.awbStatusIdLast != 0) {
          notDeliver = awb.awbStatusIdLast != AWB_STATUS.ANT ? true : false;
        }

        // NOTE: first must scan in branch
        if (notDeliver) {
          const statusCode = await AwbService.awbStatusGroup(
            awb.awbStatusIdLast,
          );
          // save data to awb_troubleß
          if (statusCode != 'IN') {
            const branchName = awb.branchLast ? awb.branchLast.branchName : '';
            await AwbTroubleService.fromScanOut(
              awbNumber,
              branchName,
              awb.awbStatusIdLast,
            );
          }

          // Add Locking setnx redis
          const holdRedis = await RedisService.locking(
            `hold:scanoutant:${awb.awbItemId}`,
            'locking',
          );

          // return result;
          if (holdRedis) {
            // save table do_pod_detail
            // NOTE: create data do pod detail per awb number
            const doPodDeliverDetail = DoPodDeliverDetail.create();
            doPodDeliverDetail.doPodDeliverId = res.doPodDeliverId;
            doPodDeliverDetail.awbId = awb.awbId;
            doPodDeliverDetail.awbItemId = awb.awbItemId;
            doPodDeliverDetail.awbNumber = awbNumber;
            doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
            await DoPodDeliverDetail.save(doPodDeliverDetail);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // Update do_pod
            const doPodDeliver = await DoPodDeliverRepository.getDataById(
              res.doPodDeliverId,
            );

            if (doPodDeliver) {
              // counter total scan out
              const totalAwb = doPodDeliver.totalAwb + 1;
              await DoPodDeliver.update(doPodDeliver.doPodDeliverId, {
                totalAwb,
              });

              // NOTE: queue by Bull ANT
              DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
                awb.awbItemId,
                AWB_STATUS.ANT,
                permissonPayload.branchId,
                authMeta.userId,
                doPodDeliver.userDriver.employeeId,
                doPodDeliver.userDriver.employee.employeeName,
              );

              response.status = 'ok';
              response.trouble = false;
            }
            // #endregion after scanout

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

        if (response.trouble == false) {
          result.service = awb.service;
          result.awbNumber = awb.awbNumber;
          result.consigneeName = awb.consigneeName;
          result.consigneeAddress = awb.consigneeAddress;
          result.consigneePhone = awb.consigneePhone;
          result.totalCodValue = awb.totalCodValue;
          result.dateTime = moment().format('YYYY-MM-DD HH:mm:ss');

          result.doPodId = res.doPodDeliverId;
        }

        result.data = response;
      } // end of validate
    } else {
      response.awbNumber = awbNumber;
      response.status = 'error';
      response.message = 'Nomor tidak valid atau tidak ditemukan';
      response.trouble = true;
      result.data = response;
    }
    return result;
  }

  // TODO: need refactoring
  static async scanAwbDeliverMobile(
    payload: ScanAwbDeliverPayloadVm,
  ): Promise<MobileScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileScanOutAwbResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbNumber = payload.scanValue;

    // check if awb_number belongs to user
    const qb = createQueryBuilder();
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');
    qb.addSelect('aia.awb_item_id', 'awbItemId');
    qb.addSelect('aia.awb_id', 'awbId');
    qb.addSelect('aia.awb_status_id_last', 'awbLastStatus');
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
    const response = new ScanAwbVm();

    if (awb) {
      response.status = 'error';
      response.awbNumber = payload.scanValue;
      response.trouble = true;

      if (awb.awbLastStatus == AWB_STATUS.ANT) {
        response.message = `Resi ${awbNumber} sudah di proses.`;
        result.data = response;
        return result;
      } else if (awb.awbLastStatus != AWB_STATUS.IN_BRANCH) {
        response.message = `Resi ${awbNumber} belum di Scan In`;
        result.data = response;
        return result;
      } else {
        // check resi cancel delivery
        const isCancel = await AwbService.isCancelDelivery(awb.awbItemId);
        if (isCancel == true) {
          response.message = `Resi ${awbNumber} telah di CANCEL oleh Partner`;
          result.data = response;
          return result;
        }

        // TODO: validation need improvement
        // handle if awb status is null
        let notDeliver = true;
        if (awb.awbLastStatus && awb.awbLastStatus != 0) {
          notDeliver = awb.awbLastStatus != AWB_STATUS.ANT ? true : false;
        }

        // NOTE: first must scan in branch
        if (notDeliver) {
          const statusCode = await AwbService.awbStatusGroup(
            awb.awbLastStatus,
          );
          // save data to awb_troubleß
          if (statusCode != 'IN') {
            const branchName = awb.branchLast ? awb.branchLast.branchName : '';
            await AwbTroubleService.fromScanOut(
              awbNumber,
              branchName,
              awb.awbLastStatus,
            );
          }

          // Add Locking setnx redis
          const holdRedis = await RedisService.locking(
            `hold:scanoutant:${awb.awbItemId}`,
            'locking',
          );

          // return result;
          if (holdRedis) {
            // save table do_pod_detail
            // NOTE: create data do pod detail per awb number
            const doPodDeliverDetail = DoPodDeliverDetail.create();
            doPodDeliverDetail.doPodDeliverId = payload.doPodDeliverId;
            doPodDeliverDetail.awbId = awb.awbId;
            doPodDeliverDetail.awbItemId = awb.awbItemId;
            doPodDeliverDetail.awbNumber = awbNumber;
            doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
            await DoPodDeliverDetail.save(doPodDeliverDetail);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // Update do_pod
            const doPodDeliver = await DoPodDeliverRepository.getDataById(
              payload.doPodDeliverId,
            );

            if (doPodDeliver) {
              // counter total scan out
              const totalAwb = doPodDeliver.totalAwb + 1;
              await DoPodDeliver.update(doPodDeliver.doPodDeliverId, {
                totalAwb,
              });

              // NOTE: queue by Bull ANT
              DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
                awb.awbItemId,
                AWB_STATUS.ANT,
                permissonPayload.branchId,
                authMeta.userId,
                doPodDeliver.userDriver.employeeId,
                doPodDeliver.userDriver.employee.employeeName,
              );

              response.status = 'ok';
              response.trouble = false;
            }
            // #endregion after scanout

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

        if (response.trouble == false) {
          result.service = awb.service;
          result.awbNumber = awb.awbNumber;
          result.consigneeName = awb.consigneeName;
          result.consigneeAddress = awb.consigneeAddress;
          result.consigneePhone = awb.consigneePhone;
          result.totalCodValue = awb.totalCodValue;
          result.dateTime = moment().format('YYYY-MM-DD HH:mm:ss');

          result.doPodId = payload.doPodDeliverId;
        }
        result.data = response;
      } // end of validate
    } else {
      response.awbNumber = payload.scanValue;
      response.status = 'error';
      response.message = 'Nomor tidak valid atau tidak ditemukan';
      response.trouble = true;
      result.data = response;
    }
    return result;
  }

  static async createDeliveryDoPod(): Promise<CreateDoPodResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new CreateDoPodResponseVm();

    // create do_pod_deliver (Surat Jalan Antar sigesit)
    const doPod = DoPodDeliver.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const doPodDateTime = moment().toDate();

    // NOTE: Tipe surat (jalan Antar Sigesit) from Mobile App
    doPod.doPodDeliverCode = await CustomCounterCode.doPodDeliverMobile(
      doPodDateTime,
    ); // generate code

    // doPod.userIdDriver = payload.
    doPod.userIdDriver = authMeta.userId;
    doPod.doPodDeliverDateTime = doPodDateTime;
    doPod.description = null;

    doPod.branchId = permissonPayload.branchId;
    doPod.userId = authMeta.userId;

    // await for get do pod id
    await DoPodDeliver.save(doPod);

    await this.createAuditDeliveryHistory(doPod.doPodDeliverId, false);

    result.status = 'ok';
    result.message = 'Surat Jalan Berhasil dibuat';
    result.doPodDeliverId = doPod.doPodDeliverId;
    return result;
  }

  private static async createAuditDeliveryHistory(
    doPodDeliveryId: string,
    isUpdate: boolean = true,
  ) {
    // find doPodDeliver
    const doPodDeliver = await DoPodDeliverRepository.getDataById(
      doPodDeliveryId,
    );
    if (doPodDeliver) {
      // construct note for information
      const description = doPodDeliver.description
        ? doPodDeliver.description
        : '';
      const stage = isUpdate ? 'Updated' : 'Created';
      const note = `
        Data ${stage} \n
        Nama Driver  : ${doPodDeliver.userDriver.employee.employeeName}
        Gerai Assign : ${doPodDeliver.branch.branchName}
        Note         : ${description}
      `;
      // create new object AuditHistory
      const auditHistory = AuditHistory.create();
      auditHistory.changeId = doPodDeliveryId;
      auditHistory.transactionStatusId = 1300; // NOTE: doPodDelivery
      auditHistory.note = note;
      return await AuditHistory.save(auditHistory);
    }
  }
}
