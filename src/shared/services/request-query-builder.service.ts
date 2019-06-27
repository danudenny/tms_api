import { castArray, toInteger } from 'lodash';
import { Brackets, createQueryBuilder, SelectQueryBuilder, WhereExpression } from 'typeorm';

import { BaseMetaPayloadFilterVm, BaseMetaPayloadVm } from '../models/base-meta-payload.vm';
import { BaseQueryPayloadVm } from '../models/base-query-payload.vm';

export class RequestQueryBuidlerService {
  public static applyMetaPayloadFilter(
    queryBuilder: SelectQueryBuilder<any> | WhereExpression,
    filter: BaseMetaPayloadFilterVm,
    mode: 'and' | 'or' = 'and',
    filterVarId?: string,
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
      case 'ilike':
      case 'sw':
      case 'isw':
      case 'ew':
      case 'iew':
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
      case 'isw':
        value = `${filter.value}%`.toLowerCase();
        break;
      case 'iew':
        value = `%${filter.value}`.toLowerCase();
        break;
      case 'ilike':
        value = `%${filter.value}%`.toLowerCase();
        break;
      case 'sw':
        value = `${filter.value}%`;
        break;
      case 'ew':
        value = `%${filter.value}`;
        break;
      case 'like':
        value = `%${filter.value}%`;
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

    const filterVar = filterVarId ? `val${filterVarId}` : 'val';
    const filterVarValue = { [filterVar]: value };
    switch (filter.operator) {
      case 'in':
      case 'nin':
        if (value && value.length) {
          whereFn(`${field} ${operator} (:...${filterVar})`, filterVarValue);
        }
        break;
      case 'ilike':
      case 'isw':
      case 'iew':
        whereFn(`LOWER(${field}) ${operator} :${filterVar}`, filterVarValue);
        break;
      case 'null':
      case 'nnull':
        whereFn(`${field} ${operator}`);
        break;
      default:
        whereFn(`${field} ${operator} :${filterVar}`, filterVarValue);
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
      for (const orFilterGroupIdx in queryPayload.filter) {
        const orFilterGroup = queryPayload.filter[orFilterGroupIdx];
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
                this.applyMetaPayloadFilter(
                  qbOrWhere,
                  {
                    ...andFilterGroup,
                    field, // replace field with the one on fieldResolverMap if exists, this may help for field aliases that contains quote
                  },
                  'and',
                  orFilterGroupIdx,
                );
              }
            }),
          );
        }
      }
    }

    return qb;
  }

  public static buildQueryBuilderFromMetaPayload(
    metaPayload: BaseMetaPayloadVm,
  ) {
    const qb = createQueryBuilder();

    if (metaPayload.sortBy) {
      const sortBy = metaPayload.resolveFieldAsFieldAlias(metaPayload.sortBy);
      const sortDir: any = `${metaPayload.sortDir || 'asc'}`.toUpperCase();
      qb.orderBy(sortBy, sortDir);
    }

    if (metaPayload.filters && metaPayload.filters.length) {
      qb.andWhere(
        new Brackets(qbAndWhere => {
          for (const andFilterIdx in metaPayload.filters) {
            const andFilter = metaPayload.filters[andFilterIdx];
            const field = metaPayload.resolveFieldAsFieldAlias(andFilter.field);
            this.applyMetaPayloadFilter(
              qbAndWhere,
              {
                ...andFilter,
                field, // replace field with the one on fieldResolverMap if exists, this may help for field aliases that contains quote
              },
              'and',
              andFilterIdx,
            );
          }
        }),
      );
    }

    return qb;
  }

  public static applyMetaPayloadPagination(
    queryBuilder: SelectQueryBuilder<any>,
    metaPayload: BaseMetaPayloadVm,
  ) {
    const page = toInteger(metaPayload.page) || 1;
    const take = toInteger(metaPayload.limit) || 10;
    let skip = (page - 1) * take;
    if (skip < 0) {
      skip = 0;
    }

    queryBuilder.take(take);
    queryBuilder.skip(skip);
  }
}
