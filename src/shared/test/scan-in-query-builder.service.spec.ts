import { BaseQueryPayloadVm } from '../models/base-query-payload.vm';

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
});

// SELECT pod_scanin_date_time as "scanInDateTime",
//   awb.awb_number as "awbNumber",
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
