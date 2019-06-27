import { toInteger } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { ApiModelProperty, ApiModelPropertyOptional } from '../external/nestjs-swagger';
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

export class BaseMetaPayloadFilterVm {
  @ApiModelProperty()
  field: string;

  @ApiModelProperty()
  operator:
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

  @ApiModelProperty()
  search: string;

  fieldResolverMap: { [key: string]: string } = {};

  buildQueryBuilder() {
    return RequestQueryBuidlerService.buildQueryBuilderFromMetaPayload(
      this,
      this.fieldResolverMap,
    );
  }

  applyQueryBuilderPagination(queryBuilder: SelectQueryBuilder<any>) {
    const page = toInteger(this.page) || 1;
    const take = toInteger(this.limit) || 10;
    let skip = (page - 1) * take;
    if (skip < 0) {
      skip = 0;
    }

    queryBuilder.take(take);
    queryBuilder.skip(skip);
  }
}
