import moment = require('moment');
import { EntityManager, getManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AwbService } from '../../v1/awb.service';
import { EmployeeService } from '../../master/employee.service';
import { DoPodReturn } from '../../../../../shared/orm-entity/do-pod-retur';
import { AuthService } from '../../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import {
  WebDoPodCreateReturnPayloadVm,
  WebScanAwbReturnPayloadVm,
} from '../../../models/first-mile/do-pod-retur-payload.vm';
import {
  ScanAwbReturnVm,
  WebDoPodCreateReturnResponseVm,
  WebScanAwbReturnResponseVm,
  WebScanOutReturnGroupListResponseVm,
} from '../../../models/first-mile/do-pod-retur-response.vm';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { User } from '../../../../../shared/orm-entity/user';
import { RedisService } from '../../../../../shared/services/redis.service';
import { DoPodReturnDetail } from '../../../../../shared/orm-entity/do-pod-return-detail';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { PrintDoPodDeliverDataDoPodDeliverDetailVm } from '../../../models/print-do-pod-deliver.vm';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../../shared/services/meta.service';
import { DoPodReturnService } from '../../master/do-pod-return.service';
import { DoPodReturnDetailService } from '../../master/do-pod-return-detail.service';

export class FirstMileDoPodReturnService {

  static async findAllScanOutAwbReturnGroupList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanOutReturnGroupListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodRetrunDateTime'] =
      't1.do_pod_return_date_time';
    payload.fieldResolverMap['datePOD'] = 'datePOD';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['doPodReturnCode'] = 't1.do_pod_return_code';
    payload.fieldResolverMap['totalSuratJalan'] = 'totalSuratJalan';
    payload.fieldResolverMap['totalAssigned'] = 'totalAssigned';
    payload.fieldResolverMap['totalOnProcess'] = 'totalOnProcess';
    payload.fieldResolverMap['totalSuccess'] = 'totalSuccess';
    payload.fieldResolverMap['totalProblem'] = 'totalProblem';

    if (payload.sortBy === '') {
      payload.sortBy = 'datePOD';
    }

    const repo = new OrionRepositoryService(DoPodReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.user_id_driver', 'userIdDriver'],
      ['t2.fullname', 'nickname'],
      ['t1.do_pod_return_date_time::date', 'datePOD'],
      ['t5.branch_name', 'branchName'],
      ['t1.branch_id', 'branchId'],
      ['COUNT(DISTINCT(t1.do_pod_return_id))', 'totalSuratJalan'],
      ['COUNT(t3.awb_number)', 'totalAssigned'],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 14000)',
        'totalOnProcess',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 30000)',
        'totalSuccess',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last <> 30000 AND t3.awb_status_id_last <> 14000)',
        'totalProblem',
      ],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodReturnDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(
      '"datePOD", t1.user_id_driver, t1.branch_id, t2.fullname, t5.branch_name',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutReturnGroupListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async scanAwbReturn(
    payload: WebScanAwbReturnPayloadVm,
  ): Promise<WebScanAwbReturnResponseVm> {
    const result = new WebScanAwbReturnResponseVm();

    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    let totalSuccess = 0;
    let totalError = 0;
    let employeeIdDriver = 0; // partner does not have employee id
    let employeeNameDriver = null;

    // find data doPod Return
    const doPodReturn = await DoPodReturnService.byIdCache(payload.doPodReturnId);
    if (!doPodReturn) {
      throw new BadRequestException('Surat Jalan tidak valid!');
    }

    if (doPodReturn && doPodReturn.userIdDriver) {
      // find by user driver
      const userDriver = await User.findOne({
        userId: doPodReturn.userIdDriver,
        isDeleted: false,
      }, { cache: true });
      if (userDriver) {
        employeeIdDriver = userDriver.employeeId;
        employeeNameDriver =  userDriver.firstName;
      }
    }

    for (const awbNumber of payload.awbNumber) {
      const response = new ScanAwbReturnVm();
      response.status = 'ok';
      response.message = 'success';

      const awb = await AwbService.validAwbNumber(awbNumber);
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
                // flag delete data if exist, handle double awb on spk
                await this.deleteExistDoPodReturnDetail(awb.awbItemId, authMeta.userId, transactionManager);

                // save table do_pod_return_detail
                await DoPodReturnDetailService.createDoPodReturnDetail(payload.doPodReturnId, awb, awbNumber, transactionManager);

                // NOTE: queue by Bull ANT
                DoPodDetailPostMetaQueueService.createJobByAwbReturn(
                  awb.awbItemId,
                  AWB_STATUS.ANT,
                  permissonPayload.branchId,
                  authMeta.userId,
                  employeeIdDriver,
                  employeeNameDriver,
                );

                totalSuccess += 1;
                // handle print metadata - Scan Out & Return
                response.printDoPodReturnMetadata = this.handlePrintMetadata(awb);

              });
            } catch (e) {
              totalError += 1;
              response.status = 'error';
              response.message = `Gangguan Server: ${e.message}`;
            }
            // remove key holdRedis
            RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Server Busy: Resi ${awbNumber} sedang di proses.`;
          }
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = checkValidAwbStatusIdLast.message;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      dataItem.push({
        awbNumber,
        ...response,
      });
    }

    // NOTE: counter total scan out
    if (doPodReturn && totalSuccess > 0) {
      await DoPodReturnService.updateTotalAwbById(
        doPodReturn.totalAwb,
        totalSuccess,
        doPodReturn.doPodReturnId,
        );
    }

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  static async createDoPodReturn(
    payload: WebDoPodCreateReturnPayloadVm,
  ): Promise<WebDoPodCreateReturnResponseVm> {
    const result = new WebDoPodCreateReturnResponseVm();

    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // create do_pod_return (jalan Antar Retur Sigesit)
    const doPodReturn = await DoPodReturnService.createDoPodReturn(
      payload.userIdDriver,
      payload.desc,
      permissonPayload.branchId,
      authMeta.userId,
      false,
      );

    await DoPodReturnService.createAuditReturnHistory(doPodReturn.doPodReturnId, false);

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodReturnId = doPodReturn.doPodReturnId;

    // For printDoPodReturnMetadata
    result.printDoPodReturnMetadata.doPodReturnCode = doPodReturn.doPodReturnCode;
    result.printDoPodReturnMetadata.description = payload.desc;

    const dataUser = await EmployeeService.findByUserIdDriver(payload.userIdDriver);
    if (dataUser) {
      result.printDoPodReturnMetadata.userDriver.employee.nik =
        dataUser[0].nik;
      result.printDoPodReturnMetadata.userDriver.employee.nickname =
        dataUser[0].nickname;
    }

    return result;
  }

  private static handlePrintMetadata(awb: AwbItemAttr) {
    const meta = new PrintDoPodDeliverDataDoPodDeliverDetailVm();
    // Assign print metadata - Scan Out & Return
    meta.awbItem.awb.awbId = awb.awbId;
    meta.awbItem.awb.awbNumber = awb.awbNumber;
    meta.awbItem.awb.consigneeName = awb.awbItem.awb.consigneeName;

    // Assign print metadata - Return
    meta.awbItem.awb.consigneeAddress = awb.awbItem.awb.consigneeAddress;
    meta.awbItem.awb.awbItemId = awb.awbItemId;
    meta.awbItem.awb.consigneeNumber = awb.awbItem.awb.consigneeNumber;
    meta.awbItem.awb.consigneeZip = awb.awbItem.awb.consigneeZip;
    meta.awbItem.awb.isCod = awb.awbItem.awb.isCod;
    meta.awbItem.awb.totalCodValue = awb.awbItem.awb.totalCodValue;
    meta.awbItem.awb.totalWeight = awb.awbItem.awb.totalWeightFinalRounded;
    return meta;
  }

  private static async deleteExistDoPodReturnDetail(
    awbItemId: number,
    userId: number,
    transactionManager: EntityManager) {
    const dataSpk = await DoPodReturnDetail.find({
        select: ['awbNumber'],
        where: {
          awbItemId,
          awbStatusIdLast: AWB_STATUS.ANT,
          isDeleted: false,
        },
    });
    if (dataSpk.length) {
      transactionManager.update(
        DoPodReturnDetail,
        {
          awbItemId,
          awbStatusIdLast: AWB_STATUS.ANT,
          isDeleted: false,
        },
        {
          isDeleted: true,
          userIdUpdated: userId,
          updatedTime: moment().toDate(),
        },
      );
    }
  }

  private static checkValidAwbStatusIdLast(awbItemAttr: AwbItemAttr) {
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
