import { Dictionary } from 'lodash';
import { EntityManager, SelectQueryBuilder } from 'typeorm';

export type OrionRepositoryQueryPropType = string | number | boolean | Object;
export type OrionRepositoryQueryComparableProp =
  | string
  | number
  | boolean
  | Date;

export type OrionRepositoryQueryPropsDef<T> = Partial<
  {
    [K in keyof T]: OrionRepositoryQueryPropsDef<ExtractObjectType<T[K]>> & T[K]
  }
>;

export type OrionRepositoryQueryProps<T extends Object, V = any> = Partial<
  { [K in keyof T]: OrionRepositoryQueryProps<ExtractObjectType<T[K]>, V> | V }
>;
export type OrionRepositoryQueryPropsResult<V = any> = Dictionary<V>;

export type OrionRepositoryQuerySelectableProps<
  T extends Object
> = OrionRepositoryQueryProps<ExtractObjectType<T>, true>;
export type OrionRepositoryQuerySelectablePropsResult = OrionRepositoryQueryPropsResult<
  true
>;

export type OrionRepositoryQueryOrderableProps<
  T extends Object
> = OrionRepositoryQueryProps<ExtractObjectType<T>, 'ASC' | 'DESC'>;
export type OrionRepositoryQueryOrderablePropsResult = OrionRepositoryQueryPropsResult<
  'ASC' | 'DESC'
>;

export type OrionRepositoryQueryGroupableProps<
  T extends Object
> = OrionRepositoryQueryProps<ExtractObjectType<T>, true>;
export type OrionRepositoryQueryGroupablePropsResult = OrionRepositoryQueryPropsResult<
  true
>;

export class OrionRepositoryOptions {
  connectionName?: string;
  manager?: EntityManager;
}

export enum OrionRepositoryQueryMode {
  Master,
  Join,
  SubQuery,
}

export class OrionRepositorQueryConditionOptions {
  matchCase?: boolean;
}

export class OrionRepositorQueryConditionOptionsInternal {
  beginsWith?: boolean;
  endsWith?: boolean;
  quoteString?: boolean;
  insensitive?: boolean;
}

export class OrionRepositoryQueryBuilderPart<T> {
  public constructor(
    public partAction: (...params: any[]) => SelectQueryBuilder<T>,
    public partParams: any[],
  ) {}
}
