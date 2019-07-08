import { WebScanInListResponseVm } from '../../servers/main/models/web-scanin-list.response.vm';
import { BaseMetaPayloadVm } from '../models/base-meta-payload.vm';
import { BaseQueryPayloadVm } from '../models/base-query-payload.vm';
import { Bag } from '../orm-entity/bag';
import { OrionRepositoryService } from '../services/orion-repository.service';
import { Branch } from '../orm-entity/branch';

describe('Test Query Builder Scan In', () => {
  it('Should generate valid list data', async () => {
    const queryPayload = new BaseQueryPayloadVm();
    // add pagination
    // queryPayload.take = 10;
    // queryPayload.skip = 0;

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

    const results = await qb.execute();
    const sql = await qb.getSql();
    // tslint:disable-next-line: no-console
    console.log(results);

    // expect(sql).toContain('OFFSET 0');
    expect(sql).toContain('LIMIT 10');
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
    const sql = await qb.getSql();
    // tslint:disable-next-line: no-console
    console.log(results);

    // expect(sql).toContain('OFFSET 0');
    expect(sql).toContain('LIMIT 10');
    expect(results).toBeDefined();
  });

  it('Test Service WebDeliveryInService', async () => {
    const payload = new BaseMetaPayloadVm();

    payload.page = 1;
    payload.limit = 10;

        // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'scanInDateTime',
      },
    ];

    // mapping field
    payload.fieldResolverMap['scanInDateTime'] =
      'pod_scan.pod_scanin_date_time';
    payload.fieldResolverMap['awbNumber'] = 'awb.awb_number';
    payload.fieldResolverMap['branchNameScan'] = 'branch.branch_name';
    payload.fieldResolverMap['branchNameFrom'] = 'branch_from.branch_name';
    payload.fieldResolverMap['employeeName'] = 'employee.fullname';

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
    const sql = await qb.getSql();
    const data = await qb.getRawMany();

    // tslint:disable-next-line: no-console
    console.log(total);
    // tslint:disable-next-line: no-console
    console.log(sql);

    // result.data = data;
    // result.paging = MetaService.set(payload.page, payload.limit, total);
    expect(sql).toContain('LIMIT 10');
    expect(data).toBeDefined();
  });

  it('Test Bag', async () => {
    const bagRepository = new OrionRepositoryService(Bag);
    const q1 = bagRepository.findAll();
    q1.innerJoinAndSelect(e => e.bagItems);
    q1.andWhere(e => e.bagNumber, w => w.equals('9992222'));
    const bag1 = await q1.exec();

    const q2 = bagRepository.findOne();

    q2.leftJoin(e => e.bagItems.bagItemAwbs);
    q2.select({
      bagId: true,
      bagNumber: true,
      bagItems: {
        bagItemId: true,
        bagItemAwbs: {
          bagItemAwbId: true,
        },
      },
    });
    // q2.where(e => e.bagItems.bagId, w => w.equals('421862'));
    q2.where(e => e.bagNumber, w => w.equals('2224446'));
    const bag2 = await q2.exec();

    console.log(bag2);
    expect(bag1).toBeDefined();
    expect(bag2).toBeDefined();
  });

  it('Test Branch with Orion Repo', async () => {
    const repository = new OrionRepositoryService(Branch);
    const q = repository.findAllRaw();
    const payload = new BaseMetaPayloadVm();

    payload.page = 2;
    payload.limit = 10;

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['branch_code', 'branchCode'],
      ['branch_name', 'branchName'],
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    expect(data).toBeDefined();
    console.log('DATA ========= ', data);
    console.log('Total ========= ', total);

  });

  it('Test Branch with Query Builder', async () => {
    const payload = new BaseMetaPayloadVm();
    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'pod_scanin_date_time',
    //   },
    // ];

    payload.page = 1;
    payload.limit = 10;

    const qb = payload.buildQueryBuilder();
    qb.addSelect('branch.branch_code', 'branch_code');
    qb.addSelect('branch.branch_name', 'branch_name');

    qb.from('branch', 'branch');
    const total = await qb.getCount();

    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    // const result = new WebScanInListResponseVm();

    // tslint:disable-next-line: no-console
    console.log(total);
    // console.log(payload);
    // tslint:disable-next-line: no-console
    console.log(data);

  });
});
