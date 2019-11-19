import { camelCase, castArray, toInteger } from 'lodash';
import { Brackets, createQueryBuilder, SelectQueryBuilder, WhereExpression } from 'typeorm';

import { BaseMetaPayloadFilterVm, BaseMetaPayloadFilterVmOperator, BaseMetaPayloadVm } from '../models/base-meta-payload.vm';
import { BaseQueryPayloadVm } from '../models/base-query-payload.vm';

export class RequestQueryBuidlerService {
  public static applyMetaPayloadPagination(
    queryBuilder: SelectQueryBuilder<any>,
    metaPayload: BaseMetaPayloadVm,
    isRawQuery: boolean = true,
  ) {
    const page = toInteger(metaPayload.page) || 1;
    const take = toInteger(metaPayload.limit) || 10;
    let skip = (page - 1) * take;
    if (skip < 0) {
      skip = 0;
    }

    if (isRawQuery) {
      // for raw queries, it is best to use limit & offset
      queryBuilder.limit(take);
      queryBuilder.offset(skip);
    } else {
      queryBuilder.take(take);
      queryBuilder.skip(skip);
    }
  }

  public static applyMetaPayloadSort(
    queryBuilder: SelectQueryBuilder<any>,
    metaPayload: BaseMetaPayloadVm,
  ) {
    if (metaPayload.sortBy) {
      const sortBy = metaPayload.resolveFieldAsFieldAlias(metaPayload.sortBy);
      const sortDir: any = `${metaPayload.sortDir || 'asc'}`.toUpperCase();
      queryBuilder.orderBy(sortBy, sortDir);
    }
  }

  public static applyMetaPayloadSearch(
    queryBuilder: SelectQueryBuilder<any>,
    metaPayload: BaseMetaPayloadVm,
  ) {
    if (
      metaPayload.search &&
      metaPayload.globalSearchFields &&
      metaPayload.globalSearchFields.length
    ) {
      queryBuilder.andWhere(
        new Brackets(qbWhere => {
          for (const searchFieldIdx in metaPayload.globalSearchFields) {
            const searchField = metaPayload.globalSearchFields[searchFieldIdx];
            const field = metaPayload.resolveFieldAsFieldAlias(
              searchField.field,
            );

            const searchFieldFilter = new BaseMetaPayloadFilterVm();
            searchFieldFilter.field = field;
            searchFieldFilter.operator = searchFieldFilter.operator || 'ilike';
            searchFieldFilter.value = metaPayload.search;

            RequestQueryBuidlerService.applyMetaPayloadFilterItem(
              qbWhere,
              searchFieldFilter,
              'or',
              `search${searchFieldIdx}`,
            );
          }
        }),
      );
    }
  }

  public static applyMetaPayloadFilterItem(
    queryBuilder: SelectQueryBuilder<any> | WhereExpression,
    filter: BaseMetaPayloadFilterVm,
    mode: 'and' | 'or' = 'and',
    filterVarId?: string,
  ) {
    const field = filter.field;
    const operator = this.convertFilterOperatorToSqlOperator(filter.operator);

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

    // filterVar = branchName0, branchName1, depend on looping of applyMetaPayloadFilters
    const filterVar = `${camelCase(filter.field)}${filterVarId !== null && filterVarId !== undefined ? filterVarId : ''}`;
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

  public static applyMetaPayloadFilters(
    queryBuilder: SelectQueryBuilder<any>,
    metaPayload: BaseMetaPayloadVm,
    fieldNamesToFilter?: string | string[],
    fieldNamesToIgnore?: string | string[],
  ) {
    if (metaPayload.filters && metaPayload.filters.length) {
      let targetFilters: BaseMetaPayloadFilterVm[] = metaPayload.filters;
      if (fieldNamesToFilter) {
        fieldNamesToFilter = castArray(fieldNamesToFilter);
        targetFilters = metaPayload.filters.filter(f => fieldNamesToFilter.includes(f.field));
      }

      if (fieldNamesToIgnore) {
        fieldNamesToIgnore = castArray(fieldNamesToIgnore);
        targetFilters = metaPayload.filters.filter(f => !fieldNamesToIgnore.includes(f.field));
      }

      queryBuilder.andWhere(
        new Brackets(qbAndWhere => {
          for (const andFilterIdx in targetFilters) {
            const andFilter = targetFilters[andFilterIdx];
            andFilter.operator = andFilter.operator || 'eq';
            if (!['null', 'nnull'].includes(andFilter.operator) && !andFilter.value) {
              continue;
            }

            const field = metaPayload.resolveFieldAsFieldAlias(andFilter.field);
            const clonedFilter = new BaseMetaPayloadFilterVm();
            clonedFilter.field = field;
            clonedFilter.operator = andFilter.operator;
            clonedFilter.value = andFilter.value;

            this.applyMetaPayloadFilterItem(
              qbAndWhere,
              clonedFilter,
              'and',
              andFilterIdx,
            );
          }
        }),
      );
    }
  }

  public static buildQueryBuilderFromMetaPayload(
    metaPayload: BaseMetaPayloadVm,
    applyPagination: boolean = false,
  ) {
    const queryBuilder = createQueryBuilder();

    this.applyMetaPayloadFilters(queryBuilder, metaPayload, null, Object.keys(metaPayload.fieldFilterManualMap));
    this.applyMetaPayloadSearch(queryBuilder, metaPayload);
    this.applyMetaPayloadSort(queryBuilder, metaPayload);

    if (applyPagination) {
      this.applyMetaPayloadPagination(queryBuilder, metaPayload);
    }

    return queryBuilder;
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
                const operator = andFilterGroup.operator || 'eq';
                if (fieldResolverMap[andFilterGroup.field]) {
                  field = fieldResolverMap[andFilterGroup.field];
                } else {
                  // wrap with double quotes, name => "name", user.name => "user"."name"
                  const dotFields = andFilterGroup.field.split('.');
                  field = dotFields.map(dotField => `"${dotField}"`).join('.');
                }

                const clonedFilter = new BaseMetaPayloadFilterVm();
                clonedFilter.field = field;
                clonedFilter.operator = operator;
                clonedFilter.value = andFilterGroup.value;

                this.applyMetaPayloadFilterItem(
                  qbOrWhere,
                  clonedFilter,
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

  public static convertFilterOperatorToSqlOperator(filterOperator: BaseMetaPayloadFilterVmOperator) {
    let operator = '=';
    switch (filterOperator) {
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

    return operator;
  }
}
