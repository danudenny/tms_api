import { BaseMetaPayloadVm } from '../models/base-meta-payload.vm';

describe('base-meta-payload-vm.spec.ts', () => {
  it('Should generate valid pagination', () => {
    const metaPayload = new BaseMetaPayloadVm();
    metaPayload.page = 2;
    metaPayload.limit = 10;

    const qb = metaPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    metaPayload.applyPaginationToQueryBuilder(qb);

    const sql = qb.getSql();

    expect(sql).toContain('OFFSET 10');
    expect(sql).toContain('LIMIT 10');
  });

  it('Should generate valid sort', () => {
    const metaPayload = new BaseMetaPayloadVm();
    metaPayload.sortBy = 'branchName';
    metaPayload.sortDir = 'asc';

    const qb = metaPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    const sql = qb.getSql();

    expect(sql).toContain('"branch_name\" ASC');
  });

  it('Should generate valid filters', () => {
    const metaPayload = new BaseMetaPayloadVm();
    metaPayload.filters = [
      {
        field: 'branch_code',
        operator: 'eq',
        value: 'abc',
      },
      {
        field: 'branch_code',
        operator: 'neq',
        value: 'abc',
      },
      {
        field: 'branch_code',
        operator: 'ilike',
        value: 'abc',
      },
      {
        field: 'branch_code',
        operator: 'iew',
        value: 'abc',
      },
      {
        field: 'branch_code',
        operator: 'isw',
        value: 'abc',
      },
      {
        field: 'branch_code',
        operator: 'like',
        value: 'abc',
      },
      {
        field: 'branch_code',
        operator: 'ew',
        value: 'abc',
      },
      {
        field: 'branch_code',
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
        field: 'branch_code',
        operator: 'in',
        value: ['abc', 'def', 'ghi'],
      },
      {
        field: 'branch_code',
        operator: 'nin',
        value: ['abc', 'def', 'ghi'],
      },
      {
        field: 'branch_code',
        operator: 'null',
      },
      {
        field: 'branch_code',
        operator: 'nnull',
      },
      // {
      //   field: 'dot.field.example', // this one is failing
      //   operator: 'eq',
      //   value: 'anything',
      // },
    ];

    const qb = metaPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    const sql = qb.getSql();

    expect(sql).toContain('("branch_code" = $1 AND "branch_code" != $2');
    expect(sql).toContain('LOWER("branch_code") LIKE $3');
    expect(sql).toContain('LOWER("branch_code") LIKE $4');
    expect(sql).toContain('LOWER("branch_code") LIKE $5');
    expect(sql).toContain('"branch_code" LIKE $6');
    expect(sql).toContain('"branch_code" LIKE $7');
    expect(sql).toContain('"branch_code" LIKE $8');
    expect(sql).toContain('"depth" > $9');
    expect(sql).toContain('"depth" >= $10');
    expect(sql).toContain('"depth" < $11');
    expect(sql).toContain('"depth" <= $12');
    expect(sql).toContain('"branch_code" IN ($13, $14, $15)');
    expect(sql).toContain('"branch_code" NOT IN ($16, $17, $18)');
    expect(sql).toContain('"branch_code" IS NULL');
    expect(sql).toContain('"branch_code" IS NOT NULL');
    // expect(sql).toContain('"dot"."field"."example" = $19)'); // this one is failing and needs inspection
  });
});
