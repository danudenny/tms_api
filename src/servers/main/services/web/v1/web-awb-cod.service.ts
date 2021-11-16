// #region import
import {
  createQueryBuilder,
  getManager,
  getConnection,
} from 'typeorm';

import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { User } from '../../../../../shared/orm-entity/user';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { CodFirstTransactionQueueService } from '../../../../queue/services/cod/cod-first-transaction-queue.service';
import {
  WebCodAwbPayloadVm,
  WebCodFirstTransactionPayloadVm,
  WebCodTransferPayloadVm,
  WebCodTransactionUpdatePayloadVm,
  WebInsertCodPaymentPayloadVm,
  WebCodTransactionRejectPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
  PrintCodTransferBranchVm,
  WebAwbCodListResponseVm,
  WebAwbCodDlvListResponseVm,
  WebAwbCodListTransactionResponseVm,
  WebCodAwbPrintVm,
  WebCodPrintMetaVm,
  WebCodTransactionDetailResponseVm,
  WebCodTransferBranchResponseVm,
  WebCodTransactionUpdateResponseVm,
  WebAwbCodVoidListResponseVm,
  WebCodCountResponseVm,
  WebAwbCodDlvV2ListResponseVm,
  WebInsertCodPaymentResponseVm,
  WebCodTransferBranchCashResponseVm,
  WebCodTransferBranchCashlessResponseVm,
  WebAwbCodSummaryResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { PrintByStoreService } from '../../print-by-store.service';

import moment = require('moment');
import {
  TRANSACTION_STATUS,
} from '../../../../../shared/constants/transaction-status.constant';
import { CodSyncTransactionQueueService } from '../../../../queue/services/cod/cod-sync-transaction-queue.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import { CodPayment } from '../../../../../shared/orm-entity/cod-payment';
import { AuthLoginMetadata } from '../../../../../shared/models/auth-login-metadata.model';
import { JwtPermissionTokenPayload } from '../../../../../shared/interfaces/jwt-payload.interface';
import { RoleGroupService } from '../../../../../shared/services/role-group.service';
// #endregion
export class V1WebAwbCodService {
  static async awbSummary(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodSummaryResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();

    // mapping field
    payload.fieldResolverMap['transactionDate'] = 'cp.updated_time';
    payload.fieldResolverMap['transactionStatusId'] =
      't1.transaction_status_id';
    payload.fieldResolverMap['branchIdFinal'] = 'cp.branch_id';
    payload.fieldResolverMap['codPaymentMethod'] = 'cp.cod_payment_method';
    payload.fieldResolverMap['representativeId'] = 'branch.representative_id';
    payload.fieldResolverMap['userIdDriver'] = 'cp.user_id_driver';

    const repo = new OrionRepositoryService(AwbItemAttr, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['rep.representative_code', 'perwakilan'],
      ['branch.branch_id', 'branchIdFinal'],
      ['branch.branch_name', 'branchNameFinal'],
      ['SUM(cp.cod_value)', 'priceCod'],
      ['COUNT(t1.awb_item_id)', 'countAwb'],
    );

    q.innerJoin(e => e.codPayment, 'cp', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment.branchFinal, 'branch', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment.branchFinal.representative, 'rep', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region handle Role COD
    if (
      RoleGroupService.isRoleCodMerge(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 'codmerger', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }

    if (
      RoleGroupService.isRoleCodAdmin(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.andWhere(
        e => e.codPayment.branchId,
        w => w.equals(permissionPayload.branchId),
      );
    }
    //#endregion

    q.andWhere(e => e.awbStatusIdFinal, w => w.equals(AWB_STATUS.DLV));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    q.groupByRaw(`
      branch.branch_id, rep.representative_id
    `);

    q.orderByRaw('SUM(cp.cod_value)', 'DESC');

    const data = await q.exec();
    const total = 0;

    const result = new WebAwbCodSummaryResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async awbCod(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't8.updated_time';
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
    payload.fieldResolverMap['transactionStatusId'] =
      't1.transaction_status_id';
    payload.fieldResolverMap['transactionStatusName'] = 't9.status_title';
    payload.fieldResolverMap['representativeId'] = 't12.representative_id';

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
      ['t1.awb_history_date_last', 'transactionDate'],
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
      ['coalesce(t8.branch_id, t1.branch_id_last)', 'branchIdCopy'],
      ['coalesce(t12.branch_name, t6.branch_name)', 'branchNameCopy'],
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j
        .andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.isCod, w => w.isTrue()),
    );

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbStatusFinal, 't11', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.transactionStatus, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment.userDriver, 't4');

    q.leftJoin(e => e.codPayment.branchFinal, 't12', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (
      RoleGroupService.isRoleCodMerge(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }

    if (
      RoleGroupService.isRoleCodAdmin(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.andWhere(
        e => e.codPayment.branchId,
        w => w.equals(permissionPayload.branchId),
      );
    }
    //#endregion

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    // q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // q.andWhere(e => e.awbStatus.isCod, w => w.isTrue());
    // filter DLV
    // q.andWhere(e => e.awbStatusIdFinal, w => w.equals(30000));

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
    const permissionPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['codValue'] = 't2.total_cod_value';
    payload.fieldResolverMap['manifestedDate'] = 't2.awb_date';
    payload.fieldResolverMap['transactionDate'] = 't8.updated_time';
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
    payload.fieldResolverMap['transactionStatusId'] =
      't1.transaction_status_id';
    payload.fieldResolverMap['transactionStatusName'] = 't9.status_title';
    payload.fieldResolverMap['representativeId'] = 't12.representative_id';

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
      ['t1.awb_history_date_last', 'transactionDate'],
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
      j
        .andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.isCod, w => w.isTrue()),
    );

    q.innerJoin(e => e.pickupRequestDetail, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatus, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.awbStatusFinal, 't11', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.transactionStatus, 't9', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.codPayment.userDriver, 't4');

    q.leftJoin(e => e.codPayment.branchFinal, 't12', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (
      RoleGroupService.isRoleCodMerge(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }

    if (
      RoleGroupService.isRoleCodAdmin(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.andWhere(
        e => e.codPayment.branchId,
        w => w.equals(permissionPayload.branchId),
      );
    }
    //#endregion

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    // q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // q.andWhere(e => e.awbStatus.isCod, w => w.isTrue());
    // filter DLV
    // q.andWhere(e => e.awbStatusIdFinal, w => w.equals(30000));

    const total = await q.countWithoutTakeAndSkip();
    const result = new WebCodCountResponseVm();

    result.total = total;

    return result;
  }

  static async awbCodDlvV2(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodDlvV2ListResponseVm> {
    payload.fieldResolverMap['driverName'] = 't3.first_name';
    payload.fieldResolverMap['branchNameFinal'] = 't4.branch_name';
    payload.fieldResolverMap['branchIdFinal'] = 't4.branch_id';

    if (payload.sortBy === '') {
      payload.sortBy = 'driverName';
    }

    const repo = new OrionRepositoryService(CodPayment, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q);

    q.selectRaw(
      ['t3.first_name', 'driverName'],
      ['count(t3.user_id)', 'totalResi'],
      ['t3.user_id', 'userIdDriver'],
      ['t4.branch_name', 'branchNameFinal'],
      ['t4.branch_id', 'branchIdFinal'],
    );

    q.innerJoin(e => e.awbItemAttr, 't2', j => {
      j.andWhere(e => e.isDeleted, w => w.isFalse());
      j.andWhere(
        e => e.transactionStatusId,
        w => w.equals(TRANSACTION_STATUS.DEFAULT),
      );
      j.andWhere(e => e.awbStatusIdFinal, w => w.equals(AWB_STATUS.DLV));
    });

    q.innerJoin(e => e.userDriver, 't3');
    q.innerJoin(e => e.branchFinal, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    q.groupByRaw(
      't3.user_id, t4.branch_id',
    );

    const data = await q.exec();
    const total = 0;

    const result = new WebAwbCodDlvV2ListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async awbCodDlv(
    payload: BaseMetaPayloadVm,
  ): Promise<WebAwbCodDlvListResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
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
    payload.fieldResolverMap['transactionStatusId'] =
      't1.transaction_status_id';

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
      ['t1.awb_history_date_last', 'transactionDate'],
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
    );

    q.innerJoin(e => e.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment, 't8', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.codPayment.userDriver, 't4');

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.codPayment.branchFinal, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusFinal, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (
      RoleGroupService.isRoleCodMerge(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }

    if (
      RoleGroupService.isRoleCodAdmin(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
        )
    ) {
    q.andWhere(
      e => e.codPayment.branchId,
      w => w.equals(permissionPayload.branchId),
      );
    }
      //#endregion

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(
      e => e.transactionStatusId,
      w => w.equals(TRANSACTION_STATUS.DEFAULT),
    );
    q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // filter DLV
    q.andWhere(e => e.awbStatusIdFinal, w => w.equals(AWB_STATUS.DLV));

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
    const permissionPayload = AuthService.getPermissionTokenPayload();
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
    payload.fieldResolverMap['transactionStatusId'] =
      't1.transaction_status_id';

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
      ['t1.awb_history_date_last', 'transactionDate'],
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

    q.innerJoin(e => e.codPayment.userDriver, 't4');

    q.innerJoin(e => e.awb.packageType, 't5');

    q.innerJoin(e => e.codPayment.branchFinal, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusFinal, 't7', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    //#region Cod Merger
    if (
      RoleGroupService.isRoleCodMerge(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.innerJoin(e => e.codPayment.codUserToBranch, 't10', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }
    //#endregion

    if (
      RoleGroupService.isRoleCodAdmin(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.andWhere(
        e => e.codPayment.branchId,
        w => w.equals(permissionPayload.branchId),
      );
    }

    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhere(
      e => e.transactionStatusId,
      w => w.equals(TRANSACTION_STATUS.DEFAULT),
    );
    q.andWhere(e => e.awb.isCod, w => w.isTrue());
    // filter DLV
    q.andWhere(e => e.awbStatusIdFinal, w => w.equals(AWB_STATUS.DLV));

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
    q.innerJoin(e => e.userAdmin, 't4');
    q.innerJoin(e => e.userDriver, 't5');
    q.leftJoin(e => e.transactionBranch.bankStatement, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.transactionBranch.bankStatement.userAdmin, 't3');

    q.andWhere(e => e.isVoid, w => w.isTrue());
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodVoidListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async transferBranchV2(
    payload: WebCodTransferPayloadVm,
  ): Promise<WebCodTransferBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const uuidv1 = require('uuid/v1');
    const uuidString = uuidv1();

    let codTransactionCash: WebCodTransferBranchCashResponseVm;
    if (payload.dataCash.length > 0) {
      codTransactionCash = await this.transferBranchCash(
        payload,
        authMeta,
        permissionPayload,
        uuidString,
      );
    }

    let codTransactionCashless: WebCodTransferBranchCashlessResponseVm;
    if (payload.dataCashless.length) {
      codTransactionCashless = await this.transferBranchCashless(
        payload,
        authMeta,
        permissionPayload,
        uuidString,
      );
    }

    const printIdCash = codTransactionCash
      ? codTransactionCash.printIdCash
      : null;
    const printIdCashless = codTransactionCashless
      ? codTransactionCashless.printIdCashless
      : null;

    let dataError = [];
    if (codTransactionCash && codTransactionCashless) {
      dataError = codTransactionCash.dataError.concat(
        codTransactionCashless.dataError,
      );
    } else if (codTransactionCash) {
      dataError = codTransactionCash.dataError;
    } else if (codTransactionCashless) {
      dataError = codTransactionCashless.dataError;
    }

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
    const permissionPayload = AuthService.getPermissionTokenPayload();
    // mapping field
    payload.fieldResolverMap['transactionStatus'] = 't2.status_title';
    payload.fieldResolverMap['driverName'] = 't5.first_name';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['adminName'] = 't4.first_name';
    payload.fieldResolverMap['adminId'] = 't1.user_id_updated';
    payload.fieldResolverMap['transactionStatusId'] =
      't1.transaction_status_id';
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
    q.innerJoin(e => e.userAdmin, 't4');

    //#region Cod Merger
    if (
      RoleGroupService.isRoleCodMerge(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.innerJoin(e => e.codUserToBranch, 't10', j =>
        j
          .andWhere(e => e.isDeleted, w => w.isFalse())
          .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
      );
    }

    if (
      RoleGroupService.isRoleCodAdmin(
        permissionPayload.roleName,
        permissionPayload.isHeadOffice,
      )
    ) {
      q.andWhere(
        e => e.branchId,
        w => w.equals(permissionPayload.branchId),
      );
    }
    //#endregion

    // TODO: change to inner join
    q.leftJoin(e => e.userDriver, 't5');

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

    let transaction: CodTransaction;
    const masterTransactionQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      transaction = await getConnection()
        .createQueryBuilder(CodTransaction, 'ct')
        .setQueryRunner(masterTransactionQueryRunner)
        .where(
          'ct.codTransactionId = :codTransactionId AND ct.isDeleted = false',
          {
            codTransactionId: payload.transactionId,
          },
        )
        .getOne();
    } finally {
      await masterTransactionQueryRunner.release();
    }

    if (!transaction) {
      throw new BadRequestException('Data transaction tidak valid!');
    }

    // TODO: transaction process??
    try {
      // NOTE: loop data awb and update transaction detail
      for (const awb of payload.awbNumber) {
        // cancel all transaction status
        let transactionDetail: CodTransactionDetail;
        const masterTransactionDetailQueryRunner = getConnection().createQueryRunner(
          'master',
        );
        try {
          transactionDetail = await getConnection()
            .createQueryBuilder(CodTransactionDetail, 'ctd')
            .setQueryRunner(masterTransactionDetailQueryRunner)
            .select([
              'ctd.codTransactionDetailId',
              'ctd.awbNumber',
              'ctd.codValue',
              'ctd.awbItemId',
            ])
            .where(
              'ctd.awbNumber = :awbNumber AND ctd.codTransactionId = :codTransactionId AND ctd.isDeleted = false',
              {
                awbNumber: awb,
                codTransactionId: payload.transactionId,
              },
            )
            .getOne();
        } finally {
          await masterTransactionDetailQueryRunner.release();
        }

        if (transactionDetail) {
          await AwbItemAttr.update(
            {
              awbItemId: transactionDetail.awbItemId,
            },
            {
              transactionStatusId: TRANSACTION_STATUS.DEFAULT,
            },
          );

          // remove awb from transaction
          await CodTransactionDetail.update(
            {
              codTransactionDetailId: transactionDetail.codTransactionDetailId,
            },
            {
              codTransactionId: null,
              transactionStatusId: TRANSACTION_STATUS.SIGESIT,
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
        const calculateCodValue =
          Number(transaction.totalCodValue) - totalCodValue;
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

  static async reprintTransaction(
    codTransactionId: string,
  ): Promise<WebCodTransferBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();

    const dataPrint: WebCodAwbPrintVm[] = [];
    let printId = null;

    let transaction: CodTransaction;
    const masterTransactionQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      transaction = await getConnection()
        .createQueryBuilder(CodTransaction, 'ct')
        .setQueryRunner(masterTransactionQueryRunner)
        .where(
          'ct.codTransactionId = :codTransactionId AND ct.isDeleted = false',
          {
            codTransactionId,
          },
        )
        .getOne();
    } finally {
      await masterTransactionQueryRunner.release();
    }

    if (transaction) {
      // generate header print
      const metaPrint = await this.generatePrintMeta(
        transaction.transactionCode,
        authMeta.displayName,
        authMeta.username,
        permissionPayload.branchId,
        transaction.userIdDriver,
        transaction.transactionDate,
      );

      // get data
      let data: CodTransactionDetail[];
      const masterTransactionDetailQueryRunner = getConnection().createQueryRunner(
        'master',
      );
      try {
        data = await getConnection()
          .createQueryBuilder(CodTransactionDetail, 'ctd')
          .setQueryRunner(masterTransactionDetailQueryRunner)
          .select(['ctd.awbNumber', 'ctd.codValue', 'ctd.paymentService'])
          .where(
            'ctd.codTransactionId = :codTransactionId AND ctd.isDeleted = false',
            {
              codTransactionId,
            },
          )
          .getMany();
      } finally {
        await masterTransactionDetailQueryRunner.release();
      }

      if (data.length) {
        const transactionType = transaction.transactionType.toLowerCase();
        let totalCodValueCash = 0;

        for (const item of data) {
          dataPrint.push({
            awbNumber: item.awbNumber,
            codValue: item.codValue,
            provider: item.paymentService,
          });

          totalCodValueCash += item.codValue;
        }

        printId = await this.printStoreData(
          metaPrint,
          transaction.codTransactionId,
          dataPrint,
          totalCodValueCash,
          transactionType,
        );

        const result = new WebCodTransferBranchResponseVm();
        result.printIdCash = transactionType == 'cash' ? printId : null;
        result.printIdCashless = transactionType == 'cashless' ? printId : null;
        return result;
      } else {
        throw new BadRequestException('Data detail tidak valid!');
      }
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }
  }

  static async insertCodPayment(
    payload: WebInsertCodPaymentPayloadVm,
  ): Promise<WebInsertCodPaymentResponseVm> {
    const authMeta = AuthService.getAuthData();
    const userId = authMeta.userId;
    const timestamp = moment().toDate();

    // Validate cod receipt
    let resiCod;
    const masterQueryRunner = getConnection().createQueryRunner('master');
    try {
      const qb = await getConnection()
        .createQueryBuilder()
        .setQueryRunner(masterQueryRunner);

      qb.addSelect('dpdd.do_pod_deliver_detail_id', 'doPodDeliverDetailId');
      qb.addSelect('dpdd.awb_number', 'awbNumber');
      qb.addSelect('awb.total_cod_value', 'totalCodValue');
      qb.addSelect('dpdd.is_deleted', 'isDeleted');
      qb.addSelect('dpdd.awb_item_id', 'awbItemId');
      qb.addSelect('dpd.user_id_driver', 'userIdDriver');
      qb.addSelect('dpd.branch_id', 'branchId');
      qb.from('do_pod_deliver_detail', 'dpdd');
      qb.innerJoin(
        'awb',
        'awb',
        'dpdd.awb_id = awb.awb_id AND awb.is_deleted = false AND awb.is_cod = true',
      );
      qb.innerJoin(
        'do_pod_deliver',
        'dpd',
        'dpdd.do_pod_deliver_id = dpd.do_pod_deliver_id',
      );
      qb.where('dpdd.is_deleted = false');
      qb.andWhere('dpdd.awb_status_id_last = 30000');
      qb.andWhere('dpdd.awb_number = :awbNumber', {
        awbNumber: payload.awbNumber,
      });

      resiCod = await qb.getRawOne();
    } finally {
      await masterQueryRunner.release();
    }

    if (!resiCod) {
      throw new BadRequestException('Resi tidak dapat diproses!');
    }

    // Validate cod receipt
    let validateCodPayment;
    const masterCodPaymentQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      const qbCodPayment = await getConnection()
        .createQueryBuilder()
        .setQueryRunner(masterCodPaymentQueryRunner);

      qbCodPayment.select('*');
      qbCodPayment.from('cod_payment', 'cp');
      qbCodPayment.where('cp.awb_number = :awbNumber', {
        awbNumber: resiCod.awbNumber,
      });

      validateCodPayment = await qbCodPayment.getRawOne();
    } finally {
      await masterCodPaymentQueryRunner.release();
    }

    if (validateCodPayment) {
      throw new BadRequestException(
        'AWB Number already Exists in COD_Payment!',
      );
    }

    // Insert cod receipt which has no photo
    const codPayment = new CodPayment();
    codPayment.doPodDeliverDetailId = resiCod.doPodDeliverDetailId;
    codPayment.awbNumber = resiCod.awbNumber;
    codPayment.codValue = resiCod.totalCodValue;
    codPayment.codPaymentMethod = 'cash';
    codPayment.userIdCreated = userId;
    codPayment.createdTime = timestamp;
    codPayment.userIdUpdated = userId;
    codPayment.updatedTime = timestamp;
    codPayment.isDeleted = resiCod.isDeleted;
    codPayment.awbItemId = resiCod.awbItemId;
    codPayment.userIdDriver = resiCod.userIdDriver;
    codPayment.branchId = resiCod.branchId;
    await CodPayment.save(codPayment);

    const result = new WebInsertCodPaymentResponseVm();
    result.status = 'ok';
    result.message = 'success';
    return result;
  }

  // NOTE: reject transaction cod
  static async transactionReject(
    payload: WebCodTransactionRejectPayloadVm,
  ): Promise<WebCodTransactionUpdateResponseVm> {
    const authMeta = AuthService.getAuthData();

    const timestamp = moment().toDate();
    const dataError = [];
    let totalSuccess = 0;

    let transaction: CodTransaction;
    const masterTransactionQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      transaction = await getConnection()
        .createQueryBuilder(CodTransaction, 'ct')
        .setQueryRunner(masterTransactionQueryRunner)
        .where(
          'ct.codTransactionId = :codTransactionId AND ct.transactionStatusId IN (:...transactionStatusIds) AND ct.isDeleted = false',
          {
            codTransactionId: payload.transactionId,
            transactionStatusIds: [
              TRANSACTION_STATUS.TRM,
              TRANSACTION_STATUS.CANHO,
            ],
          },
        )
        .getOne();
    } finally {
      await masterTransactionQueryRunner.release();
    }

    if (!transaction) {
      throw new BadRequestException('Data transaction tidak valid!');
    }

    let transactionDetails: CodTransactionDetail[];
    const masterTransactionDetailBranchQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      transactionDetails = await getConnection()
        .createQueryBuilder(CodTransactionDetail, 'ctd')
        .setQueryRunner(masterTransactionDetailBranchQueryRunner)
        .select([
          'ctd.codTransactionDetailId',
          'ctd.awbNumber',
          'ctd.codValue',
          'ctd.awbItemId',
        ])
        .where(
          'ctd.codTransactionId = :codTransactionId AND ctd.isDeleted = false',
          {
            codTransactionId: payload.transactionId,
          },
        )
        .getMany();
    } finally {
      await masterTransactionDetailBranchQueryRunner.release();
    }

    if (transactionDetails.length <= 0) {
      throw new BadRequestException('Tidak ada resi pada transaksi ini!');
    }

    // TODO: transaction process??
    try {
      // NOTE: loop data awb and update transaction detail
      await getManager().transaction(async transactionManager => {
        for (const transactionDetail of transactionDetails) {
          // cancel all transaction status
          if (transactionDetail) {
            await transactionManager.update(
              AwbItemAttr,
              {
                awbItemId: transactionDetail.awbItemId,
              },
              {
                transactionStatusId: TRANSACTION_STATUS.DEFAULT,
              },
            );

            // remove awb from transaction
            await transactionManager.update(
              CodTransactionDetail,
              {
                codTransactionDetailId:
                  transactionDetail.codTransactionDetailId,
              },
              {
                codTransactionId: null,
                transactionStatusId: TRANSACTION_STATUS.SIGESIT,
                updatedTime: timestamp,
                userIdUpdated: authMeta.userId,
              },
            );

            // sync update data to mongodb
            CodSyncTransactionQueueService.perform(
              transactionDetail.awbNumber,
              null,
              TRANSACTION_STATUS.SIGESIT,
              null,
              null,
              authMeta.userId,
              timestamp,
            );

            totalSuccess += 1;
          } else {
            // error message
            const errorMessage = `Resi ${
              transactionDetail.awbNumber
            } tidak valid / sudah di proses!`;
            dataError.push(errorMessage);
          }
        } // end of loop

        if (totalSuccess > 0) {
          // update data table transaction
          await transactionManager.update(
            CodTransaction,
            {
              codTransactionId: transaction.codTransactionId,
            },
            {
              totalAwb: 0,
              totalCodValue: 0,
              transactionStatusId: 28000, // Reject Transaksi COD
              updatedTime: timestamp,
              userIdUpdated: authMeta.userId,
            },
          );
        }
      });

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

  // NOTE: delete transaction cod
  static async transactionDelete(
    payload: WebCodTransactionRejectPayloadVm,
  ): Promise<WebCodTransactionUpdateResponseVm> {
    const authMeta = AuthService.getAuthData();

    const timestamp = moment().toDate();
    const dataError = [];
    let totalSuccess = 0;

    let transaction: CodTransaction;
    const masterTransactionQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      transaction = await getConnection()
        .createQueryBuilder(CodTransaction, 'ct')
        .setQueryRunner(masterTransactionQueryRunner)
        .where(
          'ct.codTransactionId = :codTransactionId AND ct.transactionStatusId IN (:...transactionStatusIds) AND ct.isDeleted = false',
          {
            codTransactionId: payload.transactionId,
            transactionStatusIds: [
              TRANSACTION_STATUS.TRM,
              TRANSACTION_STATUS.CANHO,
            ],
          },
        )
        .getOne();
    } finally {
      await masterTransactionQueryRunner.release();
    }

    if (!transaction) {
      throw new BadRequestException('Data transaction tidak valid!');
    }

    let transactionDetails: CodTransactionDetail[];
    const masterTransactionDetailBranchQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      transactionDetails = await getConnection()
        .createQueryBuilder(CodTransactionDetail, 'ctd')
        .setQueryRunner(masterTransactionDetailBranchQueryRunner)
        .select([
          'ctd.codTransactionDetailId',
          'ctd.awbNumber',
          'ctd.codValue',
          'ctd.awbItemId',
        ])
        .where(
          'ctd.codTransactionId = :codTransactionId AND ctd.isDeleted = false',
          {
            codTransactionId: payload.transactionId,
          },
        )
        .getMany();
    } finally {
      await masterTransactionDetailBranchQueryRunner.release();
    }

    if (transactionDetails.length <= 0) {
      throw new BadRequestException('Tidak ada resi pada transaksi ini!');
    }

    // Get duplicate resi in other transaction
    let transactionDuplicates: CodTransactionDetail[];
    const masterTransactionDuplicatesBranchQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      transactionDuplicates = await getConnection()
        .createQueryBuilder(CodTransactionDetail, 'ctd')
        .setQueryRunner(masterTransactionDuplicatesBranchQueryRunner)
        .select([
          'ctd.codTransactionId',
          'ctd.awbNumber',
          'ctd.codValue',
          'ctd.awbItemId',
        ])
        .where(
          'ctd.codTransactionId <> :codTransactionId AND ctd.awbNumber = :awbNumber AND ctd.isDeleted = false',
          {
            codTransactionId: payload.transactionId,
            awbNumber: transactionDetails[0].awbNumber,
          },
        )
        .getMany();
    } finally {
      await masterTransactionDuplicatesBranchQueryRunner.release();
    }

    if (transactionDuplicates.length) {
      let validationRow: CodTransactionDetail[];
      const mastervalidationRowBranchQueryRunner = getConnection().createQueryRunner(
        'master',
      );
      try {
        validationRow = await getConnection()
          .createQueryBuilder(CodTransactionDetail, 'ctd')
          .setQueryRunner(mastervalidationRowBranchQueryRunner)
          .select([
            'ctd.codTransactionDetailId',
            'ctd.awbNumber',
            'ctd.codValue',
            'ctd.awbItemId',
          ])
          .where(
            'ctd.codTransactionId = :codTransactionId AND ctd.isDeleted = false',
            {
              codTransactionId: transactionDuplicates[0].codTransactionId,
            },
          )
          .getMany();
      } finally {
        await mastervalidationRowBranchQueryRunner.release();
      }

      if (validationRow.length !== transactionDetails.length) {
        throw new BadRequestException(
          'Transaksi tidak bisa di delete, karena jumlah resi berbeda!',
        );
      }

      let sameAwb = 0;
      for (const itemTransaction of transactionDetails) {
        for (const itemValidation of validationRow) {
          if (itemTransaction.awbNumber === itemValidation.awbNumber) {
            sameAwb += 1;
          }
        }
      }

      if (sameAwb !== transactionDetails.length) {
        throw new BadRequestException(
          'Transaksi tidak bisa di delete, karena ada resi yang berbeda!',
        );
      }

      // TODO: transaction process??
      try {
        // NOTE: loop data awb and update transaction detail
        await getManager().transaction(async transactionManager => {
          for (const transactionDetail of transactionDetails) {
            // cancel all transaction status
            if (transactionDetail) {
              // remove awb from transaction
              await transactionManager.update(
                CodTransactionDetail,
                {
                  codTransactionDetailId:
                    transactionDetail.codTransactionDetailId,
                },
                {
                  isDeleted: true,
                  updatedTime: timestamp,
                  userIdUpdated: authMeta.userId,
                },
              );

              totalSuccess += 1;
            } else {
              // error message
              const errorMessage = `Resi ${
                transactionDetail.awbNumber
              } tidak valid / sudah di proses!`;
              dataError.push(errorMessage);
            }
          } // end of loop

          if (totalSuccess > 0) {
            // update data table transaction
            await transactionManager.update(
              CodTransaction,
              {
                codTransactionId: transaction.codTransactionId,
              },
              {
                isDeleted: true,
                updatedTime: timestamp,
                userIdUpdated: authMeta.userId,
              },
            );
          }
        });

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
    } else {
      throw new BadRequestException(
        'Transaksi tidak duplicate! Transaksi tidak bisa di hapus!',
      );
    }
  }

  // func private ==============================================================
  private static async handleAwbCod(
    item: WebCodAwbPayloadVm,
    transctiontId: string,
    branchId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      // update awb_item_attr transaction status 3100
      await AwbItemAttr.update(
        { awbItemId: item.awbItemId },
        {
          transactionStatusId: TRANSACTION_STATUS.TRM,
        },
      );

      // TODO: refactoring with sync proses insert to cod_transaction_detail
      // #region send to background process with bull
      const firstTransaction = new WebCodFirstTransactionPayloadVm();
      firstTransaction.awbItemId = item.awbItemId;
      firstTransaction.awbNumber = item.awbNumber;
      firstTransaction.codTransactionId = transctiontId;
      firstTransaction.transactionStatusId = TRANSACTION_STATUS.TRM;
      firstTransaction.supplierInvoiceStatusId = null;
      firstTransaction.codSupplierInvoiceId = null;
      firstTransaction.paymentMethod = item.paymentMethod;
      firstTransaction.paymentService = item.paymentService;
      firstTransaction.noReference = item.noReference;
      firstTransaction.branchId = branchId;
      firstTransaction.userId = userId;
      firstTransaction.userIdDriver = item.userIdDriver;
      CodFirstTransactionQueueService.perform(
        firstTransaction,
        moment().toDate(),
      );
      // #endregion send to background
      return true;
    } catch (err) {
      console.error('HandleAwb error: ', err);
      return false;
    }
  }

  private static async validStatusAwb(
    awbItemId: number,
    type: string,
  ): Promise<boolean> {
    // check awb status mush valid dlv
    // TODO: check db master
    const masterQueryRunner = getConnection().createQueryRunner('master');
    try {
      const awbValid = await getConnection()
        .createQueryBuilder(AwbItemAttr, 'aia')
        .setQueryRunner(masterQueryRunner)
        .select([
          'aia.awbItemAttrId',
          'aia.awbItemId',
          'aia.awbStatusIdFinal',
          'aia.transactionStatusId',
        ])
        .where(
          'aia.awbItemId = :awbItemId AND aia.awbStatusIdFinal = :awbStatusIdFinal AND aia.isDeleted = false',
          { awbItemId, awbStatusIdFinal: AWB_STATUS.DLV },
        )
        .getOne();

      if (
        (type === 'cash' && awbValid) ||
        (type === 'cashless' && awbValid)
      ) {
        return true;
      } else {
        return false;
      }
    } finally {
      await masterQueryRunner.release();
    }
  }

  // handle data store for printing
  private static async generatePrintMeta(
    transactionCode: string,
    adminName: string,
    nikAdmin: string,
    branchId: number,
    userIdDriver: number,
    transactionDate?: Date,
  ): Promise<WebCodPrintMetaVm> {
    // handle transactionDate
    const timestamp = transactionDate ? moment(transactionDate) : moment();
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
        isDeleted : false,
        isActive : true,
      },
    });

    if (!branch) {
      throw new BadRequestException('Gerai tidak ditemukan!');
    }

    const user = await User.findOne({
      select: ['userId', 'employeeId', 'firstName', 'username'],
      where: {
        userId: userIdDriver,
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

  private static async transferBranchCash(
    payload: WebCodTransferPayloadVm,
    authMeta: AuthLoginMetadata,
    permissionPayload: JwtPermissionTokenPayload,
    uuidString: string,
  ): Promise<WebCodTransferBranchCashResponseVm> {
    const timestamp = moment().toDate();
    let totalAwbCash = 0;
    let totalCodValueCash = 0;
    let printIdCash: string;

    const dataPrintCash: WebCodAwbPrintVm[] = [];
    const dataError = [];

    // #region data cash [optional]
    const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
    const userIdDriver = payload.userIdDriver;
    const metaPrint = await this.generatePrintMeta(
      randomCode,
      authMeta.displayName,
      authMeta.username,
      permissionPayload.branchId,
      userIdDriver,
    );

    for (const item of payload.dataCash) {
      // handle race condition
      const redlock = await RedisService.redlock(
        `redlock:transaction:${item.awbNumber}`,
        10,
      );
      if (redlock) {
        const awbValid = await this.validStatusAwb(item.awbItemId, 'cash');
        if (awbValid) {
          totalCodValueCash += Number(item.codValue);
          totalAwbCash += 1;

          // send to background process
          const handleData = await this.handleAwbCod(
            item,
            uuidString,
            permissionPayload.branchId,
            authMeta.userId,
          );
          if (handleData) {
            dataPrintCash.push({
              awbNumber: item.awbNumber,
              codValue: item.codValue,
              provider: item.paymentService,
            });
          } else {
            dataError.push(`resi ${item.awbNumber}, mohon di coba lagi!`);
          }
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
      // insert data to cod_transaction
      const codBranchCash = new CodTransaction();
      codBranchCash.codTransactionId = uuidString;
      codBranchCash.transactionCode = randomCode;
      codBranchCash.transactionDate = timestamp;
      codBranchCash.transactionStatusId = TRANSACTION_STATUS.TRM;
      codBranchCash.transactionType = 'CASH';
      codBranchCash.totalCodValue = totalCodValueCash;
      codBranchCash.totalAwb = totalAwbCash;
      codBranchCash.branchId = permissionPayload.branchId;
      codBranchCash.userIdDriver = payload.userIdDriver;
      await CodTransaction.save(codBranchCash);

      // store data print cash on redis
      printIdCash = await this.printStoreData(
        metaPrint,
        uuidString,
        dataPrintCash,
        totalCodValueCash,
        'cash',
      );
    }
    // #endregion data cash

    const result = new WebCodTransferBranchCashResponseVm();
    result.printIdCash = printIdCash;
    result.dataError = dataError;
    return result;
  }

  private static async transferBranchCashless(
    payload: WebCodTransferPayloadVm,
    authMeta: AuthLoginMetadata,
    permissionPayload: JwtPermissionTokenPayload,
    uuidString: string,
  ): Promise<WebCodTransferBranchCashlessResponseVm> {
    const timestamp = moment().toDate();
    let totalAwbCashless = 0;
    let totalCodValueCashless = 0;
    let printIdCashless: string;

    const dataPrintCashless: WebCodAwbPrintVm[] = [];
    const dataError = [];

    // #region data cashless [optional]
    const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
    const userIdDriver = payload.userIdDriver;
    const metaPrint = await this.generatePrintMeta(
      randomCode,
      authMeta.displayName,
      authMeta.username,
      permissionPayload.branchId,
      userIdDriver,
    );

    for (const item of payload.dataCashless) {
      // handle race condition
      const redlock = await RedisService.redlock(
        `redlock:transaction:${item.awbNumber}`,
        10,
      );
      if (redlock) {
        const awbValid = await this.validStatusAwb(item.awbItemId, 'cashless');
        if (awbValid) {
          totalCodValueCashless += Number(item.codValue);
          totalAwbCashless += 1;

          const handleData = await this.handleAwbCod(
            item,
            uuidString,
            permissionPayload.branchId,
            authMeta.userId,
          );

          if (handleData) {
            dataPrintCashless.push({
              awbNumber: item.awbNumber,
              codValue: item.codValue,
              provider: item.paymentService,
            });
          } else {
            dataError.push(`resi ${item.awbNumber}, mohon di coba lagi!`);
          }
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
      // insert data to cod_transaction
      const codBranchCashless = new CodTransaction();
      codBranchCashless.codTransactionId = uuidString;
      codBranchCashless.transactionCode = randomCode;
      codBranchCashless.transactionDate = timestamp;
      codBranchCashless.transactionStatusId = TRANSACTION_STATUS.TRF;
      codBranchCashless.transactionType = 'CASHLESS';
      codBranchCashless.totalCodValue = totalCodValueCashless;
      codBranchCashless.totalAwb = totalAwbCashless;
      codBranchCashless.branchId = permissionPayload.branchId;
      codBranchCashless.userIdDriver = payload.userIdDriver;
      await CodTransaction.save(codBranchCashless);

      // store data print cashless on redis
      printIdCashless = await this.printStoreData(
        metaPrint,
        uuidString,
        dataPrintCashless,
        totalCodValueCashless,
        'cashless',
      );
    }
    // end of check data cashless
    // #endregion data cashless

    const result = new WebCodTransferBranchCashlessResponseVm();
    result.printIdCashless = printIdCashless;
    result.dataError = dataError;
    return result;
  }
}
