import { find, forEach } from 'lodash';
import { FindManyOptions } from 'typeorm';

import { ApiModelProperty, ApiModelPropertyOptional } from '../external/nestjs-swagger';
import { RequestQueryBuidlerService } from '../services/request-query-builder.service';
import { QueryConditionsHelper } from './query-condition-helper';

export class BaseQueryPayloadFilterVm {
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
    | 'like'
    | 'sw'
    | 'ew'
    | 'nnull'
    | 'null';

  @ApiModelProperty()
  value?: any;
}

export class BaseQueryPayloadSortVm {
  @ApiModelProperty()
  field: string;

  @ApiModelProperty({ enum: ['asc', 'desc'] })
  dir?: 'asc' | 'desc' = 'asc';
}

export class BaseQueryPayloadVm<TEntity> {
  @ApiModelPropertyOptional({ type: [BaseQueryPayloadFilterVm] })
  filter: BaseQueryPayloadFilterVm[][] = [];

  @ApiModelPropertyOptional({ type: [BaseQueryPayloadSortVm] })
  sort: BaseQueryPayloadSortVm[] = [];

  @ApiModelProperty()
  take: number = 10;

  @ApiModelProperty()
  skip: number = 0;

  conditionHelper = new QueryConditionsHelper();
  fieldResolverMap: { [key: string]: string } = {};

  setSort(field: string, dir: 'asc' | 'desc') {
    const existingSort = find(this.sort, { field });
    if (existingSort) {
      existingSort.dir = dir;
    } else {
      if (!this.sort) {
        this.sort = [];
      }
      this.sort.push({ field, dir });
    }
  }

  convertToFindOptions(): FindManyOptions<TEntity> {
    const options = {} as FindManyOptions;
    options.take = this.take;
    options.skip = this.skip;
    options.where = this.conditionHelper.buildConditions();

    options.order = {};
    forEach(this.sort, sort => {
      options.order[sort.field] = `${sort.dir}`.toUpperCase() as 'ASC' | 'DESC';
    });

    return options;
  }

  buildQueryBuilder() {
    return RequestQueryBuidlerService.buildQueryBuilderFromQueryPayload(
      this,
      this.fieldResolverMap,
    );
  }
}
