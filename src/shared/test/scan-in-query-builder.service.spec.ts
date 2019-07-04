import { WebScanInListResponseVm } from '../../servers/main/models/web-scanin-list.response.vm';
import { BaseMetaPayloadVm } from '../models/base-meta-payload.vm';
import { BaseQueryPayloadVm } from '../models/base-query-payload.vm';
import { Bag } from '../orm-entity/bag';
import { OrionRepositoryService } from '../services/orion-repository.service';

describe('Test Query Builder Scan In', () => {
  it('Should generate valid list data', async () => {
    const queryPayload = new BaseQueryPayloadVm();
    // add pagination
    queryPayload.take = 10;
    queryPayload.skip = 0;
    // // add sorting data
    // queryPayload.sort = [
    //   {
    //     field: sortBy,
    //     dir: sortDir,
    //   },
    // ];
    // // add filter
    // queryPayload.filter = [
    //   [
    //     {
    //       field: 'branch_name',
    //       operator: 'like',
    //       value: search,
    //     },
    //   ],
    //   [
    //     {
    //       field: 'branch_code',
    //       operator: 'like',
    //       value: search,
    //     },
    //   ],
    // ];

    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('pod_scan.pod_scanin_date_time', 'scanInDateTime');
    qb.addSelect('branch.branch_name', 'branchNameScan');
    qb.addSelect('employee.fullname', 'employeeName');

    qb.from('pod_scan', 'pod_scan');
    qb.innerJoin(
      'branch', 'branch',
      'branch.branch_id = pod_scan.branch_id AND branch.is_deleted = false',
    );
    qb.leftJoin(
      'users', 'users',
      'users.user_id = pod_scan.user_id AND users.is_deleted = false',
    );
    qb.leftJoin(
      'employee', 'employee',
      'employee.employee_id = users.employee_id AND employee.is_deleted = false',
    );

    const results = await qb.getRawMany();
    // tslint:disable-next-line: no-console
    console.log(results);

    // expect(sql).toContain('OFFSET 0');
    // expect(sql).toContain('LIMIT 10');
    expect(results).toBeDefined();
  });

  it('Should generate Scan Out list data', async () => {
    const queryPayload = new BaseQueryPayloadVm();
    // add pagination
    queryPayload.take = 10;
    queryPayload.skip = 0;
    // // add sorting data
    // queryPayload.sort = [
    //   {
    //     field: sortBy,
    //     dir: sortDir,
    //   },
    // ];
    // // add filter
    // queryPayload.filter = [
    //   [
    //     {
    //       field: 'branch_name',
    //       operator: 'like',
    //       value: search,
    //     },
    //   ],
    //   [
    //     {
    //       field: 'branch_code',
    //       operator: 'like',
    //       value: search,
    //     },
    //   ],
    // ];

// "scanInDateTime": "2019-03-01 10:00:00",
// "doPodDateTime": "2019-03-02 10:00:00",
// "doPodCode": "DOP/1904/00001",
// "doPodId": "1",
// "nickname": "agus",
// "desc": "1234"

    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('do_pod.do_pod_id', 'doPodId');
    qb.addSelect('do_pod.do_pod_date_time', 'doPodDateTime');
    qb.addSelect('do_pod.do_pod_code', 'doPodCode');
    qb.addSelect(`COALESCE(do_pod.description, '')`, 'desc');
    qb.addSelect('employee.fullname', 'nickname');

    qb.from('do_pod', 'do_pod');
    qb.innerJoin(
      'employee', 'employee',
      'employee.employee_id = do_pod.employee_id_driver AND employee.is_deleted = false',
    );
    const results = await qb.getRawMany();
    // tslint:disable-next-line: no-console
    console.log(results);

    // expect(sql).toContain('OFFSET 0');
    // expect(sql).toContain('LIMIT 10');
    expect(results).toBeDefined();
  });

  it('Test Service WebDeliveryInService', async () => {
    const payload = new BaseMetaPayloadVm();
        // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'pod_scanin_date_time',
      },
    ];

    const qb = payload.buildQueryBuilder();
    qb.addSelect('pod_scan.pod_scanin_date_time', 'scanInDateTime');
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('branch.branch_name', 'branchNameScan');
    qb.addSelect('branch_from.branch_name', 'branchNameFrom');
    qb.addSelect('employee.fullname', 'employeeName');

    qb.from('pod_scan', 'pod_scan');
    qb.innerJoin(
      'branch',
      'branch',
      'pod_scan.branch_id = branch.branch_id AND branch.is_deleted = false',
    );
    qb.innerJoin(
      'awb',
      'awb',
      'awb.awb_id = pod_scan.awb_id AND awb.is_deleted = false',
    );
    qb.leftJoin(
      'users',
      'users',
      'users.user_id = pod_scan.user_id AND users.is_deleted = false',
    );
    qb.leftJoin(
      'employee',
      'employee',
      'employee.employee_id = users.employee_id AND employee.is_deleted = false',
    );
    qb.leftJoin(
      'do_pod',
      'do_pod',
      'do_pod.do_pod_id = pod_scan.do_pod_id AND do_pod.is_deleted = false',
    );
    qb.leftJoin(
      'branch',
      'branch_from',
      'do_pod.branch_id = branch_from.branch_id AND branch_from.is_deleted = false',
    );

    const total = await qb.getCount();

    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new WebScanInListResponseVm();

    // tslint:disable-next-line: no-console
    console.log(data);

    result.data = data;
    // result.paging = MetaService.set(payload.page, payload.limit, total);

    expect(result).toBeDefined();
  });

  it('Test Bag', async () => {
    const bagRepository = new OrionRepositoryService(Bag);
    const q1 = bagRepository.findAll();
    q1.innerJoinAndSelect(e => e.bagItems);
    q1.andWhere(e => e.bagNumber, w => w.equals('9992222'));
    const bag1 = await q1.exec();

    const q2 = bagRepository.findOne();
    q2.select({
      bagId: true,
      bagNumber: true,
      bagItems: {
        bagId: true,
      },
    });
    q2.where(e => e.bagItems.bagId, w => w.equals('421862'));
    q2.andWhere(e => e.bagNumber, w => w.equals('9992222'));
    const bag2 = await q2.exec();

    expect(bag1).toBeDefined();
    expect(bag2).toBeDefined();
  });
});

// SELECT pod_scanin_date_time as "scanInDateTime",
//   awb.awreturn result;b_number as "awbNumber",
//   branch.branch_name as "branchNameScan",
//   branch_from.branch_name as "branchNameFrom",
//   employee.fullname as "employeeName",
//   'Ya' as "scanInStatus"
// FROM pod_scan
// JOIN branch ON pod_scan.branch_id = branch.branch_id
// JOIN awb ON awb.awb_id = pod_scan.awb_id AND awb.is_deleted = false
// LEFT JOIN users ON users.user_id = pod_scan.user_id AND users.is_deleted = false
// LEFT JOIN employee ON employee.employee_id = users.employee_id AND employee.is_deleted = false
// LEFT JOIN do_pod ON do_pod.do_pod_id = pod_scan.do_pod_id
// LEFT JOIN branch branch_from ON do_pod.branch_id = branch_from.branch_id
