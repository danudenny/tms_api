import { castArray, toInteger } from 'lodash';

import { BaseMetaPayloadFilterVm, BaseMetaPayloadVm } from '../models/base-meta-payload.vm';
import { OrionRepositoryQueryConditionService } from './orion-repository-query-condition.service';
import { OrionRepositoryQueryService } from './orion-repository-query.service';

export class RequestOrionRepositoryService {
  public static applyMetaPayloadPagination(
    repositoryQuery: OrionRepositoryQueryService<any>,
    metaPayload: BaseMetaPayloadVm,
  ) {
    const page = toInteger(metaPayload.page) || 1;
    const take = toInteger(metaPayload.limit) || 10;
    let skip = (page - 1) * take;
    if (skip < 0) {
      skip = 0;
    }

    repositoryQuery.take(take);
    repositoryQuery.skip(skip);
  }

  public static applyMetaPayloadSort(
    repositoryQuery: OrionRepositoryQueryService<any>,
    metaPayload: BaseMetaPayloadVm,
  ) {
    if (metaPayload.sortBy) {
      const sortBy = metaPayload.resolveFieldAsFieldAlias(metaPayload.sortBy);
      const sortDir: any = `${metaPayload.sortDir || 'asc'}`.toUpperCase();
      repositoryQuery.orderByRaw(sortBy, sortDir);
    }
  }

  public static applyMetaPayloadFilterItem(
    repositoryQueryCondition: OrionRepositoryQueryConditionService<any>,
    metaPayloadFilter: BaseMetaPayloadFilterVm,
  ) {
    switch (metaPayloadFilter.operator) {
      case 'eq':
        repositoryQueryCondition.equals(metaPayloadFilter.value);
        break;
      case 'neq':
        repositoryQueryCondition.notEquals(metaPayloadFilter.value);
        break;
      case 'like':
        repositoryQueryCondition.contains(metaPayloadFilter.value);
        break;
      case 'ilike':
        repositoryQueryCondition.contains(metaPayloadFilter.value, true);
        break;
      case 'sw':
        repositoryQueryCondition.beginsWith(metaPayloadFilter.value);
        break;
      case 'isw':
        repositoryQueryCondition.beginsWith(metaPayloadFilter.value, true);
        break;
      case 'ew':
        repositoryQueryCondition.endsWith(metaPayloadFilter.value);
        break;
      case 'iew':
        repositoryQueryCondition.endsWith(metaPayloadFilter.value, true);
        break;
      case 'neq':
        repositoryQueryCondition.notEquals(metaPayloadFilter.value);
        break;
      case 'gt':
        repositoryQueryCondition.greaterThan(metaPayloadFilter.value);
        break;
      case 'gte':
        repositoryQueryCondition.greaterThanOrEqual(metaPayloadFilter.value);
        break;
      case 'lt':
        repositoryQueryCondition.lessThan(metaPayloadFilter.value);
        break;
      case 'lte':
        repositoryQueryCondition.lessThanOrEqual(metaPayloadFilter.value);
        break;
      case 'in':
        repositoryQueryCondition.in(castArray(metaPayloadFilter.value));
        break;
      case 'nin':
        repositoryQueryCondition.notIn(castArray(metaPayloadFilter.value));
        break;
      case 'null':
        repositoryQueryCondition.isNull();
        break;
      case 'nnull':
        repositoryQueryCondition.isNotNull();
        break;
    }
  }

  public static applyMetaPayloadFilter(
    repositoryQuery: OrionRepositoryQueryService<any>,
    metaPayload: BaseMetaPayloadVm,
  ) {
    if (metaPayload.filters && metaPayload.filters.length) {
      const filters = metaPayload.filters;

      repositoryQuery.andWhereIsolated(qWhere => {
        for (const filter of filters) {
          filter.operator = filter.operator || 'eq';
          if (!['null', 'nnull'].includes(filter.operator) && !filter.value) {
            continue;
          }

          const field = metaPayload.resolveFieldAsFieldAlias(filter.field);
          qWhere.andWhere(
            field,
            qWhereItem => {
              this.applyMetaPayloadFilterItem(qWhereItem, filter);
            },
            false,
          );
        }
      });
    }
  }

  public static applyMetaPayloadSearch(
    repositoryQuery: OrionRepositoryQueryService<any>,
    metaPayload: BaseMetaPayloadVm,
  ) {
    if (
      metaPayload.search &&
      metaPayload.globalSearchFields &&
      metaPayload.globalSearchFields.length
    ) {
      repositoryQuery.andWhereIsolated(qWhere => {
        for (const searchFieldIdx in metaPayload.globalSearchFields) {
          const searchField = metaPayload.globalSearchFields[searchFieldIdx];
          const field = metaPayload.resolveFieldAsFieldAlias(searchField.field);

          const targetFilter = new BaseMetaPayloadFilterVm();
          targetFilter.field = field;
          targetFilter.operator = searchField.operator || 'ilike';
          targetFilter.value = metaPayload.search;

          qWhere.orWhere(
            field,
            qWhereItem => {
              this.applyMetaPayloadFilterItem(qWhereItem, targetFilter);
            },
            false,
          );
        }
      });
    }
  }

  public static applyMetaPayload(
    repositoryQuery: OrionRepositoryQueryService<any>,
    metaPayload: BaseMetaPayloadVm,
    applyPagination: boolean = false,
  ) {
    this.applyMetaPayloadFilter(repositoryQuery, metaPayload);
    this.applyMetaPayloadSearch(repositoryQuery, metaPayload);
    this.applyMetaPayloadSort(repositoryQuery, metaPayload);

    if (applyPagination) {
      this.applyMetaPayloadPagination(repositoryQuery, metaPayload);
    }
  }
}
