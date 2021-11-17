import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../../shared/services/meta.service';
import { AwbHandoverListResponseVm } from '../../../models/last-mile/awb-handover.vm';
import { DoPodDeliverDetail } from '../../../../../shared/orm-entity/do-pod-deliver-detail';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { QueryServiceApi } from '../../../../../shared/services/query.service.api';

export class V1WebAwbHandoverService {
  static async AwbHandoverList(payload: BaseMetaPayloadVm): Promise<AwbHandoverListResponseVm> {
    // mapping field
    // payload.fieldResolverMap['isUpload'] = 't1.is_high_value';
    payload.fieldResolverMap['partnerId'] = 't4.partner_id';
    payload.fieldResolverMap['awbDeliverDate'] = 't1.awb_status_date_last';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['nik'] = 't5.username';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];
    const repo = new OrionRepositoryService(DoPodDeliverDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      ['t1.awb_status_date_last', 'awbDeliverDate'],
      ['t1.awb_number', 'awbNumber'],
      ['t2.shipper_name', 'shipperName'],
      ['t2.recipient_name', 'recipientName'],
      ['t4.partner_id', 'partnerId'],
      ['t4.partner_name', 'partnerName'],
      ['t5.first_name', 'username'],
      ['t5.username', 'nik'],
    );
    q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
      [
        j.andWhere(e => e.handoverDelivery, w => w.isTrue()),
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      ],
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doPodDeliver.userDriver, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.awbStatusIdLast, w => w.equals(AWB_STATUS.DLV));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    // const data = await q.exec();
    const query = await q.getQuery();
    let data = await QueryServiceApi.executeQuery(query, false, null);
    let cnt = await QueryServiceApi.executeQuery(query, true, 'awbnumber');
    
    for(let i = 0; i < data.length; i++){
      data[i].awbDeliverDate = data[i].awbdeliverdate;
      data[i].awbNumber = data[i].awbnumber;
      data[i].doPodDeliverDetailId = data[i].dopoddeliverdetailid;
      data[i].partnerId = data[i].partnerid;
      data[i].partnerName = data[i].partnername;
      data[i].recipientName = data[i].recipientname;
      data[i].shipperName = data[i].shippername;
    }
    
    const total = cnt; // await q.countWithoutTakeAndSkip();
    const result = new AwbHandoverListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
  static async AwbHandoverListCount(payload: BaseMetaPayloadVm): Promise<AwbHandoverListResponseVm> {
    payload.fieldResolverMap['partnerId'] = 't4.partner_id';
    payload.fieldResolverMap['awbDeliverDate'] = 't1.awb_status_date_time_last';
    payload.fieldResolverMap['awbNumber'] = 't1.awb_number';
    payload.fieldResolverMap['nik'] = 't5.username';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbNumber',
      },
    ];
    const repo = new OrionRepositoryService(DoPodDeliverDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_deliver_detail_id', 'doPodDeliverDetailId'],
      ['t1.awb_status_date_last', 'awbDeliverDate'],
      ['t1.awb_number', 'awbNumber'],
      ['t2.shipper_name', 'shipperName'],
      ['t2.recipient_name', 'recipientName'],
      ['t4.partner_id', 'partnerId'],
      ['t4.partner_name', 'partnerName'],
      ['t5.first_name', 'username'],
      ['t5.username', 'nik'],
    );
    q.innerJoin(e => e.pickupRequestDetail, 't2', j =>
      [
        j.andWhere(e => e.handoverDelivery, w => w.isTrue()),
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      ],
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doPodDeliver.userDriver, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.awbStatusIdLast, w => w.equals(AWB_STATUS.DLV));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const total = await q.countWithoutTakeAndSkip();

    const result = new AwbHandoverListResponseVm();
    result.data = null;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

}
