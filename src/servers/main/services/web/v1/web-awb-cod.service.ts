import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { Awb } from '../../../../../shared/orm-entity/awb';
import { WebAwbCodListResponseVm } from '../../../models/cod/web-awb-cod-response';
import { MetaService } from '../../../../../shared/services/meta.service';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';

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
      ['t2.is_cod', 'isCod'],
      ['t2.total_cod_value', 'codValue'],
      ['t6.representative_id', 'representativeId'],
      ['t4.user_id', 'userIdDriver'],
      ['t4.first_name', 'driverName'],
      ['t5.package_type_code', 'packageTypeCode'],
      ['t3.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      ['t8.cod_payment_method', 'codPaymentMethod'],
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

    q.whereRaw('t2.is_cod = true');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebAwbCodListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
