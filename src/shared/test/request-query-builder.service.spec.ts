import { BaseQueryPayloadVm } from '../models/base-query-payload.vm';

describe('request-query-builder.service.spec.ts', () => {
  it('Should generate valid limit & offset', () => {
    const queryPayload = new BaseQueryPayloadVm();
    queryPayload.take = 20;
    queryPayload.skip = 10;

    const qb = queryPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    const sql = qb.getSql();

    expect(sql).toContain('OFFSET 10');
    expect(sql).toContain('LIMIT 20');
  });

  it('Should generate valid sorts', () => {
    const queryPayload = new BaseQueryPayloadVm();
    queryPayload.sort = [
      {
        field: 'branchName',
        dir: 'asc',
      },
      {
        field: 'depth',
        dir: 'desc',
      },
    ];

    const qb = queryPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    const sql = qb.getSql();

    expect(sql).toContain('branchName ASC');
    expect(sql).toContain('depth DESC');
  });

  it('Should generate valid filter modes', () => {
    const queryPayload = new BaseQueryPayloadVm();
    queryPayload.filter = [
      [
        {
          field: 'branchCode',
          operator: 'eq',
          value: 'abc',
        },
        {
          field: 'branchCode',
          operator: 'eq',
          value: 'def',
        },
      ],
      [
        {
          field: 'branchCode',
          operator: 'eq',
          value: 'ghi',
        },
        {
          field: 'branchCode',
          operator: 'eq',
          value: 'jkl',
        },
      ],
    ];

    const qb = queryPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    const sql = qb.getSql();

    expect(sql).toContain(
      '("branchCode" = $1 AND "branchCode" = $2) OR ("branchCode" = $3 AND "branchCode" = $4)',
    );
  });

  it('Should generate valid filter operators', () => {
    const queryPayload = new BaseQueryPayloadVm();
    queryPayload.filter = [
      [
        {
          field: 'branchCode',
          operator: 'eq',
          value: 'abc',
        },
        {
          field: 'branchCode',
          operator: 'neq',
          value: 'abc',
        },
        {
          field: 'branchCode',
          operator: 'like',
          value: 'abc',
        },
        {
          field: 'branchCode',
          operator: 'ew',
          value: 'abc',
        },
        {
          field: 'branchCode',
          operator: 'sw',
          value: 'abc',
        },
        {
          field: 'depth',
          operator: 'gt',
          value: 1,
        },
        {
          field: 'depth',
          operator: 'gte',
          value: 1,
        },
        {
          field: 'depth',
          operator: 'lt',
          value: 1,
        },
        {
          field: 'depth',
          operator: 'lte',
          value: 1,
        },
        {
          field: 'branchCode',
          operator: 'in',
          value: ['abc', 'def', 'ghi'],
        },
        {
          field: 'branchCode',
          operator: 'nin',
          value: ['abc', 'def', 'ghi'],
        },
        {
          field: 'branchCode',
          operator: 'null',
        },
        {
          field: 'branchCode',
          operator: 'nnull',
        },
      ],
    ];

    const qb = queryPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    const sql = qb.getSql();

    expect(sql).toContain('"branchCode" = $1');
    expect(sql).toContain('"branchCode" != $2');
    expect(sql).toContain('LOWER("branchCode") LIKE $3');
    expect(sql).toContain('LOWER("branchCode") LIKE $4');
    expect(sql).toContain('LOWER("branchCode") LIKE $5');
    expect(sql).toContain('"depth" > $6');
    expect(sql).toContain('"depth" >= $7');
    expect(sql).toContain('"depth" < $8');
    expect(sql).toContain('"depth" <= $9');
    expect(sql).toContain('"branchCode" IN ($10, $11, $12)');
    expect(sql).toContain('"branchCode" NOT IN ($13, $14, $15)');
    expect(sql).toContain('"branchCode" IS NULL');
    expect(sql).toContain('"branchCode" IS NOT NULL');
  });

  it('Should handle complex raw query', async () => {
    // WARNING: query below is depending on patch-package to always add LATERAL to join sub queries

    const queryPayload = new BaseQueryPayloadVm();
    queryPayload.skip = 0;
    queryPayload.take = 10;
    queryPayload.filter = [
      [
        {
          field: 't4.is_cod',
          operator: 'eq',
          value: false,
        },
      ],
    ];

    const qb = queryPayload.buildQueryBuilder();

    qb.addSelect('t4.awb_id', 'awbId');
    qb.addSelect('t4.awb_date', 'awbDate');
    qb.addSelect('t4.awb_number', 'awbNumber');
    qb.addSelect('t4.ref_customer_account_id', 'merchant');
    qb.addSelect('t4.consignee_name', 'consigneeName');
    qb.addSelect('t4.consignee_address', 'consigneeAddress');
    qb.addSelect('t4.consignee_phone', 'consigneeNumber');
    qb.addSelect('t4.is_cod', 'isCOD');
    qb.addSelect('t5.package_type_name', 'packageTypeName');
    qb.addSelect('t6.awb_status_name', 'awbStatusName');
    qb.addSelect('array_to_json(t13.data)', 'redeliveryHistory');
    qb.from('do_pod', 't1');
    qb.innerJoin('do_pod_detail', 't2', 't2.do_pod_id = t1.do_pod_id');
    qb.innerJoin('awb_item', 't3', 't3.awb_item_id = t2.awb_item_id');
    qb.innerJoin('awb', 't4', 't4.awb_id = t3.awb_id');
    qb.innerJoin(
      'package_type',
      't5',
      't5.package_type_id = t4.package_type_id',
    );
    qb.innerJoin(
      'awb_status',
      't6',
      't6.awb_status_id = t4.awb_status_id_last',
    );
    qb.leftJoin(
      qbJoin => {
        qbJoin
          .select('array_agg(row_to_json(t13))', 'data')
          .from(qbJoinFrom => {
            qbJoinFrom.addSelect('t10.history_date_time', 'historyDateTime');
            qbJoinFrom.addSelect('t11.reason_code', 'reasonCode');
            qbJoinFrom.addSelect('t12.fullname', 'employeeName');
            qbJoinFrom.from('do_pod_history', 't10');
            qbJoinFrom.where('t10.do_pod_id = t1.do_pod_id');
            qbJoinFrom.leftJoin(
              qbJoinFromJoin => {
                qbJoinFromJoin.addSelect('t11.reason_code');
                qbJoinFromJoin.from('reason', 't11');
                qbJoinFromJoin.where('t11.reason_id = t10.reason_id');
                return qbJoinFromJoin;
              },
              't11',
              'true',
            );
            qbJoinFrom.leftJoin(
              qbJoinFromJoin => {
                qbJoinFromJoin.addSelect('t12.fullname');
                qbJoinFromJoin.from('employee', 't12');
                qbJoinFromJoin.where(
                  't12.employee_id = t10.employee_id_driver',
                );
                return qbJoinFromJoin;
              },
              't12',
              'true',
            );
            return qbJoinFrom;
          }, 't13');
        return qbJoin;
      },
      't13',
      'true',
    );

    const sql = qb.getSql();
    expect(sql).toContain(
      'SELECT "t5"."package_type_name" AS "packageTypeName", t4.awb_id AS "awbId", t4.awb_date AS "awbDate", t4.awb_number AS "awbNumber", t4.ref_customer_account_id AS "merchant", t4.consignee_name AS "consigneeName", t4.consignee_address AS "consigneeAddress", t4.consignee_phone AS "consigneeNumber", t4.is_cod AS "isCOD", t6.awb_status_name AS "awbStatusName", array_to_json(t13.data) AS "redeliveryHistory" FROM "public"."do_pod" "t1" INNER JOIN "public"."do_pod_detail" "t2" ON t2.do_pod_id = t1.do_pod_id  INNER JOIN "public"."awb_item" "t3" ON t3.awb_item_id = t2.awb_item_id  INNER JOIN "public"."awb" "t4" ON t4.awb_id = t3.awb_id  INNER JOIN "public"."package_type" "t5" ON "t5"."package_type_id" = t4.package_type_id  INNER JOIN "public"."awb_status" "t6" ON t6.awb_status_id = t4.awb_status_id_last  LEFT JOIN LATERAL (SELECT array_agg(row_to_json(t13)) AS "data" FROM (SELECT t10.history_date_time AS "historyDateTime", t11.reason_code AS "reasonCode", t12.fullname AS "employeeName" FROM "public"."do_pod_history" "t10" LEFT JOIN LATERAL (SELECT t11.reason_code FROM "public"."reason" "t11" WHERE t11.reason_id = t10.reason_id) "t11" ON true  LEFT JOIN LATERAL (SELECT t12.fullname FROM "public"."employee" "t12" WHERE t12.employee_id = t10.employee_id_driver) "t12" ON true WHERE t10.do_pod_id = t1.do_pod_id) "t13") "t13" ON true',
    );

    const results = await qb.getRawMany();
    expect(results).toBeDefined();
  });
});
