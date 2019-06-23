import { castArray } from 'lodash';
import { Brackets, createQueryBuilder, SelectQueryBuilder, WhereExpression } from 'typeorm';

import { BaseQueryPayloadFilterVm, BaseQueryPayloadVm } from '../models/base-query-payload.vm';

export class RequestQueryBuidlerService {
  public static applyQueryPayloadFilter(
    queryBuilder: SelectQueryBuilder<any> | WhereExpression,
    filter: BaseQueryPayloadFilterVm,
    mode: 'and' | 'or' = 'and',
  ) {
    const field = filter.field;

    let operator = '=';
    switch (filter.operator) {
      case 'eq':
        operator = '=';
        break;
      case 'neq':
        operator = '!=';
        break;
      case 'like':
      case 'sw':
      case 'ew':
        operator = 'LIKE';
        break;
      case 'gt':
        operator = '>';
        break;
      case 'gte':
        operator = '>=';
        break;
      case 'lt':
        operator = '<';
        break;
      case 'lte':
        operator = '<=';
        break;
      case 'in':
        operator = 'IN';
        break;
      case 'nin':
        operator = 'NOT IN';
        break;
      case 'null':
        operator = 'IS NULL';
        break;
      case 'nnull':
        operator = 'IS NOT NULL';
        break;
    }

    let value = filter.value;
    switch (filter.operator) {
      case 'sw':
        value = `${filter.value}%`.toLowerCase();
        break;
      case 'ew':
        value = `%${filter.value}`.toLowerCase();
        break;
      case 'like':
        value = `%${filter.value}%`.toLowerCase();
        break;
      case 'in':
      case 'nin':
        value = castArray(filter.value);
        break;
    }

    let whereFn = queryBuilder.andWhere.bind(queryBuilder);
    switch (mode) {
      case 'and':
        whereFn = queryBuilder.andWhere.bind(queryBuilder);
        break;
      case 'or':
        whereFn = queryBuilder.orWhere.bind(queryBuilder);
        break;
    }

    switch (filter.operator) {
      case 'in':
      case 'nin':
        if (value && value.length) {
          whereFn(`${field} ${operator} (:...val)`, { val: value });
        }
        break;
      case 'like':
      case 'sw':
      case 'ew':
        whereFn(`LOWER(${field}) ${operator} :val`, { val: value });
        break;
      case 'null':
      case 'nnull':
        whereFn(`${field} ${operator}`);
        break;
      default:
        whereFn(`${field} ${operator} :val`, { val: value });
        break;
    }
  }

  public static buildQueryBuilderFromQueryPayload(
    queryPayload: BaseQueryPayloadVm<any>,
    fieldResolverMap: { [key: string]: string } = {},
  ) {
    const qb = createQueryBuilder();

    if (queryPayload.take !== null && queryPayload.take !== undefined) {
      qb.limit(queryPayload.take);
    }

    if (queryPayload.skip !== null && queryPayload.skip !== undefined) {
      qb.offset(queryPayload.skip);
    }

    if (queryPayload.sort && queryPayload.sort.length) {
      for (const sort of queryPayload.sort) {
        qb.addOrderBy(sort.field, `${sort.dir || 'asc'}`.toUpperCase() as any);
      }
    }

    if (queryPayload.filter && queryPayload.filter.length) {
      for (const orFilterGroup of queryPayload.filter) {
        if (orFilterGroup.length) {
          qb.orWhere(
            new Brackets(qbOrWhere => {
              for (const andFilterGroup of orFilterGroup) {
                let field = andFilterGroup.field;
                if (fieldResolverMap[andFilterGroup.field]) {
                  field = fieldResolverMap[andFilterGroup.field];
                } else {
                  // wrap with double quotes, name => "name", user.name => "user"."name"
                  const dotFields = andFilterGroup.field.split('.');
                  field = dotFields.map(dotField => `"${dotField}"`).join('.');
                }
                this.applyQueryPayloadFilter(
                  qbOrWhere,
                  {
                    ...andFilterGroup,
                    field, // replace field with the one on fieldResolverMap if exists, this may help for field aliases that contains quote
                  },
                  'and',
                );
              }
            }),
          );
        }
      }
    }

    return qb;
  }
}
