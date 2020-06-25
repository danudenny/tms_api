// #region import
import { createQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { CodTransactionBranch } from '../../../../../shared/orm-entity/cod-transaction-branch';
import {
    CodTransactionBranchDetail,
} from '../../../../../shared/orm-entity/cod-transaction-branch-detail';
import { User } from '../../../../../shared/orm-entity/user';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import {
    WebCodAwbPayloadVm, WebCodTransferPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
  WebAwbCodListResponseVm,
  WebCodAwbPrintVm,
  WebCodAwbValidVm,
  WebCodPrintMetaVm,
  PrintCodTransferBranchVm,
  WebCodTransferBranchResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { PrintByStoreService } from '../../print-by-store.service';
import moment = require('moment');
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
// #endregion
export class V1WebAwbCodService {

  static async awbCod(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodListResponseVm> {
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't1.updated_time';

    payload.fieldResolverMap['awbStatusLast'] = 't7.awb_status_title';
    payload.fieldResolverMap['branchNameLast'] = 't6.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't4.user_id';
    payload.fieldResolverMap['driverName'] = 't4.first_name';
    payload.fieldResolverMap['packageTypeCode'] = 't5.package_type_code';

    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'awbNumber',
    //   },
    // ];
    if (payload.sortBy === '') {
      payload.sortBy = 'transactionDate';
    }

    const repo = new OrionRepositoryService(AwbItemAttr, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t1.awb_item_id', 'awbItemId'],
      ['t1.updated_time', 'transactionDate'],
      ['t1.awb_status_id_last', 'awbStatusIdLast'],
      ['t7.awb_status_title', 'awbStatusLast'],
      ['t1.branch_id_last', 'branchIdLast'],
      ['t6.branch_name', 'branchNameLast'],
      ['t2.awb_date', 'manifestedDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t3.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      [`COALESCE(t8.cod_payment_method, 'cash')`, 'codPaymentMethod'],
      ['t8.cod_payment_service', 'codPaymentService'],
      ['t8.no_reference', 'noReference'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(
      e => e.doPodDeliverDetail.doPodDeliver.userDriver,
      't4',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awb.packageType, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.doPodDeliverDetail.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.awb.isCod, w => w.isTrue());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async transferBranch(
    payload: WebCodTransferPayloadVm,
  ): Promise<WebCodTransferBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    let totalCodValue = 0;
    let totalAwbSuccess = 0;
    const dataError = [];

    let totalCodValueCash = 0;
    let totalCodValueCashless = 0;
    const dataPrintCash: WebCodAwbPrintVm[] = [];
    const dataPrintCashless: WebCodAwbPrintVm[] = [];
    let printIdCash = null;
    let printIdCashless = null;

    // TODO: transction ??

    const codBranch = new CodTransactionBranch();
    const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
    codBranch.transactionCode = randomCode;
    codBranch.transactionDate = timestamp;
    codBranch.transactionStatusId = 29999; // status process;
    codBranch.totalCodValue = totalCodValue;
    codBranch.totalAwb = totalAwbSuccess;
    codBranch.branchId = permissonPayload.branchId;
    await CodTransactionBranch.save(codBranch);

    const metaPrint = await this.generatePrintMeta(
      codBranch.transactionCode,
      authMeta.displayName,
      permissonPayload.branchId,
      payload.dataCash[0].userIdDriver,
    );

    // #region data cash
    for (const item of payload.dataCash) {
      const awbValid = await this.validStatusAwb(item.awbItemId);
      if (awbValid) {
        totalCodValue += Number(item.codValue);
        totalCodValueCash += Number(item.codValue);
        totalAwbSuccess += 1;

        const dataCash = await this.handleAwbCod(
          item,
          codBranch.codTransactionBranchId,
          permissonPayload.branchId,
          authMeta.userId,
          awbValid.partnerId,
          metaPrint.employeeIdDriver,
        );
        dataPrintCash.push(dataCash);
      } else {
        // NOTE: error message
        const errorMessage = `status resi ${
          item.awbNumber
        } tidak valid, mohon di cek ulang!`;
        dataError.push(errorMessage);
      }
    } // end of loop data cash

    // store data print cash on redis
    printIdCash = await this.printStoreData(
      metaPrint,
      codBranch.codTransactionBranchId,
      dataPrintCash,
      totalCodValueCash,
      'cash',
    );
    // #endregion data cash

    // #region data cashless [optional]
    if (payload.dataCashless.length) {
      for (const item of payload.dataCashless) {
        const awbValid = await this.validStatusAwb(item.awbItemId);
        if (awbValid) {
          totalCodValue += Number(item.codValue);
          totalCodValueCashless += Number(item.codValue);
          totalAwbSuccess += 1;

          const dataCashless = await this.handleAwbCod(
            item,
            codBranch.codTransactionBranchId,
            permissonPayload.branchId,
            authMeta.userId,
            awbValid.partnerId,
            metaPrint.employeeIdDriver,
          );
          dataPrintCashless.push(dataCashless);
        } else {
          // NOTE: error message
          const errorMessage = `status resi ${
            item.awbNumber
          } tidak valid, mohon di cek ulang!`;
          dataError.push(errorMessage);
        }
      } // end of loop data cashless

      // store data print cashless on redis
      printIdCashless = await this.printStoreData(
        metaPrint,
        codBranch.codTransactionBranchId,
        dataPrintCashless,
        totalCodValueCashless,
        'cashless',
      );
    } // end of check data cashless
    // #endregion data cashless

    // update total
    await CodTransactionBranch.update(
      {
        codTransactionBranchId: codBranch.codTransactionBranchId,
      },
      {
        totalCodValue,
        totalAwb: totalAwbSuccess,
        transactionStatusId: 30000,
      },
    );

    // const groupPayment = groupBy(payload.data, 'paymentMethod');
    const result = new WebCodTransferBranchResponseVm();
    result.transactionCode = codBranch.transactionCode;
    result.transactionDate = codBranch.transactionDate.toDateString();

    result.printIdCash = printIdCash;
    result.printIdCashless = printIdCashless;
    result.dataError = dataError;
    return result;
  }

  // func private ==============================================================
  private static async handleAwbCod(
    item: WebCodAwbPayloadVm,
    parentId: string,
    branchId: number,
    userId: number,
    partnerId: number,
    employeeIdDriver: number,
  ): Promise<WebCodAwbPrintVm> {
    const branchDetail = new CodTransactionBranchDetail();
    branchDetail.codTransactionBranchId = parentId;
    branchDetail.awbItemId = item.awbItemId;
    branchDetail.awbNumber = item.awbNumber;
    branchDetail.codValue = item.codValue;
    branchDetail.paymentMethod = item.paymentMethod;
    branchDetail.consigneeName = item.consigneeName;
    branchDetail.branchId = branchId;
    branchDetail.partnerId = partnerId;
    branchDetail.userIdDriver = item.userIdDriver;

    // for data cashless
    branchDetail.paymentService = item.paymentService;
    branchDetail.noReference = item.noReference;

    await CodTransactionBranchDetail.insert(branchDetail);
    // NOTE: update status, insert awb history
    // send background process with bull
    // awb status 40000 (Setor Dana)
    DoPodDetailPostMetaQueueService.createJobByCodTransferBranch(
      item.awbItemId,
      40000,
      branchId,
      userId,
      employeeIdDriver,
    );

    // awb status 45000 (Terima Dana)
    DoPodDetailPostMetaQueueService.createJobByCodTransferBranch(
      item.awbItemId,
      45000,
      branchId,
      userId,
      employeeIdDriver,
    );

    const result = new WebCodAwbPrintVm();
    result.awbNumber = item.awbNumber;
    result.codValue = item.codValue;
    result.provider = item.paymentService;
    return result;
  }

  private static async validStatusAwb(awbItemId: number): Promise<WebCodAwbValidVm> {
    // check awb status mush valid dlv
    // get data partner id??
    const qb = createQueryBuilder();
    qb.addSelect('a.awb_item_id', 'awbItemId');
    qb.addSelect('a.awb_status_id_last', 'awbStatusIdLast');
    qb.addSelect('c.partner_id', 'partnerId');
    qb.from('awb_item_attr', 'a');
    qb.innerJoin(
      'pickup_request_detail',
      'b',
      'a.awb_item_id = b.awb_item_id AND b.is_deleted = false',
    );
    qb.innerJoin(
      'pickup_request',
      'c',
      'c.pickup_request_id = b.pickup_request_id AND c.is_deleted = false',
    );
    qb.where('a.awb_item_id = :awbItemId', { awbItemId });
    qb.andWhere('a.is_deleted = false');

    const awbValid = await qb.getRawOne();
    if (awbValid && awbValid.awbStatusIdLast == AWB_STATUS.DLV) {
      return awbValid;
    } else {
      return null;
    }
  }

  // handle data store for printing
  private static async generatePrintMeta(
    transactionCode: string,
    adminName: string,
    branchId: number,
    userIdDriver: number,
  ): Promise<WebCodPrintMetaVm> {
    const timestamp = moment();
    const result = new WebCodPrintMetaVm();

    result.transactionCode = transactionCode;
    result.transactionDate = timestamp.format('DD/MM/YY');
    result.transactionTime = timestamp.format('HH:mm');
    result.adminName = adminName;

    const branch = await Branch.findOne({
      select: ['branchId', 'branchName'],
      where: {
        branchId,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!branch) {
      throw new BadRequestException('Gerai tidak ditemukan!');
    }

    const user = await User.findOne({
      select: ['userId', 'employeeId', 'firstName'],
      where: {
        userId: userIdDriver,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }

    result.branchName = branch.branchName;
    result.driverName = user.firstName;
    result.employeeIdDriver = user.employeeId;
    return result;
  }

  private static async printStoreData(
    metaPrint: WebCodPrintMetaVm,
    codTransactionBranchId: string,
    data: WebCodAwbPrintVm[],
    totalValue: number,
    type: string,
  ): Promise<string> {
    metaPrint.totalCodValue = totalValue;
    metaPrint.totalItems = data.length;
    const storePrint = new PrintCodTransferBranchVm();

    storePrint.meta = metaPrint;
    storePrint.data = data;
    // store redis
    const printId = `${codTransactionBranchId}--${type}`;
    await PrintByStoreService.storeGenericPrintData(
      'cod-transfer-branch',
      printId,
      storePrint,
    );
    return printId;
  }
}
