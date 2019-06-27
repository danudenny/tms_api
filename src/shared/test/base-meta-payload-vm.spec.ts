import { BaseMetaPayloadVm } from '../models/base-meta-payload.vm';

describe('base-meta-payload-vm.spec.ts', () => {
  it('Should generate valid pagination', () => {
    const metaPayload = new BaseMetaPayloadVm();
    metaPayload.page = 2;
    metaPayload.limit = 10;

    const qb = metaPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    metaPayload.applyQueryBuilderPagination(qb);

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

    expect(sql).toContain('branchName ASC');
  });

  it('Should generate valid filters', () => {
    const metaPayload = new BaseMetaPayloadVm();
    metaPayload.filters = [
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
        operator: 'ilike',
        value: 'abc',
      },
      {
        field: 'branchCode',
        operator: 'iew',
        value: 'abc',
      },
      {
        field: 'branchCode',
        operator: 'isw',
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
      {
        field: 'dot.field.example',
        operator: 'eq',
        value: 'anything',
      },
    ];

    const qb = metaPayload.buildQueryBuilder();
    qb.from('branch', 't1');

    const sql = qb.getSql();

    expect(sql).toContain('("branchCode" = $1 AND "branchCode" != $2');
    expect(sql).toContain('LOWER("branchCode") LIKE $3');
    expect(sql).toContain('LOWER("branchCode") LIKE $4');
    expect(sql).toContain('LOWER("branchCode") LIKE $5');
    expect(sql).toContain('"branchCode" LIKE $6');
    expect(sql).toContain('"branchCode" LIKE $7');
    expect(sql).toContain('"branchCode" LIKE $8');
    expect(sql).toContain('"depth" > $9');
    expect(sql).toContain('"depth" >= $10');
    expect(sql).toContain('"depth" < $11');
    expect(sql).toContain('"depth" <= $12');
    expect(sql).toContain('"branchCode" IN ($13, $14, $15)');
    expect(sql).toContain('"branchCode" NOT IN ($16, $17, $18)');
    expect(sql).toContain('"branchCode" IS NULL');
    expect(sql).toContain('"branchCode" IS NOT NULL');
    expect(sql).toContain('"dot"."field"."example" = $19)');
  });
});
