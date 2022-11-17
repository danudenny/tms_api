// #region import
import { createQueryBuilder, getManager } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverRepository } from '../../../../shared/orm-repository/do-pod-deliver.repository';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
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
import { BadRequestException } from '@nestjs/common';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { AwbStatusService } from '../master/awb-status.service';
const uuidv1 = require('uuid/v1');
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
    const doPodDeliverId = uuidv1();

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
      const checkValidAwbStatusIdLast = await AwbStatusService.checkValidAwbStatusIdLast(awb, false, false);
      if (checkValidAwbStatusIdLast.isValid) {
        // Add Locking setnx redis
        const holdRedis = await RedisService.locking(
          `hold:scanoutant:${awb.awbItemId}`,
          'locking',
        );
        if (holdRedis) {
          // save table do_pod_detail
          try {
            await getManager().transaction(async trans => {
              // Create Delivery Do POD (surat jalan antar)
              // const res = await this.createDeliveryDoPod();
              // create do_pod_deliver (Surat Jalan Antar sigesit)
              const doPod = DoPodDeliver.create();
              const doPodDateTime = moment().toDate();

              // NOTE: Tipe surat (jalan Antar Sigesit) from Mobile App
              doPod.doPodDeliverCode = await CustomCounterCode.doPodDeliverMobile(
                doPodDateTime,
              ); // generate code

              doPod.doPodDeliverId = doPodDeliverId;
              doPod.userIdDriver = authMeta.userId;
              doPod.doPodDeliverDateTime = doPodDateTime;
              doPod.doPodDeliverDate = doPodDateTime;
              doPod.branchId = permissonPayload.branchId;
              doPod.userId = authMeta.userId;
              doPod.totalAwb = 1; // init

              await trans.insert(DoPodDeliver, doPod);

              // counter total scan out
              // const totalAwb = doPodDeliver.totalAwb + 1;
              // await DoPodDeliver.update(doPodDeliver.doPodDeliverId, {
              //   totalAwb,
              // });
              // NOTE: create data do pod detail per awb number
              const doPodDeliverDetail = DoPodDeliverDetail.create();
              doPodDeliverDetail.doPodDeliverId = doPodDeliverId;
              doPodDeliverDetail.awbId = awb.awbId;
              doPodDeliverDetail.awbItemId = awb.awbItemId;
              doPodDeliverDetail.awbNumber = awbNumber;
              doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
              await trans.insert(DoPodDeliverDetail, doPodDeliverDetail);
            }); // end transaction

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // NOTE: queue by Bull ANT
            DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
              awb.awbItemId,
              AWB_STATUS.ANT,
              permissonPayload.branchId,
              authMeta.userId,
              authMeta.employeeId,
              authMeta.displayName,
            );
            response.status = 'ok';
            response.trouble = false;
            // #endregion after scanout

            // remove key holdRedis
            RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
          } catch (e) {
            console.error(e);
            RequestErrorService.throwObj({
              message: 'global.error.SERVER_BUSY',
            });
          }

          // success
          if (response.trouble == false) {
            result.service = awb.service;
            result.awbNumber = awb.awbNumber;
            result.consigneeName = awb.consigneeName;
            result.consigneeAddress = awb.consigneeAddress;
            result.consigneePhone = awb.consigneePhone;
            result.totalCodValue = awb.totalCodValue;
            result.dateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            result.doPodId = doPodDeliverId;
          }

          result.data = response;
        } else {
          response.status = 'error';
          response.message = `Server Busy: Resi ${awbNumber} sudah di proses.`;
        }

      } else {
        response.message = checkValidAwbStatusIdLast.message;
        result.data = response;
        return result;
      }
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
    const response = new ScanAwbVm();

    // #region check if awb_number belongs to user
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
    // #endregion check awb

    const doPodDeliver = await DoPodDeliverRepository.byIdCache(
      payload.doPodDeliverId,
    );
    if (!doPodDeliver) {
      throw new BadRequestException('Surat Jalan tidak valid!');
    }

    // if (doPodDeliver && doPodDeliver.userIdDriver != authMeta.userId) {
    //   throw new BadRequestException('Surat Jalan bukan milik sigesit!');
    // }

    response.status = 'error';
    response.awbNumber = awbNumber;
    response.trouble = true;

    if (awb) {
      const checkValidAwbStatusIdLast = await AwbStatusService.checkValidAwbStatusIdLast(awb, false, false, false, false);
      // NOTE: first must scan in branch
      if (checkValidAwbStatusIdLast.isValid) {
        // Add Locking setnx redis
        const holdRedis = await RedisService.lockingWithExpire(
          `hold:scanoutant:${awb.awbItemId}`,
          'locking',
          60,
        );

        // return result;
        if (holdRedis) {
          // save table do_pod_detail
          // NOTE: create data do pod detail per awb number
          try {
            await getManager().transaction(async transactionManager => {
              const dataSpk = await DoPodDeliverDetail.find({
                select: ['awbNumber'],
                where: {
                  awbItemId: awb.awbItemId,
                  isDeleted: false,
                },
              });
              if (dataSpk.length) {
                await transactionManager.update(
                  DoPodDeliverDetail,
                  {
                    awbItemId: awb.awbItemId,
                    isDeleted: false,
                  },
                  {
                    isDeleted: true,
                    userIdUpdated: authMeta.userId,
                  },
                );
              }

              const doPodDeliverDetail = DoPodDeliverDetail.create();
              doPodDeliverDetail.doPodDeliverId = payload.doPodDeliverId;
              doPodDeliverDetail.awbId = awb.awbId;
              doPodDeliverDetail.awbItemId = awb.awbItemId;
              doPodDeliverDetail.awbNumber = awbNumber;
              doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
              await transactionManager.insert(DoPodDeliverDetail,
                doPodDeliverDetail,
              );

              // counter total scan out
              const totalAwb = doPodDeliver.totalAwb + 1;
              await transactionManager.update(DoPodDeliver,
                { doPodDeliverId: doPodDeliver.doPodDeliverId },
                {
                  totalAwb,
                },
              );

              // NOTE: queue by Bull ANT
              // scan awb mobile only sigesit on transit
              DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
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
            result.doPodId = payload.doPodDeliverId;
          } catch (e) {
            response.status = 'error';
            response.message = `Gangguan Server: ${e.message}`;
          }

          // remove key holdRedis
          RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
          // RedisService.del(`hold:doPodDeliverId:${doPodDeliver.doPodDeliverId}`);
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
    doPod.doPodDeliverDate = doPodDateTime;
    doPod.description = null;

    doPod.branchId = permissonPayload.branchId;
    doPod.userId = authMeta.userId;

    try {
      // await for get do pod id
      await DoPodDeliver.save(doPod);
    } catch (err) {
      console.log('ERROR INSERT:::::: ', err);
      RequestErrorService.throwObj({
        message: 'global.error.SERVER_BUSY',
      });
    }

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
