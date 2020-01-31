import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { DoPodDeliver } from '../../../../../shared/orm-entity/do-pod-deliver';
import { MetaService } from '../../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { WebScanOutDeliverListResponseVm, WebScanOutDeliverGroupListResponseVm } from '../../../models/web-scan-out-response.vm';
import { WebScanOutDeliverListPayloadVm } from '../../../models/web-scan-out.vm';

export class LastMileDeliveryService {

  static async findAllScanOutDeliverGroupList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanOutDeliverGroupListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDeliverDateTime'] =
      't1.do_pod_deliver_date_time';
    payload.fieldResolverMap['datePOD'] = 'datePOD';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['userIdDriver'] = 't1.user_id_driver';
    payload.fieldResolverMap['doPodDeliverCode'] = 't1.do_pod_deliver_code';
    payload.fieldResolverMap['totalSuratJalan'] = 'totalSuratJalan';
    payload.fieldResolverMap['totalAwb'] = 'totalAwb';
    payload.fieldResolverMap['totalAntar'] = 'totalAntar';
    payload.fieldResolverMap['totalDelivery'] = 'totalDelivery';
    payload.fieldResolverMap['totalProblem'] = 'totalProblem';

    // payload.fieldResolverMap['totalAssigned'] = 't4.awb_number';
    if (payload.sortBy === '') {
      payload.sortBy = 'datePOD';
    }

    // mapping search field and operator default ilike

    const repo = new OrionRepositoryService(DoPodDeliver, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_deliver_date_time::date', 'datePOD'],
      ['COUNT(DISTINCT(t1.do_pod_deliver_id))', 'totalSuratJalan'],
      ['t1.user_id_driver', 'userIdDriver'],
      ['t5.branch_name', 'branchName'],
      ['t1.branch_id', 'branchId'],
      ['t2.fullname', 'nickname'],
      ['COUNT(t3.awb_number)', 'totalAwb'],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 14000)',
        'totalAntar',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last = 30000)',
        'totalDelivery',
      ],
      [
        'COUNT(t3.awb_number) FILTER (WHERE t3.awb_status_id_last <> 30000 AND t3.awb_status_id_last <> 14000)',
        'totalProblem',
      ],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('"datePOD", t1.user_id_driver, t1.branch_id, t2.fullname, t5.branch_name');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutDeliverGroupListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findAllScanOutDeliverList(
    datePod: string,
    payload: WebScanOutDeliverListPayloadVm,
  ): Promise<WebScanOutDeliverListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDeliverDateTime'] =
      't1.do_pod_deliver_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['doPodDeliverCode'] = 't1.do_pod_deliver_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';
    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDeliverDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDeliverDateTime',
      },
      {
        field: 'doPodDeliverCode',
      },
      {
        field: 'description',
      },
      {
        field: 'nickname',
      },
    ];

    const repo = new OrionRepositoryService(DoPodDeliver, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_deliver_id', 'doPodDeliverId'],
      ['t1.do_pod_deliver_code', 'doPodDeliverCode'],
      ['t1.do_pod_deliver_date_time', 'doPodDeliverDateTime'],
      ['t1.description', 'description'],
      [
        'COUNT(t3.awb_number)FILTER (WHERE t3.awb_status_id_last = 30000)',
        'totalDelivery',
      ],
      [
        'COUNT(t3.awb_number)FILTER (WHERE t3.awb_status_id_last NOT IN (30000, 14000))',
        'totalProblem',
      ],
      [
        'COUNT (t3.awbNumber) FILTER (WHERE t3.awb_status_id_last = 14000)',
        'totalAwb',
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
    q.innerJoin(e => e.doPodDeliverDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awb, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    // TODO: fix query
    q.andWhereRaw(
      `DATE(t1.do_pod_deliver_date_time) = '${datePod}'`,
    );
    q.groupByRaw('t1.do_pod_deliver_id, t2.fullname');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutDeliverListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
