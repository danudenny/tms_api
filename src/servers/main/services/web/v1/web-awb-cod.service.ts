// #region import
import { createQueryBuilder, getManager, Not } from 'typeorm';

import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';

import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { CodBankStatement } from '../../../../../shared/orm-entity/cod-bank-statement';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { User } from '../../../../../shared/orm-entity/user';
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import {
    CodFirstTransactionQueueService,
} from '../../../../queue/services/cod/cod-first-transaction-queue.service';
import {
    WebCodAwbPayloadVm, WebCodBankStatementCancelPayloadVm, WebCodBankStatementValidatePayloadVm,
    WebCodFirstTransactionPayloadVm, WebCodTransferHeadOfficePayloadVm, WebCodTransferPayloadVm, WebCodTransactionUpdatePayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    PrintCodTransferBranchVm, WebAwbCodBankStatementResponseVm, WebAwbCodListResponseVm, WebAwbCodDlvListResponseVm,
    WebAwbCodListTransactionResponseVm, WebCodAwbPrintVm, WebCodBankStatementResponseVm,
    WebCodPrintMetaVm, WebCodTransactionDetailResponseVm, WebCodTransferBranchResponseVm,
    WebCodTransferHeadOfficeResponseVm,
    WebCodTransactionUpdateResponseVm,
    WebAwbCodVoidListResponseVm,
    WebCodCountResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { PrintByStoreService } from '../../print-by-store.service';

import moment = require('moment');
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
import { CodUpdateTransactionQueueService } from '../../../../queue/services/cod/cod-update-transaction-queue.service';
import { CodSyncTransactionQueueService } from '../../../../queue/services/cod/cod-sync-transaction-queue.service';
import { MongoDbConfig } from '../../../config/database/mongodb.config';
import { RedisService } from '../../../../../shared/services/redis.service';
import { CodUserToBranch } from '../../../../../shared/orm-entity/cod-user-to-branch';
// #endregion
export class V1WebAwbCodService {

  static async awbCod(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't1.updated_time';
    payload.fieldResolverMap['branchIdLast'] = 't1.branch_id_last';
    payload.fieldResolverMap['branchIdFinal'] = 't8.branch_id';
    payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['awbStatusIdFinal'] = 't1.awb_status_id_final';
    payload.fieldResolverMap['codPaymentMethod'] = 't8.cod_payment_method';

    payload.fieldResolverMap['awbStatusLast'] = 't7.awb_status_title';
    payload.fieldResolverMap['awbStatusFinal'] = 't11.awb_status_title';
    payload.fieldResolverMap['branchNameLast'] = 't6.branch_name';
    payload.fieldResolverMap['branchNameFinal'] = 't12.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't4.user_id';
    payload.fieldResolverMap['driverName'] = 't4.first_name';
    payload.fieldResolverMap['packageTypeCode'] = 't5.package_type_code';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['transactionStatusName'] = 't9.status_title';

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
      ['t1.awb_status_id_final', 'awbStatusIdFinal'],
      ['t11.awb_status_title', 'awbStatusFinal'],
      ['t1.branch_id_last', 'branchIdLast'],
      ['t6.branch_name', 'branchNameLast'],
      ['t8.branch_id', 'branchIdFinal'],
      ['t12.branch_name', 'branchNameFinal'],
      ['t2.awb_date', 'manifestedDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t8.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      [`t8.cod_payment_method`, 'codPaymentMethod'],
      ['t8.cod_payment_service', 'codPaymentService'],
      ['t8.no_reference', 'noReference'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t9.status_title', 'transactionStatusName'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(
      e => e.codPayment.userDriver,
      't4',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment.branchFinal, 't12', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusFinal, 't11', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.transactionStatus, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (permissonPayload.roleName === 'CT Transit (COD)' && !permissonPayload.isHeadOffice) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }
    //#endregion

    if (permissonPayload.roleName === 'Ops - Admin COD') {
      q.andWhere(e => e.codPayment.branchId, w => w.equals(permissonPayload.branchId));
    }

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // q.andWhere(e => e.awbStatus.isCod, w => w.isTrue());
    // filter DLV
    q.andWhere(
      e => e.awbStatusIdFinal,
      w => w.equals(30000),
    );

    const data = await q.exec();
    const total = 0;

    const result = new WebAwbCodListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async countAwbCod(
    payload: BaseMetaPayloadVm,
  ): Promise<WebCodCountResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't1.updated_time';
    payload.fieldResolverMap['branchIdLast'] = 't1.branch_id_last';
    payload.fieldResolverMap['branchIdFinal'] = 't8.branch_id';
    payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['awbStatusIdFinal'] = 't1.awb_status_id_final';
    payload.fieldResolverMap['codPaymentMethod'] = 't8.cod_payment_method';

    payload.fieldResolverMap['awbStatusLast'] = 't7.awb_status_title';
    payload.fieldResolverMap['awbStatusFinal'] = 't11.awb_status_title';
    payload.fieldResolverMap['branchNameLast'] = 't6.branch_name';
    payload.fieldResolverMap['branchNameFinal'] = 't12.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't4.user_id';
    payload.fieldResolverMap['driverName'] = 't4.first_name';
    payload.fieldResolverMap['packageTypeCode'] = 't5.package_type_code';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['transactionStatusName'] = 't9.status_title';

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
      ['t1.awb_status_id_final', 'awbStatusIdFinal'],
      ['t11.awb_status_title', 'awbStatusFinal'],
      ['t1.branch_id_last', 'branchIdLast'],
      ['t6.branch_name', 'branchNameLast'],
      ['t8.branch_id', 'branchIdFinal'],
      ['t12.branch_name', 'branchNameFinal'],
      ['t2.awb_date', 'manifestedDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t8.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      [`t8.cod_payment_method`, 'codPaymentMethod'],
      ['t8.cod_payment_service', 'codPaymentService'],
      ['t8.no_reference', 'noReference'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t9.status_title', 'transactionStatusName'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(
      e => e.codPayment.userDriver,
      't4',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment.branchFinal, 't12', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusFinal, 't11', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.transactionStatus, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (permissonPayload.roleName === 'CT Transit (COD)' && !permissonPayload.isHeadOffice) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }
    //#endregion

    if (permissonPayload.roleName === 'Ops - Admin COD') {
      q.andWhere(e => e.codPayment.branchId, w => w.equals(permissonPayload.branchId));
    }

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // q.andWhere(e => e.awbStatus.isCod, w => w.isTrue());
    // filter DLV
    q.andWhere(
      e => e.awbStatusIdFinal,
      w => w.equals(30000),
    );

    const total = await q.countWithoutTakeAndSkip();
    const result = new WebCodCountResponseVm();

    result.total = total;

    return result;
  }

  static async awbCodDlv(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodDlvListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't8.updated_time';
    payload.fieldResolverMap['branchIdLast'] = 't8.branch_id';
    payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['awbStatusIdFinal'] = 't1.awb_status_id_final';
    payload.fieldResolverMap['codPaymentMethod'] = 't8.cod_payment_method';

    payload.fieldResolverMap['awbStatusLast'] = 't7.awb_status_title';
    payload.fieldResolverMap['branchNameLast'] = 't6.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't4.user_id';
    payload.fieldResolverMap['driverName'] = 't4.first_name';
    payload.fieldResolverMap['packageTypeCode'] = 't5.package_type_code';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['transactionStatusName'] = 't9.status_title';

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
      ['t8.updated_time', 'transactionDate'],
      ['t1.awb_status_id_final', 'awbStatusIdLast'],
      ['t1.awb_status_id_final', 'awbStatusIdFinal'],
      ['t7.awb_status_title', 'awbStatusLast'],
      ['t8.branch_id', 'branchIdLast'],
      ['t6.branch_name', 'branchNameLast'],
      ['t2.awb_date', 'manifestedDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t8.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      [`t8.cod_payment_method`, 'codPaymentMethod'],
      ['t8.cod_payment_service', 'codPaymentService'],
      ['t8.no_reference', 'noReference'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t9.created_time', 'pickupRequestTime'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(
      e => e.codPayment.userDriver,
      't4',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.codPayment.branchFinal, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusFinal, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (permissonPayload.roleName === 'CT Transit (COD)' && !permissonPayload.isHeadOffice) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }
    //#endregion

    if (permissonPayload.roleName === 'Ops - Admin COD') {
      q.andWhere(e => e.codPayment.branchId, w => w.equals(permissonPayload.branchId));
    }

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.transactionStatusId, w => w.isNull());
    q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // filter DLV
    q.andWhere(
      e => e.awbStatusIdFinal,
      w => w.equals(30000),
    );

    const data = await q.exec();
    const total = 0;

    const result = new WebAwbCodDlvListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async countAwbCodDlv(
    payload: BaseMetaPayloadVm,
  ): Promise<WebCodCountResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't8.updated_time';
    payload.fieldResolverMap['branchIdLast'] = 't8.branch_id';
    payload.fieldResolverMap['awbStatusIdLast'] = 't1.awb_status_id_last';
    payload.fieldResolverMap['awbStatusIdFinal'] = 't1.awb_status_id_final';

    payload.fieldResolverMap['awbStatusLast'] = 't7.awb_status_title';
    payload.fieldResolverMap['branchNameLast'] = 't6.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't4.user_id';
    payload.fieldResolverMap['driverName'] = 't4.first_name';
    payload.fieldResolverMap['packageTypeCode'] = 't5.package_type_code';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';

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
      ['t8.updated_time', 'transactionDate'],
      ['t1.awb_status_id_last', 'awbStatusIdLast'],
      ['t1.awb_status_id_final', 'awbStatusIdFinal'],
      ['t7.awb_status_title', 'awbStatusLast'],
      ['t8.branch_id', 'branchIdLast'],
      ['t6.branch_name', 'branchNameLast'],
      ['t2.awb_date', 'manifestedDate'],
      ['t2.consignee_name', 'consigneeName'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t8.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      ['t1.transaction_status_id', 'transactionStatusId'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(
      e => e.codPayment.userDriver,
      't4',
      j => j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.codPayment.branchFinal, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusFinal, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (permissonPayload.roleName === 'CT Transit (COD)' && !permissonPayload.isHeadOffice) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }
    //#endregion

    if (permissonPayload.roleName === 'Ops - Admin COD') {
      q.andWhere(e => e.codPayment.branchId, w => w.equals(permissonPayload.branchId));
    }

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(e => e.transactionStatusId, w => w.isNull());
    q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // filter DLV
    q.andWhere(
      e => e.awbStatusIdFinal,
      w => w.equals(30000),
    );

    const total = await q.countWithoutTakeAndSkip();

    const result = new WebCodCountResponseVm();

    result.total = total;

    return result;
  }

  static async awbVoid(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodVoidListResponseVm> {
    // mapping field
    payload.fieldResolverMap['userHO'] = 't3.first_name';
    payload.fieldResolverMap['adminName'] = 't4.first_name';
    payload.fieldResolverMap['driverName'] = 't5.first_name';
    payload.fieldResolverMap['userIdHO'] = 't2.user_id_updated';
    payload.fieldResolverMap['userIdAdmin'] = 't1.user_id_updated';
    payload.fieldResolverMap['transferDatetime'] = 't2.transfer_datetime';
    payload.fieldResolverMap['voidDatetime'] = 't1.updated_time';
    payload.fieldResolverMap['manifestedDate'] = 't1.pod_date';

    if (payload.sortBy === '') {
      payload.sortBy = 'voidDatetime';
    }

    const repo = new OrionRepositoryService(CodTransactionDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_number', 'awbNumber'],
      ['t1.pod_date', 'manifestedDate'],
      ['t2.transfer_datetime', 'transferDatetime'],
      ['t1.updated_time', 'voidDatetime'],
      ['t1.consignee_name', 'consigneeName'],
      ['t1.package_type_id', 'packageTypeId'],
      ['t1.package_type_code', 'packageTypeCode'],
      ['t1.cod_value', 'codValue'],
      ['t1.void_note', 'voidNote'],
      ['t1.user_id_driver', 'userIdDriver'],
      ['t1.user_id_updated', 'userIdAdmin'],
      ['t2.user_id_updated', 'userIdHO'],
      ['t3.first_name', 'userHO'],
      ['t4.first_name', 'adminName'],
      ['t5.first_name', 'driverName'],
    );
    q.innerJoin(e => e.userAdmin, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.userDriver, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.transactionBranch.bankStatement, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.transactionBranch.bankStatement.userAdmin, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isVoid, w => w.isTrue());
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodVoidListResponseVm();

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
    const totalCodValue = 0;
    let totalAwbCash = 0;
    let totalAwbCashless = 0;
    const dataError = [];

    let totalCodValueCash = 0;
    let totalCodValueCashless = 0;
    const dataPrintCash: WebCodAwbPrintVm[] = [];
    const dataPrintCashless: WebCodAwbPrintVm[] = [];
    let printIdCash = null;
    let printIdCashless = null;

    // TODO: transction ??

    // #region data cash [optional]
    if (payload.dataCash.length) {
      const codBranchCash = new CodTransaction();
      const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
      codBranchCash.transactionCode = randomCode;
      codBranchCash.transactionDate = timestamp;
      codBranchCash.transactionStatusId = 27500; // status process;
      codBranchCash.transactionType = 'CASH';
      codBranchCash.totalCodValue = totalCodValue;
      codBranchCash.totalAwb = totalAwbCash;
      codBranchCash.branchId = permissonPayload.branchId;
      codBranchCash.userIdDriver = payload.userIdDriver;
      await CodTransaction.save(codBranchCash);

      const userIdDriver = payload.userIdDriver;
      const metaPrint = await this.generatePrintMeta(
        codBranchCash.transactionCode,
        authMeta.displayName,
        authMeta.username,
        permissonPayload.branchId,
        userIdDriver,
      );

      for (const item of payload.dataCash) {
        // handle race condition
        const redlock = await RedisService.redlock(`redlock:transaction:${item.awbNumber}`, 10);
        if (redlock) {
          const awbValid = await this.validStatusAwb(item.awbItemId);
          if (awbValid) {
            // totalCodValue += Number(item.codValue);
            totalCodValueCash += Number(item.codValue);
            totalAwbCash += 1;

            // send to background process
            const dataCash = await this.handleAwbCod(
              item,
              codBranchCash.codTransactionId,
              permissonPayload.branchId,
              authMeta.userId,
            );

            dataPrintCash.push(dataCash);
          } else {
            const errorMessage = `status resi ${
              item.awbNumber
            } tidak valid, mohon di cek ulang!`;
            dataError.push(errorMessage);
          }
        } else {
          dataError.push(`resi ${item.awbNumber} sedang d proses!!`);
        }
      } // end of loop data cash

      if (dataPrintCash.length) {
        // store data print cash on redis
        printIdCash = await this.printStoreData(
          metaPrint,
          codBranchCash.codTransactionId,
          dataPrintCash,
          totalCodValueCash,
          'cash',
        );

        // update data
        await CodTransaction.update(
          {
            codTransactionId: codBranchCash.codTransactionId,
          },
          {
            totalCodValue: totalCodValueCash,
            totalAwb: totalAwbCash,
            transactionStatusId: 31000,
          },
        );
      }
    }
    // #endregion data cash

    // #region data cashless [optional]
    if (payload.dataCashless.length) {
      const codBranchCashless = new CodTransaction();
      const randomCode = await CustomCounterCode.transactionCodBranch(
        timestamp,
      );
      codBranchCashless.transactionCode = randomCode;
      codBranchCashless.transactionDate = timestamp;
      codBranchCashless.transactionStatusId = 27500; // status process;
      codBranchCashless.transactionType = 'CASHLESS';
      codBranchCashless.totalCodValue = totalCodValue;
      codBranchCashless.totalAwb = totalAwbCashless;
      codBranchCashless.branchId = permissonPayload.branchId;
      codBranchCashless.userIdDriver = payload.userIdDriver;
      await CodTransaction.save(codBranchCashless);

      const userIdDriver = payload.userIdDriver;
      const metaPrint = await this.generatePrintMeta(
        codBranchCashless.transactionCode,
        authMeta.displayName,
        authMeta.username,
        permissonPayload.branchId,
        userIdDriver,
      );

      for (const item of payload.dataCashless) {
        // handle race condition
        const redlock = await RedisService.redlock(`redlock:transaction:${item.awbNumber}`, 10);
        if (redlock) {
          const awbValid = await this.validStatusAwb(item.awbItemId);
          if (awbValid) {
            // totalCodValue += Number(item.codValue);
            totalCodValueCashless += Number(item.codValue);
            totalAwbCashless += 1;

            const dataCashless = await this.handleAwbCod(
              item,
              codBranchCashless.codTransactionId,
              permissonPayload.branchId,
              authMeta.userId,
            );

            dataPrintCashless.push(dataCashless);
          } else {
            // NOTE: error message
            const errorMessage = `status resi ${
              item.awbNumber
            } tidak valid, mohon di cek ulang!`;
            dataError.push(errorMessage);
          }
        } else {
          dataError.push(`resi ${item.awbNumber} sedang d proses!!`);
        }
      } // end of loop data cashless

      if (dataPrintCashless.length) {
        // store data print cashless on redis
        printIdCashless = await this.printStoreData(
          metaPrint,
          codBranchCashless.codTransactionId,
          dataPrintCashless,
          totalCodValueCashless,
          'cashless',
        );

        // update data
        await CodTransaction.update(
          {
            codTransactionId: codBranchCashless.codTransactionId,
          },
          {
            totalCodValue: totalCodValueCashless,
            totalAwb: totalAwbCashless,
            transactionStatusId: 35000,
          },
        );
      }
    } // end of check data cashless
    // #endregion data cashless

    // const groupPayment = groupBy(payload.data, 'paymentMethod');
    const result = new WebCodTransferBranchResponseVm();
    result.printIdCash = printIdCash;
    result.printIdCashless = printIdCashless;
    result.dataError = dataError;
    return result;
  }

  static async transactionBranch(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodListTransactionResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['transactionStatus'] = 't2.status_title';
    payload.fieldResolverMap['driverName'] = 't5.first_name';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['adminName'] = 't4.first_name';
    payload.fieldResolverMap['adminId'] = 't1.user_id_updated';
    payload.fieldResolverMap['transactionStatusId'] = 't1.transaction_status_id';
    payload.fieldResolverMap['branchIdLast'] = 't1.branch_id';
    payload.fieldResolverMap['districtId'] = 't3.district_id';
    payload.fieldResolverMap['representativeId'] = 't3.representative_id';

    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'awbNumber',
    //   },
    // ];
    if (payload.sortBy === '') {
      payload.sortBy = 'transactionDate';
    }

    const repo = new OrionRepositoryService(CodTransaction, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.cod_transaction_id', 'transactionId'],
      ['t1.transaction_code', 'transactionCode'],
      ['t1.transaction_date', 'transactionDate'],
      ['t1.transaction_type', 'transactionType'],
      ['t1.transaction_note', 'transactionNote'],
      ['t1.transaction_status_id', 'transactionStatusId'],
      ['t2.status_title', 'transactionStatus'],
      ['t1.total_awb', 'totalAwb'],
      ['t1.total_cod_value', 'totalCodValue'],
      ['t3.branch_name', 'branchName'],
      ['t1.user_id_updated', 'adminId'],
      ['t4.first_name', 'adminName'],
      ['t1.user_id_driver', 'userIdDriver'],
      ['t5.first_name', 'driverName'],
    );

    q.innerJoin(e => e.transactionStatus, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.userAdmin, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (permissonPayload.roleName === 'CT Transit (COD)' && !permissonPayload.isHeadOffice) {
      q.innerJoin(e => e.codUserToBranch, 't10', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }

    if (permissonPayload.roleName === 'Ops - Admin COD') {
      q.andWhere(e => e.branchId, w => w.equals(permissonPayload.branchId));
    }
    //#endregion

    // TODO: change to inner join
    q.leftJoin(e => e.userDriver, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodListTransactionResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async transactionBranchDetail(
    id: string,
  ): Promise<WebCodTransactionDetailResponseVm> {
    // awb number | method | penerima | nilai cod
    const qb = createQueryBuilder();
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t1.payment_method', 'paymentMethod');
    qb.addSelect('t1.consignee_name', 'consigneeName');
    qb.addSelect('t1.cod_value', 'codValue');

    qb.from('cod_transaction_detail', 't1');
    qb.where('t1.cod_transaction_id = :id', { id });
    qb.andWhere('t1.is_deleted = false');

    const data = await qb.getRawMany();
    if (data.length) {
      const result = new WebCodTransactionDetailResponseVm();
      result.data = data;
      return result;
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }
  }

  // NOTE: remove awb from transaction
  static async transactionBranchUpdate(
    payload: WebCodTransactionUpdatePayloadVm,
  ): Promise<WebCodTransactionUpdateResponseVm> {
    const authMeta = AuthService.getAuthData();

    const timestamp = moment().toDate();
    const dataError = [];
    let totalSuccess = 0;
    let totalCodValue = 0;

    const transaction = await CodTransaction.findOne({
      where: {
        codTransactionId: payload.transactionId,
        isDeleted: false,
      },
    });

    if (!transaction) {
      throw new BadRequestException('Data transaction tidak valid!');
    }

    // TODO: transaction process??
    try {
      // NOTE: loop data awb and update transaction detail
      for (const awb of payload.awbNumber) {
        // cancel all transaction status
        const transactionDetail = await CodTransactionDetail.findOne({
          select: ['codTransactionDetailId', 'awbNumber', 'codValue', 'awbItemId'],
          where: {
            awbNumber: awb,
            codTransactionId: payload.transactionId,
            isDeleted: false,
          },
        });
        if (transactionDetail) {

          await AwbItemAttr.update({
            awbItemId: transactionDetail.awbItemId,
          }, {
            transactionStatusId: null,
          });

          // remove awb from transaction
          await CodTransactionDetail.update(
            {
              codTransactionDetailId: transactionDetail.codTransactionDetailId,
            },
            {
              codTransactionId: null,
              transactionStatusId: 30000,
              updatedTime: timestamp,
              userIdUpdated: authMeta.userId,
            },
          );

          // sync update data to mongodb
          CodSyncTransactionQueueService.perform(
            awb,
            null,
            TRANSACTION_STATUS.SIGESIT,
            null,
            null,
            authMeta.userId,
            timestamp,
          );

          totalCodValue += Number(transactionDetail.codValue);
          totalSuccess += 1;
        } else {
          // error message
          const errorMessage = `Resi ${awb} tidak valid, sudah di proses!`;
          dataError.push(errorMessage);
        }
      } // end of loop
      // update data table transaction
      if (totalSuccess > 0) {
        const totalAwb = Number(transaction.totalAwb) - totalSuccess;
        const calculateCodValue = Number(transaction.totalCodValue) - totalCodValue;
        await CodTransaction.update(
          {
            codTransactionId: transaction.codTransactionId,
          },
          {
            totalAwb,
            totalCodValue: calculateCodValue,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );
      }
      const result = new WebCodTransactionUpdateResponseVm();
      if (dataError.length) {
        result.status = 'error';
        result.message = 'error';
      } else {
        result.status = 'ok';
        result.message = 'success';
      }
      result.totalSuccess = totalSuccess;
      result.dataError = dataError;
      return result;
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  // NOTE: for testing only
  static async syncData() {
    // get config mongodb
    const collection = await MongoDbConfig.getDbSicepatCod('transaction_detail');
    // const items = await collection.find({}).toArray

    const data = await CodTransactionDetail.find(
      {
        where: {
          transactionStatusId: 40000,
        },
      });

    for (const item of data) {
      delete item['changedValues'];
      item.userIdCreated = Number(item.userIdCreated);
      item.userIdUpdated = Number(item.userIdUpdated);

      try {
        const checkData = await collection.findOne({
          _id: item.awbNumber,
        });
        if (checkData) {

          const objUpdate = {
            codTransactionId: item.codTransactionId,
            transactionStatusId: item.transactionStatusId,
            codSupplierInvoiceId: item.codSupplierInvoiceId,
            supplierInvoiceStatusId: item.supplierInvoiceStatusId,
            isVoid: item.isVoid,
            updatedTime: item.updatedTime,
            userIdUpdated: item.userIdUpdated,
          };
          await collection.updateOne(
            { _id: item.awbNumber },
            {
              $set: objUpdate,
            },
          );
        } else {
          console.log('### AWB NUMBER :: ', item.awbNumber);
          await collection.insertOne({ _id: item.awbNumber, ...item });
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    } // end of loop
    console.log(' ###### TOTAL DATA :: ', data.length);
    return true;
  }

  // func private ==============================================================
  private static async handleAwbCod(
    item: WebCodAwbPayloadVm,
    transctiontId: string,
    branchId: number,
    userId: number,
  ): Promise<WebCodAwbPrintVm> {

    // update awb_item_attr transaction status 3100
    await AwbItemAttr.update(
      { awbItemId: item.awbItemId },
      {
        transactionStatusId: TRANSACTION_STATUS.TRM,
      },
    );

    // #region send to background process with bull
    const firstTransaction = new WebCodFirstTransactionPayloadVm();
    firstTransaction.awbItemId = item.awbItemId;
    firstTransaction.awbNumber = item.awbNumber;
    firstTransaction.codTransactionId = transctiontId;
    firstTransaction.transactionStatusId = 31000;
    firstTransaction.supplierInvoiceStatusId = null;
    firstTransaction.codSupplierInvoiceId = null;
    firstTransaction.paymentMethod = item.paymentMethod;
    firstTransaction.paymentService = item.paymentService;
    firstTransaction.noReference = item.noReference;
    firstTransaction.branchId = branchId;
    firstTransaction.userId = userId;
    firstTransaction.userIdDriver = item.userIdDriver;
    CodFirstTransactionQueueService.perform(firstTransaction, moment().toDate());
    // #endregion send to background

    // response
    const result = new WebCodAwbPrintVm();
    result.awbNumber = item.awbNumber;
    result.codValue = item.codValue;
    result.provider = item.paymentService;
    return result;
  }

  private static async validStatusAwb(awbItemId: number): Promise<boolean> {
    // check awb status mush valid dlv
    const awbValid = await AwbItemAttr.findOne({
      select: ['awbItemAttrId', 'awbItemId', 'awbStatusIdFinal'],
      where: {
        awbItemId,
        awbStatusIdFinal: AWB_STATUS.DLV,
        isDeleted: false,
      },
    });
    if (awbValid) {
      return true;
    } else {
      return false;
    }
  }

  // handle data store for printing
  private static async generatePrintMeta(
    transactionCode: string,
    adminName: string,
    nikAdmin: string,
    branchId: number,
    userIdDriver: number,
  ): Promise<WebCodPrintMetaVm> {
    const timestamp = moment();
    const result = new WebCodPrintMetaVm();

    result.transactionCode = transactionCode;
    result.transactionDate = timestamp.format('DD/MM/YY');
    result.transactionTime = timestamp.format('HH:mm');
    result.adminName = adminName;
    result.nikAdmin = nikAdmin;

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
      select: ['userId', 'employeeId', 'firstName', 'username'],
      where: {
        userId: userIdDriver,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }
    // for data print store
    result.branchName = branch.branchName;
    result.driverName = user.firstName;
    result.nikDriver = user.username;
    return result;
  }

  private static async printStoreData(
    metaPrint: WebCodPrintMetaVm,
    codTransactionId: string,
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
    const printId = `${codTransactionId}--${type}`;
    await PrintByStoreService.storeGenericPrintData(
      'cod-transfer-branch',
      printId,
      storePrint,
    );
    return printId;
  }
}
