import { snakeCase } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { ApiModelProperty, ApiModelPropertyOptional } from '../external/nestjs-swagger';
import { OrionRepositoryQueryService } from '../services/orion-repository-query.service';
import { RequestOrionRepositoryService } from '../services/request-orion-repository.service';
import { RequestQueryBuidlerService } from '../services/request-query-builder.service';

export class MetaPayloadPageSort {
  // TODO: Delete this and all dependants
  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}

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

export class BaseMetaPayloadFilterVm {
  @ApiModelProperty()
  field: string;

  @ApiModelProperty()
  operator: BaseMetaPayloadFilterVmOperator;

  @ApiModelProperty()
  value?: any;
}

export class BaseMetaPayloadVm {
  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelPropertyOptional()
  sortBy: string;

  @ApiModelPropertyOptional({ enum: ['asc', 'desc'] })
  sortDir: 'asc' | 'desc';

  @ApiModelPropertyOptional({ type: [BaseMetaPayloadFilterVm] })
  filters: BaseMetaPayloadFilterVm[] = [];

  @ApiModelPropertyOptional()
  search: string;

  fieldResolverMap: { [key: string]: string } = {};
  searchFields: Array<{
    field: string;
    operator?: BaseMetaPayloadFilterVmOperator;
  }> = [];

  setFieldResolverMapAsSnakeCase(fields: string[]) {
    for (const field of fields) {
      this.fieldResolverMap[field] = snakeCase(field);
    }
  }

  buildQueryBuilder(applyPagination: boolean = false) {
    return RequestQueryBuidlerService.buildQueryBuilderFromMetaPayload(
      this,
      applyPagination,
    );
  }

  applyPaginationToQueryBuilder(queryBuilder: SelectQueryBuilder<any>) {
    RequestQueryBuidlerService.applyMetaPayloadPagination(queryBuilder, this);

    return queryBuilder;
  }

  resolveFieldAsFieldAlias(field: string) {
    let targetField = field;
    if (this.fieldResolverMap[field]) {
      targetField = this.fieldResolverMap[field];
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
