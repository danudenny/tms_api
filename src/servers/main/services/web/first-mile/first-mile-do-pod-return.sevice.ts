import moment = require('moment');
import express = require('express');
import { EntityManager, getManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { RedisService } from '../../../../../shared/services/redis.service';
import { DoPodReturn } from '../../../../../shared/orm-entity/do-pod-return';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { User } from '../../../../../shared/orm-entity/user';
import { DoPodReturnDetail } from '../../../../../shared/orm-entity/do-pod-return-detail';
import { AwbService } from '../../v1/awb.service';
import { EmployeeService } from '../../master/employee.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { DoPodReturnService } from '../../master/do-pod-return.service';
import { DoPodReturnDetailService } from '../../master/do-pod-return-detail.service';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { PrintDoPodDeliverDataDoPodDeliverDetailVm } from '../../../models/print-do-pod-deliver.vm';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
  PrintDoPodReturnPayloadQueryVm,
  PrintDoPodReturnVm,
  WebDoPodCreateReturnPayloadVm,
  WebScanAwbReturnPayloadVm,
} from '../../../models/first-mile/do-pod-return-payload.vm';
import {
  ScanAwbReturnVm,
  WebDoPodCreateReturnResponseVm,
  WebScanAwbReturnResponseVm,
  WebScanOutReturnListResponseVm,
  WebScanOutReturnGroupListResponseVm,
  WebReturnListResponseVm,
  PrintDoPodReturnDataVm,
} from '../../../models/first-mile/do-pod-return-response.vm';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import { PrintByStoreService } from '../../print-by-store.service';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import { PrinterService } from '../../../../../shared/services/printer.service';

export class FirstMileDoPodReturnService {

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

  static async findAllScanOutAwbReturnList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanOutReturnListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodReturnDateTime'] =
      't1.do_pod_return_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['doPodReturnCode'] = 't1.do_pod_return_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';
    payload.fieldResolverMap['totalAssigned'] = 'totalAssigned';
    payload.fieldResolverMap['totalOnProcess'] = 'totalOnProcess';
    payload.fieldResolverMap['totalSuccess'] = 'totalSuccess';
    payload.fieldResolverMap['totalProblem'] = 'totalProblem';
    payload.fieldResolverMap['totalCodValue'] = 'totalCodValue';

    if (payload.sortBy === '') {
      payload.sortBy = 'doPodReturnDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodReturnDateTime',
      },
      {
        field: 'doPodReturnCode',
      },
      {
        field: 'description',
      },
      {
        field: 'nickname',
      },
    ];

    const repo = new OrionRepositoryService(DoPodReturn, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_return_id', 'doPodReturnId'],
      ['t1.do_pod_return_code', 'doPodReturnCode'],
      ['t1.do_pod_return_date_time', 'doPodReturnDateTime'],
      ['t1.description', 'description'],
      [
        'COUNT(t3.awb_number)FILTER (WHERE t3.awb_status_id_last = 30000)',
        'totalSuccess',
      ],
      [
        'COUNT(t3.awb_number)FILTER (WHERE t3.awb_status_id_last NOT IN (30000, 14000))',
        'totalProblem',
      ],
      [
        'COUNT (t3.awbNumber) FILTER (WHERE t3.awb_status_id_last = 14000)',
        'totalOnProcess',
      ],
      ['COUNT (t3.awbNumber)', 'totalAssigned'],
      ['t2.fullname', 'nickname'],
      [
        `CONCAT(CAST(SUM(t4.total_cod_value) AS NUMERIC(20,2)))`,
        'totalCodValue',
      ],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodReturnDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodReturnDetails.awb, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('t1.do_pod_return_id, t2.fullname');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutReturnListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async detailReturn(
    payload: BaseMetaPayloadVm,
  ): Promise<WebReturnListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodReturnId'] = 't1.do_pod_return_id';
    payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['awbNumber'] = 't2.awb_number';
    payload.fieldResolverMap['consigneeName'] = 't1.consignee_name';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
      {
        field: 'doPodReturnId',
      },
    ];

    const repo = new OrionRepositoryService(DoPodReturnDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_return_detail_id', 'doPodReturnDetailId'],
      ['t2.awb_number', 'awbNumber'],
      ['t1.awb_status_id_last', 'awbStatusIdLast'],
      ['t1.desc_last', 'note'],
      ['t2.is_cod', 'isCod'],
      [`CONCAT(CAST(t2.total_weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
      ['COALESCE(t1.consignee_name, t2.consignee_name)', 'consigneeName'],
      ['t3.awb_status_title', 'awbStatusTitle'],
      ['t4.do_return', 'isDoReturn'],
      ['t4.do_return_number', 'doReturnNumber'],
      [
        'CONCAT(CAST(t2.total_cod_value AS NUMERIC(20,2)))',
        'totalCodValue',
      ],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbStatus, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.pickupRequestDetail, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new WebReturnListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async storePrintDoPodReturn(payloadBody: PrintDoPodReturnVm) {
    return PrintByStoreService.storeGenericPrintData(
      'do-pod-return',
      payloadBody.data.doPodReturnId,
      payloadBody,
    );
  }

  static async executePrintDoPodReturn(
    res: express.Response,
    queryParams: PrintDoPodReturnPayloadQueryVm,
  ) {
    const printPayload = await PrintByStoreService.retrieveGenericPrintData<
      PrintDoPodReturnVm
    >('do-pod-deliver', queryParams.id);

    if (!printPayload || (printPayload && !printPayload.data)) {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }

    return this.printDoPodReturnAndQueryMeta(
      res,
      printPayload.data,
      {
        userId: queryParams.userId,
        branchId: queryParams.branchId,
      },
      {
        printCopy: queryParams.printCopy,
      },
    );
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

  private static async printDoPodReturnAndQueryMeta(
    res: express.Response,
    data: Partial<PrintDoPodReturnDataVm>,
    metaQuery: {
      userId: number;
      branchId: number;
    },
    templateConfig: {
      printCopy?: number;
    } = {
      printCopy: 1,
    },
  ) {
    // #region get user login and branch login
    const currentUser = await RepositoryService.user
      .loadById(metaQuery.userId)
      .select({
        userId: true, // needs to be selected due to users relations are being included
        employee: {
          nickname: true,
        },
      })
      .exec();

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    const currentBranch = await RepositoryService.branch
      .loadById(metaQuery.branchId)
      .select({
        branchName: true,
      });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }
    // #endregion

    const currentDate = moment();
    let totalAllCod = 0;

    // sum totalCodValue from object
    // loop data and sum data totalCodValue
    if (data && data.doPodReturnDetails) {
      data.doPodReturnDetails.map(function(doPod) {
        if (
          doPod &&
          doPod.awbItem &&
          doPod.awbItem.awb &&
          doPod.awbItem.awb.totalCodValue
        ) {
          totalAllCod += Number(doPod.awbItem.awb.totalCodValue);
        }
      });
    }

    return this.printDoPodReturn(
      res,
      data,
      {
        currentUserName: currentUser.employee.nickname,
        currentBranchName: currentBranch.branchName,
        date: currentDate.format('DD/MM/YY'),
        time: currentDate.format('HH:mm'),
        totalItems: data.doPodReturnDetails.length,
        totalCod: totalAllCod,
      },
      templateConfig,
    );
  }

  private static async printDoPodReturn(
    res: express.Response,
    data: Partial<PrintDoPodReturnDataVm>,
    meta: {
      currentUserName: string;
      currentBranchName: string;
      date: string;
      time: string;
      totalItems: number;
      totalCod: number;
    },
    templateConfig: {
      printCopy?: number;
    } = {
      printCopy: 1,
    },
  ) {
    const jsreportParams = {
      data,
      meta,
    };

    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'surat-jalan-antar-return',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
        {
          templateName: 'surat-jalan-antar-return-admin',
          templateData: jsreportParams,
          printCopy: templateConfig.printCopy,
        },
      ],
      listPrinterName,
    });
  }
}
