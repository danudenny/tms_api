import { Transform } from 'class-transformer';
import { findIndex, snakeCase } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { ApiModelProperty, ApiModelPropertyOptional } from '../external/nestjs-swagger';
import { OrionRepositoryQueryService } from '../services/orion-repository-query.service';
import { RequestOrionRepositoryService } from '../services/request-orion-repository.service';
import { RequestQueryBuidlerService } from '../services/request-query-builder.service';

export type BaseMetaPayloadFilterVmOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'ilike'
  | 'like'
  | 'isw'
  | 'sw'
  | 'iew'
  | 'ew'
  | 'nnull'
  | 'null';

export interface BaseMetaPayloadVmGlobalSearchField {
  field: string;
  operator?: BaseMetaPayloadFilterVmOperator;
}

export class BaseMetaPayloadFilterVm {
  @ApiModelProperty()
  field: string;

  @ApiModelProperty()
  operator: BaseMetaPayloadFilterVmOperator;

  @ApiModelProperty()
  value?: any;

  get sqlOperator() {
    return RequestQueryBuidlerService.convertFilterOperatorToSqlOperator(
      this.operator,
    );
  }
}

export class BaseMetaPayloadVm {
  @ApiModelProperty()
  @Transform(value => value || 1) // Transform imprted from 'class-transformer', set to 1 if value is undefined
  page: number;

  @ApiModelProperty()
  @Transform(value => value || 10) // Transform imprted from 'class-transformer', set to 10 if value is undefined
  limit: number;

  @ApiModelPropertyOptional()
  sortBy: string;

  @ApiModelPropertyOptional({ enum: ['asc', 'desc'] })
  sortDir: 'asc' | 'desc';

  @ApiModelPropertyOptional({ type: [BaseMetaPayloadFilterVm] })
  filters: BaseMetaPayloadFilterVm[] = [];

  @ApiModelPropertyOptional()
  search: string;

  autoConvertFieldsToSnakeCase: boolean = true;
  fieldResolverMap: { [key: string]: string } = {};
  fieldFilterManualMap: { [key: string]: boolean } = {};

  private _globalSearchFields: BaseMetaPayloadVmGlobalSearchField[] = [];
  get globalSearchFields() {
    return this._globalSearchFields;
  }
  set globalSearchFields(
    newGlobalSearchFields: BaseMetaPayloadVmGlobalSearchField[],
  ) {
    for (const newGlobalSearchField of newGlobalSearchFields) {
      const existingGlobalSearchFieldIdx = findIndex(this._globalSearchFields, {
        field: newGlobalSearchField.field,
      });
      if (existingGlobalSearchFieldIdx > -1) {
        this._globalSearchFields[
          existingGlobalSearchFieldIdx
        ] = newGlobalSearchField;
      } else {
        this._globalSearchFields.push(newGlobalSearchField);
      }
    }
  }

  buildQueryBuilder(applyPagination: boolean = false) {
    return RequestQueryBuidlerService.buildQueryBuilderFromMetaPayload(
      this,
      applyPagination,
    );
  }

  applyFiltersToQueryBuilder(
    queryBuilder: SelectQueryBuilder<any>,
    fieldNamesToFilter?: string | string[],
    fieldNamesToIgnore?: string | string[],
  ) {
    RequestQueryBuidlerService.applyMetaPayloadFilters(queryBuilder, this, fieldNamesToFilter, fieldNamesToIgnore);

    return queryBuilder;
  }

  applyPaginationToQueryBuilder(queryBuilder: SelectQueryBuilder<any>) {
    RequestQueryBuidlerService.applyMetaPayloadPagination(
      queryBuilder,
      this,
      false,
    );

    return queryBuilder;
  }

  applyRawPaginationToQueryBuilder(queryBuilder: SelectQueryBuilder<any>) {
    RequestQueryBuidlerService.applyMetaPayloadPagination(
      queryBuilder,
      this,
      true,
    );

    return queryBuilder;
  }

  ejectFilter(filterCritera: Partial<BaseMetaPayloadFilterVm>) {
    const filterIdx = findIndex(this.filters, filterCritera);
    if (filterIdx > -1) {
      const filter = this.filters[filterIdx];
      this.filters.splice(filterIdx, 1);
      return filter;
    }

    return false;
  }

  resolveFieldAsFieldAlias(field: string) {
    let targetField = field;
    if (this.fieldResolverMap[field]) {
      targetField = this.fieldResolverMap[field];
    } else if (this.autoConvertFieldsToSnakeCase) {
      targetField = snakeCase(field);
    }

    const dotFields = targetField.split('.');
    targetField = dotFields
      .map(subField => {
        if (!/^"/.test(targetField)) {
          return `"${subField}"`;
        }
        return subField;
      })
      .join('.');

    return targetField;
  }

  applyToOrionRepositoryQuery(
    orionRepositoryQuery: OrionRepositoryQueryService<any>,
    applyPagination: boolean = false,
  ) {
    RequestOrionRepositoryService.applyMetaPayload(
      orionRepositoryQuery,
      this,
      applyPagination,
    );

    return orionRepositoryQuery;
  }

  applyPaginationToOrionRepositoryQuery(
    orionRepositoryQuery: OrionRepositoryQueryService<any>,
  ) {
    RequestOrionRepositoryService.applyMetaPayloadPagination(
      orionRepositoryQuery,
      this,
    );

    return orionRepositoryQuery;
  }
}