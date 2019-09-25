import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { BagMonitoringResponseVm } from '../../models/bag-monitoring-response.vm';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { AuthService } from '../../../../shared/services/auth.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';

export class WebMonitoringService {
  public static async findAllByRequest(
    payload: BaseMetaPayloadVm,
    ): Promise<BagMonitoringResponseVm> {
    const permissionPayload = AuthService.getPermissionTokenPayload();

    // mapping field
    payload.fieldResolverMap['doPodDateTime'] = 't1.do_pod_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['doPodCode'] = 't1.do_pod_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.fullname';
    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDateTime',
      },
      {
        field: 'doPodCode',
      },
      {
        field: 'description',
      },
      {
        field: 'fullname',
      },
    ];

    const repo = new OrionRepositoryService(DoPod, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_id', 'doPodId'],
      ['t1.do_pod_code', 'doPodCode'],
      ['t1.do_pod_date_time', 'doPodDateTime'],
      ['t1.description', 'description'],
      ['t1.percen_scan_in_out', 'percenScanInOut'],
      ['t1.total_scan_in', 'totalScanIn'],
      ['t1.total_scan_out', 'totalScanOut'],
      ['t2.username', 'fullname'],
      ['t3.branch_name', 'branchName'],
      ['COUNT (t4.*)', 'totalAwb'],
    );

    // TODO: fix query relation to employee
    q.innerJoin(e => e.userDriver, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDetails.bagItem.bagItemAwbs, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.TRANSIT_HUB));
    q.andWhere(e => e.branchIdTo, w => w.equals(permissionPayload.branchId));
    q.andWhere(e => e.totalScanOut, w => w.greaterThan(0));
    q.groupByRaw(
      't1.doPodId, t2.fullname, t3.branch_name',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new BagMonitoringResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
