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
    const queryBuilder = RequestQueryBuidlerService.buildQueryBuilderFromMetaPayload(
      this,
    );

    if (applyPagination) {
      this.applyPaginationToQueryBuilder(queryBuilder);
    }

    return queryBuilder;
  }

  applyPaginationToQueryBuilder(queryBuilder: SelectQueryBuilder<any>) {
    RequestQueryBuidlerService.applyMetaPayloadPagination(queryBuilder, this);
  }

  resolveFieldAsFieldAlias(field: string) {
    let targetField = field;
    if (this.fieldResolverMap[field]) {
      targetField = this.fieldResolverMap[field];
    } else {
      // wrap with double quotes, name => "name", user.name => "user"."name"
      const dotFields = field.split('.');
      targetField = dotFields.map(dotField => `"${dotField}"`).join('.');
    }
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
  }
}
