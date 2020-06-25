import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { Awb } from '../../../../../shared/orm-entity/awb';
import { WebAwbCodListResponseVm, WebCodTransferBranchResponseVM } from '../../../models/cod/web-awb-cod-response.vm';
import { MetaService } from '../../../../../shared/services/meta.service';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { WebCodTransferPayloadVm, WebCodAwbPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import _, { groupBy } from 'lodash';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CodTransactionBranch } from '../../../../../shared/orm-entity/cod-transaction-branch';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import moment = require('moment');
import { AwbItem } from '../../../../../shared/orm-entity/awb-item';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { CodTransactionBranchDetail } from '../../../../../shared/orm-entity/cod-transaction-branch-detail';
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
  ): Promise<WebCodTransferBranchResponseVM> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    let totalCodValue = 0;
    let totalAwbSuccess = 0;
    const dataError = [];
    const dataPrintCash = [];
    const dataPrintCashless = [];

    // TODO: auto print?
    // payload:
    // data[]
    // user login, branch login
    // scan awb check status only dlv and update terima cabang

    // create cod transaction branch
    // transction ??

    const codBranch = new CodTransactionBranch();
    const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
    codBranch.transactionCode = randomCode;
    codBranch.transactionDate = timestamp;
    codBranch.transactionStatusId = 30000;
    codBranch.totalCodValue = totalCodValue;
    codBranch.totalAwb = totalAwbSuccess;
    codBranch.branchId = permissonPayload.branchId;
    await CodTransactionBranch.save(codBranch);

    // data cash
    for (const item of payload.dataCash) {
      // process
      if (this.validStatusAwb(item.awbItemId)) {
        totalCodValue += Number(item.codValue);
        totalAwbSuccess += 1;

        this.handleCash(
          item, codBranch.codTransactionBranchId,
          permissonPayload.branchId,
          authMeta.userId,
        );

      } else {
        // NOTE: error message
        const errorMessage = `status resi ${item.awbNumber} tidak valid, mohon di cek ulang!`;
        dataError.push(errorMessage);
      }
    } // end of loop data cash

    // data cashless [optional]
    if (payload.dataCashless.length) {
      for (const item of payload.dataCashless) {
        // process
        if (this.validStatusAwb(item.awbItemId)) {
          totalCodValue += Number(item.codValue);
          totalAwbSuccess += 1;

          // codBranch.codTransactionBranchId;
          await this.handleCashless(
            item,
            codBranch.codTransactionBranchId,
            permissonPayload.branchId,
            authMeta.userId,
          );
        } else {
          // NOTE: error message
          const errorMessage = `status resi ${item.awbNumber} tidak valid, mohon di cek ulang!`;
          dataError.push(errorMessage);
        }
      } // end of loop data cashless
    }

    // update total
    await CodTransactionBranch.update(
      {
        codTransactionBranchId: codBranch.codTransactionBranchId,
      },
      {
        totalCodValue,
        totalAwb: totalAwbSuccess,
      },
    );

    // const groupPayment = groupBy(payload.data, 'paymentMethod');
    // return data for print
    const result = new WebCodTransferBranchResponseVM();
    result.transactionCode = codBranch.transactionCode;
    result.transactionDate = codBranch.transactionDate.toDateString();
    // NOTE: for testing only
    result.printIdCash = 'c2419414-a56c-11ea-bfda-02fd4ad9cfd4-cash';
    result.printIdCashless = 'c2419414-a56c-11ea-bfda-02fd4ad9cfd4-cash';
    result.dataError = dataError;
    // driver_name, admin_name, branch_name
    /// transaction_code, transaction_date
    // data cash // awb | cod value | total_cod_value
    // data cashless // awb | provider |cod value | total_cod_value
    return result;
  }

  // func private ==============================================================
  private static async handleCash(
    item: WebCodAwbPayloadVm,
    parentId: string,
    branchId: number,
    userId: number,
  ) {
    const branchDetail = new CodTransactionBranchDetail();
    branchDetail.codTransactionBranchId = parentId;
    branchDetail.awbItemId = item.awbItemId;
    branchDetail.awbNumber = item.awbNumber;
    branchDetail.codValue = item.codValue;
    branchDetail.paymentMethod = item.paymentMethod;
    branchDetail.consigneeName = item.consigneeName;
    branchDetail.branchId = branchId;
    branchDetail.userIdDriver = item.userIdDriver;

    return await CodTransactionBranchDetail.insert(branchDetail);
  }

  private static async handleCashless(
    item: WebCodAwbPayloadVm,
    parentId: string,
    branchId: number,
    userId: number,
  ) {
    const branchDetail = new CodTransactionBranchDetail();
    branchDetail.codTransactionBranchId = parentId;
    branchDetail.awbItemId = item.awbItemId;
    branchDetail.awbNumber = item.awbNumber;
    branchDetail.codValue = item.codValue;
    branchDetail.paymentMethod = item.paymentMethod;
    branchDetail.paymentService = item.paymentService;
    branchDetail.noReference = item.noReference;

    branchDetail.consigneeName = item.consigneeName;
    branchDetail.branchId = branchId;
    branchDetail.userIdDriver = item.userIdDriver;

    return await CodTransactionBranchDetail.insert(branchDetail);
  }

  private static async validStatusAwb(awbItemId: number): Promise<boolean> {
    // check awb status mush valid dlv
    const awbValid = await AwbItem.findOne({
      select: ['awbStatusIdLast'],
      where: {
        awbItemId,
      },
    });
    if (awbValid && awbValid.awbStatusIdLast == AWB_STATUS.DLV) {
      return true;
    } else {
      return false;
    }
  }
}
