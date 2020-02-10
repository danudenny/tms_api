// #region import
import { getManager, MoreThan, createQueryBuilder } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import {
    DoPodDeliverRepository,
} from '../../../../shared/orm-repository/do-pod-deliver.repository';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../shared/services/awb-trouble.service';
import { RedisService } from '../../../../shared/services/redis.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    MobileScanOutAwbVm,
    TransferAwbDeliverVm,
    MobileScanOutCreateDeliveryVm,
} from '../../models/mobile-scanout.vm';
import { AwbService } from '../v1/awb.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { MobileScanOutAwbResponseVm, CreateDoPodResponseVm } from '../../models/mobile-scanout-response.vm';
import { ScanAwbVm } from '../../models/mobile-scanin-awb.response.vm';
import { ScanInputNumberBranchVm } from '../../models/web-scanin.vm';
import { MobileScanInBranchResponseVm } from '../../models/mobile-scanin.vm';
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

  static async scanOutDeliveryAwb(
  payload: TransferAwbDeliverVm,
  ): Promise<MobileScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileScanOutAwbResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // check if awb_number belongs to user
    const qb = createQueryBuilder();

    qb.addSelect( 'awb.awb_number', 'awbNumber');
    qb.addSelect( 'awb.consignee_name', 'consigneeName');
    qb.addSelect( 'awb.consignee_address', 'consigneeAddress');
    qb.addSelect( 'awb.consignee_phone', 'consigneePhone');
    qb.addSelect( 'awb.total_cod_value', 'totalCodValue');
    qb.addSelect( 'pt.package_type_code', 'service');

    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id'
      );
    qb.innerJoin('do_pod_detail',
      'dpd',
      'dpd.awb_number = awb.awb_number'
      );
    qb.innerJoin(
        'do_pod',
        'dp',
        'dp.do_pod_id = dpd.do_pod_id AND dp.user_id_driver = :userId ', { userId: authMeta.userId }
      );
    qb.andWhere('awb.awb_number = :awbNumber',
    {
      awbNumber: payload.scanValue
    });
    const resultQuery = await qb.getRawOne();
    const response = new ScanAwbVm();

    if(resultQuery){
      // Create Delivery Do POD (surat jalan antar)
      const res = await this.createDeliveryDoPod(payload);

      const dataItem = [];

      let totalSuccess = 0;
      let totalError = 0;
      const awbNumber = payload.scanValue;
      response.status = 'ok';

      const awb = await AwbService.validAwbNumber(awbNumber);
      if (awb) {
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
            doPodDeliverDetail.doPodDeliverId = res.doPodId;
            doPodDeliverDetail.awbId = awb.awbId;
            doPodDeliverDetail.awbItemId = awb.awbItemId;
            doPodDeliverDetail.awbNumber = awbNumber;
            doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
            await DoPodDeliverDetail.save(doPodDeliverDetail);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // Update do_pod
            const doPodDeliver = await DoPodDeliverRepository.getDataById(
              res.doPodId,
            );

            if (doPodDeliver) {
              // counter total scan out
              const totalAwb = doPodDeliver.totalAwb + 1;
              await DoPodDeliver.update(doPodDeliver.doPodDeliverId, {
                totalAwb,
              });
              await AwbService.updateAwbAttr(
                awb.awbItemId,
                AWB_STATUS.ANT,
                null,
              );
              // NOTE: queue by Bull ANT
              DoPodDetailPostMetaQueueService.createJobByAwbDeliver(
                awb.awbItemId,
                AWB_STATUS.ANT,
                permissonPayload.branchId,
                authMeta.userId,
                doPodDeliver.userDriver.employeeId,
                doPodDeliver.userDriver.employee.employeeName,
              );
            }
            // #endregion after scanout

            totalSuccess += 1;
            // remove key holdRedis
            RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Server Busy: Resi ${awbNumber} sudah di proses.`;
          }
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Resi ${awbNumber} sudah di proses.`;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      if(response.status != 'error'){
        result.service = resultQuery.service;
        result.awbNumber = resultQuery.awbNumber;
        result.consigneeName = resultQuery.consigneeName;
        result.consigneeAddress = resultQuery.consigneeAddress;
        result.consigneePhone = resultQuery.consigneePhone;
        result.totalCodValue = resultQuery.totalCodValue;
        result.dateTime = moment().format("YYYY-MM-DD HH:mm:ss");

        result.doPodId = res.doPodId;
      }

      response.trouble = false;
      response.awbNumber = payload.scanValue;
      result.data = response;

      return result;
    }

    response.awbNumber = payload.scanValue;
    response.status = 'error';
    response.message = 'Nomor tidak valid atau tidak ditemukan';
    response.trouble = true;
    result.data = response;
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

  static async createDeliveryDoPod(
    payload: TransferAwbDeliverVm,
  ): Promise<CreateDoPodResponseVm>{
    const authMeta = AuthService.getAuthData();
    const result = new CreateDoPodResponseVm();

    // create do_pod_deliver (Surat Jalan Antar sigesit)
    const doPod = DoPodDeliver.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // NOTE: moment(payload.doPodDateTime).toDate();
    const doPodDateTime = moment().toDate();

    // NOTE: Tipe surat (jalan Antar Sigesit)
    doPod.doPodDeliverCode = await CustomCounterCode.doPodDeliver(
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

    await this.createAuditDeliveryHistory(
      doPod.doPodDeliverId,
      false,
    );

    result.status = "ok";
    result.doPodId = doPod.doPodDeliverId;
    return result;
  }
}