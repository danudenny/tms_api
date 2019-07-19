import { castArray, find, findIndex, forEach, isArray, isBoolean, isFunction, isString, toNumber, transform } from 'lodash';
import { from } from 'rxjs';
import { Brackets, EntityManager, EntityMetadata, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EmbeddedMetadata } from 'typeorm/metadata/EmbeddedMetadata';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import {
  OrionRepositoryQueryBuilderPart,
  OrionRepositoryQueryComparableProp,
  OrionRepositoryQueryGroupableProps,
  OrionRepositoryQueryMode,
  OrionRepositoryQueryOrderableProps,
  OrionRepositoryQueryOrderablePropsResult,
  OrionRepositoryQueryProps,
  OrionRepositoryQueryPropsDef,
  OrionRepositoryQueryPropsResult,
  OrionRepositoryQueryPropType,
  OrionRepositoryQuerySelectableProps,
  OrionRepositoryQuerySelectablePropsResult,
} from '../models/orion-repository.model';
import { nameOfProp, nameOfProps } from '../util/nameof';
import { ObjectService } from './object.service';
import { OrionRepositoryQueryConditionService } from './orion-repository-query-condition.service';

export class OrionRepositoryQueryService<
  T,
  R = T | T[],
  P = OrionRepositoryQueryPropsDef<T>
> {
  public queryBuilderParts = new Array<OrionRepositoryQueryBuilderPart<T>>();

  private _autoJoinEagerRelations: boolean = true;

  private get isRawQuery() {
    if (
      !this.execAction ||
      // tslint:disable-next-line: triple-equals
      this.execAction == (this.queryBuilder.getRawMany as any) ||
      // tslint:disable-next-line: triple-equals
      this.execAction == this.queryBuilder.getRawOne
    ) {
      return true;
    }

    return false;
  }

  public constructor(
    public readonly entityManager: EntityManager,
    public readonly entityMetadata: EntityMetadata,
    public queryBuilder: SelectQueryBuilder<T>,
    public execAction: () => Promise<R>,
    public targetAlias: string,
    private readonly queryMode: OrionRepositoryQueryMode = OrionRepositoryQueryMode.Master,
    private readonly relationHistory: Array<{
      systemAlias: string;
      relationAlias: string;
      relationMetadata: RelationMetadata;
    }> = [],
    private readonly selectHistory: Array<{
      properties: string[];
      targetAlias: string;
    }> = [],
    private readonly propsMetadata: {
      [key: string]: RelationMetadata | ColumnMetadata | EmbeddedMetadata;
    } = {},
  ) {
    this.relationHistory.push(
      ...this.queryBuilder.expressionMap.joinAttributes.map(joinAttribute => ({
        systemAlias: joinAttribute.alias.name, // FIXME: Should get system default alias, e.g: do_pod_branch
        relationAlias: joinAttribute.alias.name,
        relationMetadata: joinAttribute.relation,
      })),
    );

    if (this.isRawQuery) {
      this._autoJoinEagerRelations = false;
    }
  }

  public andWhere(
    propertySelector: ((obj: P) => OrionRepositoryQueryComparableProp) | string,
    whereFn: (queryCondition: OrionRepositoryQueryConditionService<T>) => void,
    resolvePropertyAndAutoJoin?: boolean,
  ) {
    return this.whereBase(
      propertySelector,
      whereFn,
      this.queryBuilder.andWhere,
      resolvePropertyAndAutoJoin,
    );
  }

  public andWhereInIds(ids: any | any[]) {
    ids = castArray(ids);

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(this.queryBuilder.andWhereInIds, [
        ids,
      ]),
    );

    return this;
  }

  public andWhereIsolated(and: (query: OrionRepositoryQueryService<T>) => any) {
    return this.isolatedConditions(and, this.queryBuilder.andWhere);
  }

  public andWhereRaw(
    whereExpression: string,
    whereParams: any = {},
    fieldsSelector?:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
  ) {
    return this.whereBaseRaw(
      whereExpression,
      whereParams,
      fieldsSelector,
      this.queryBuilder.andWhere,
    );
  }

  public asObservable() {
    return from(this.exec());
  }

  public catch(rejected: (error: any) => any) {
    return this.toPromise().catch(rejected);
  }

  public count(): Promise<number> {
    const compiledQueryBuilder = this.compileQueryParts();

    if (this.isRawQuery) {
      return this.getCountRawQuery(compiledQueryBuilder);
    } else {
      return compiledQueryBuilder.getCount();
    }
  }

  public countWithoutTakeAndSkip(): Promise<number> {
    const queryBuilderParts = this.queryBuilderParts.slice().filter(
      part =>
        // tslint:disable-next-line: triple-equals
        part.partAction != this.queryBuilder.take &&
        // tslint:disable-next-line: triple-equals
        part.partAction != this.queryBuilder.skip &&
        // tslint:disable-next-line: triple-equals
        part.partAction != this.queryBuilder.offset &&
        // tslint:disable-next-line: triple-equals
        part.partAction != this.queryBuilder.limit,
    );

    const compiledQueryBuilder = this.compileQueryParts(
      this.queryBuilder.clone(),
      queryBuilderParts,
    );

    if (this.isRawQuery) {
      return this.getCountRawQuery(compiledQueryBuilder);
    } else {
      return compiledQueryBuilder.getCount();
    }
  }

  public disableAutoJoinEagerRelations() {
    this._autoJoinEagerRelations = false;

    return this;
  }

  public enableAutoJoinEagerRelations() {
    this._autoJoinEagerRelations = true;

    return this;
  }

  public escape(str: string) {
    return this.escapeCommaSeparatedAliases(str);
  }

  public exec(): Promise<R> {
    if (!this.execAction) {
      throw new Error(
        `calling exec requires execAction to be defined, you can't call exec for subQuery or inside join`,
      );
    }

    const compiledQueryBuilder = this.compileQueryParts();

    return this.execAction.call(compiledQueryBuilder);
  }

  public fromSubQuery(
    fromQuery: OrionRepositoryQueryService<any>,
    aliasName: string,
  ) {
    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(this.queryBuilder.addFrom as any, [
        () => fromQuery.compileQueryParts(),
        aliasName,
      ]),
    );

    return this;
  }

  public getQuery() {
    const compiledQueryBuilder = this.compileQueryParts();

    return compiledQueryBuilder.getQuery();
  }

  public groupBy(properties: OrionRepositoryQueryGroupableProps<T>) {
    const resolvedGroupByProperties = this.flattenPropertiesAndResolveKeys<
      OrionRepositoryQueryOrderablePropsResult
    >(properties);

    forEach(resolvedGroupByProperties, (_value, property) => {
      let action;
      if (!this.isGroupByPartExists()) {
        action = this.queryBuilder.groupBy;
      } else {
        action = this.queryBuilder.addGroupBy;
      }

      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(action, [property]),
      );
    });

    return this;
  }

  public groupByRaw(
    groupByExpression: string,
    fieldsSelector?:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
  ) {
    groupByExpression = this.resolveRawExpressionFields(
      groupByExpression,
      fieldsSelector,
      true,
    );

    const queryBuilderAction = !this.isGroupByPartExists()
      ? this.queryBuilder.groupBy
      : this.queryBuilder.addGroupBy;
    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(queryBuilderAction, [
        groupByExpression,
      ]),
    );

    return this;
  }

  public innerJoin<JR extends Object>(
    propertySelector: ((obj: P) => JR) | string,
    joinAlias?: string,
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(
      propertySelector,
      this.queryBuilder.innerJoin,
      joinAlias,
      joinFn,
    );
  }

  public innerJoinRaw(
    fromQuery: OrionRepositoryQueryService<any>,
    joinAlias: string,
    condition?: string,
    parameters?: ObjectLiteral,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinRawBase(
      fromQuery,
      joinAlias,
      condition,
      parameters,
      this.queryBuilder.innerJoin,
    );
  }

  public innerJoinAndSelect<JR extends Object>(
    propertySelector: ((obj: P) => JR) | string,
    joinAlias?: string,
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(
      propertySelector,
      this.queryBuilder.innerJoinAndSelect,
      joinAlias,
      joinFn,
    );
  }

  public innerJoinAndSelectRaw(
    fromQuery: OrionRepositoryQueryService<any>,
    joinAlias: string,
    condition?: string,
    parameters?: ObjectLiteral,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinRawBase(
      fromQuery,
      joinAlias,
      condition,
      parameters,
      this.queryBuilder.innerJoinAndSelect,
    );
  }

  public leftJoin<JR extends Object>(
    propertySelector: ((obj: P) => JR) | string,
    joinAlias?: string,
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(
      propertySelector,
      this.queryBuilder.leftJoin,
      joinAlias,
      joinFn,
    );
  }

  public leftJoinRaw(
    fromQueryOrEntity: OrionRepositoryQueryService<any> | any,
    joinAlias: string,
    condition?: string,
    parameters?: ObjectLiteral,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinRawBase(
      fromQueryOrEntity,
      joinAlias,
      condition,
      parameters,
      this.queryBuilder.leftJoin,
    );
  }

  public leftJoinAndSelect<JR extends Object>(
    propertySelector: ((obj: P) => JR) | string,
    joinAlias?: string,
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(
      propertySelector,
      this.queryBuilder.leftJoinAndSelect,
      joinAlias,
      joinFn,
    );
  }

  public leftJoinAndSelectRaw(
    fromQueryOrEntity: OrionRepositoryQueryService<any> | any,
    joinAlias: string,
    condition?: string,
    parameters?: ObjectLiteral,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinRawBase(
      fromQueryOrEntity,
      joinAlias,
      condition,
      parameters,
      this.queryBuilder.leftJoinAndSelect,
    );
  }

  public orderBy(properties: OrionRepositoryQueryOrderableProps<T>) {
    const resolvedOrderProperties = this.flattenPropertiesAndResolveKeys<
      OrionRepositoryQueryOrderablePropsResult
    >(properties);

    forEach(resolvedOrderProperties, (direction, property) => {
      let action;
      if (!this.isOrderByPartExists()) {
        action = this.queryBuilder.orderBy;
      } else {
        action = this.queryBuilder.addOrderBy;
      }

      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(action, [
          property,
          direction.toUpperCase(),
        ]),
      );
    });

    return this;
  }

  public orderByRaw(
    orderByExpression: string,
    direction: 'ASC' | 'DESC' = 'ASC',
    fieldSelector?: ((obj: P) => OrionRepositoryQueryPropType) | string,
  ) {
    orderByExpression = this.resolveRawExpressionFields(
      orderByExpression,
      fieldSelector,
      true,
    );

    const queryBuilderAction = !this.isOrderByPartExists()
      ? this.queryBuilder.orderBy
      : this.queryBuilder.addOrderBy;

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(queryBuilderAction, [
        orderByExpression,
        direction,
      ]),
    );

    return this;
  }

  public orWhere(
    propertySelector: ((obj: P) => OrionRepositoryQueryComparableProp) | string,
    whereFn: (queryCondition: OrionRepositoryQueryConditionService<T>) => void,
    resolvePropertyAndAutoJoin?: boolean,
  ) {
    return this.whereBase(
      propertySelector,
      whereFn,
      this.queryBuilder.orWhere,
      resolvePropertyAndAutoJoin,
    );
  }

  public orWhereInIds(ids: any | any[]) {
    ids = castArray(ids);

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(this.queryBuilder.orWhereInIds, [
        ids,
      ]),
    );

    return this;
  }

  public orWhereIsolated(or: (query: OrionRepositoryQueryService<T>) => any) {
    return this.isolatedConditions(or, this.queryBuilder.orWhere);
  }

  public orWhereRaw(
    whereExpression: string,
    whereParams: any = {},
    fieldsSelector?:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
  ) {
    return this.whereBaseRaw(
      whereExpression,
      whereParams,
      fieldsSelector,
      this.queryBuilder.orWhere,
    );
  }

  public select(
    properties: OrionRepositoryQuerySelectableProps<T>,
    resolvePropertyKeys: boolean = true,
  ) {
    let selectProperties = {};
    if (resolvePropertyKeys) {
      selectProperties = this.flattenPropertiesAndResolveKeys<
        OrionRepositoryQuerySelectablePropsResult
      >(properties);
    } else {
      selectProperties = this.flattenProperties<
        OrionRepositoryQuerySelectablePropsResult
      >(properties);
    }

    const targetSelectProperties = Object.keys(selectProperties);

    this.selectHistory.push({
      properties: targetSelectProperties,
      targetAlias: this.targetAlias,
    });

    forEach(selectProperties, (selectPropertyAlias, selectProperty) => {
      const partParams: string[] = [selectProperty];
      if (isString(selectPropertyAlias)) {
        partParams.push(selectPropertyAlias);
      }
      if (!this.isSelectPartExists()) {
        this.queryBuilderParts.unshift(
          new OrionRepositoryQueryBuilderPart(
            this.queryBuilder.select,
            partParams,
          ),
        );
      } else {
        this.queryBuilderParts.push(
          new OrionRepositoryQueryBuilderPart(
            this.queryBuilder.addSelect,
            partParams,
          ),
        );
      }
    });

    return this;
  }

  public selectRaw(
    ...args: Array<
      | string
      | string[]
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
    >
  ) {
    const expressionArgs = args.filter(
      arg => isString(arg) || (isArray(arg) && arg.length <= 2),
    );
    if (!expressionArgs.length) {
      throw new Error(`String expression is required for the selectRaw method`);
    }

    const fnArgs = args.filter(isFunction);
    if (fnArgs.length && fnArgs.length > 1) {
      throw new Error(
        `Fields selector cannot be more than one inside selectRaw method`,
      );
    }

    const fieldsSelector = fnArgs[0];
    const resolvedPropertyNames = this.resolvePropertySelectorAndAutoJoin(
      fieldsSelector,
    );

    const resolvedExpressionArgs = expressionArgs.map(str => {
      const targetExpression = castArray(str as string | string[]);
      targetExpression[0] = this.replaceRawExpressionArrayArgs(
        targetExpression[0],
        resolvedPropertyNames,
      );

      return targetExpression;
    });

    for (const resolvedExpressionArg of resolvedExpressionArgs) {
      if (!this.isSelectPartExists()) {
        this.queryBuilderParts.unshift(
          new OrionRepositoryQueryBuilderPart(
            this.queryBuilder.select,
            resolvedExpressionArg,
          ),
        );
      } else {
        this.queryBuilderParts.push(
          new OrionRepositoryQueryBuilderPart(
            this.queryBuilder.addSelect,
            resolvedExpressionArg,
          ),
        );
      }
    }

    return this;
  }

  public skip(skip: number) {
    if (skip > 0) {
      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(this.queryBuilder.offset, [skip]),
      );
    }

    return this;
  }

  public take(limit: number) {
    if (limit > 0) {
      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(this.queryBuilder.limit, [limit]),
      );
    }

    return this;
  }

  public then(resolved: (results: R) => any) {
    return this.toPromise().then(results => {
      resolved(results);
    });
  }

  public toPromise(): Promise<R> {
    return this.exec();
  }

  public where(
    propertySelector: ((obj: P) => OrionRepositoryQueryComparableProp) | string,
    whereFn: (queryCondition: OrionRepositoryQueryConditionService<T>) => void,
    resolvePropertyAndAutoJoin?: boolean,
  ) {
    return this.whereBase(
      propertySelector,
      whereFn,
      this.queryBuilder.where,
      resolvePropertyAndAutoJoin,
    );
  }

  public whereInIds(ids: any | any[]) {
    ids = castArray(ids);

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(this.queryBuilder.whereInIds, [ids]),
    );

    return this;
  }

  public whereIsolated(where: (query: OrionRepositoryQueryService<T>) => any) {
    return this.isolatedConditions(where, this.queryBuilder.where);
  }

  public whereRaw(
    whereExpression: string,
    whereParams: any = {},
    fieldsSelector?:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
  ) {
    return this.whereBaseRaw(
      whereExpression,
      whereParams,
      fieldsSelector,
      this.queryBuilder.where,
    );
  }

  private createSubQuery() {
    const queryBuilder: SelectQueryBuilder<T> = this.queryBuilder
      .createQueryBuilder()
      .subQuery()
      .from(this.entityMetadata.target, this.targetAlias);

    const query = new OrionRepositoryQueryService<T, T>(
      this.entityManager,
      this.entityMetadata,
      queryBuilder,
      null,
      queryBuilder.alias,
      OrionRepositoryQueryMode.SubQuery,
      this.relationHistory,
      this.selectHistory,
      this.propsMetadata,
    );

    return query;
  }

  private compileQueryParts(
    queryBuilder = this.queryBuilder.clone(),
    queryBuilderParts = this.queryBuilderParts,
    joinEagerRelations?: boolean,
  ): SelectQueryBuilder<T> {
    if (queryBuilderParts.length) {
      for (const queryPart of queryBuilderParts) {
        queryPart.partAction.call(queryBuilder, ...queryPart.partParams);
      }
    }

    if (
      isBoolean(joinEagerRelations)
        ? joinEagerRelations
        : this._autoJoinEagerRelations
    ) {
      this.joinEagerRelations(
        queryBuilder,
        queryBuilder.alias,
      );
    }

    return queryBuilder;
  }

  private escapeCommaSeparatedAliases(str: string) {
    const strings = str.split(',');
    const resolvedStrings = this.stringArrayEscapeNonSelectorArgs(strings);

    return resolvedStrings.join(',');
  }

  private flattenProperties<TR extends OrionRepositoryQueryPropsResult>(
    properties: OrionRepositoryQueryProps<T>,
  ) {
    const flattenProperties = ObjectService.flatten(properties, {
      removeArrayIndexes: true,
    });

    return flattenProperties as TR;
  }

  private flattenPropertiesAndResolveKeys<
    TR extends OrionRepositoryQueryPropsResult
  >(properties: OrionRepositoryQueryProps<T>, escapeAlias: boolean = false) {
    const flattenProperties = this.flattenProperties(properties);

    const resolvedProperties = transform(
      flattenProperties as any,
      (result, value, key) => {
        const resolvedProperty = this.resolvePropertyAndAutoJoin(
          key as any,
          undefined,
          escapeAlias,
        );
        result[resolvedProperty] = value;
      },
      {},
    );

    return resolvedProperties as TR;
  }

  private async getCountRawQuery(queryBuilder: SelectQueryBuilder<any>) {
    let rawQuery: string = queryBuilder.getQuery();
    rawQuery = `SELECT COUNT(*) as cnt FROM (${rawQuery}) t`;
    return this.entityManager.query(rawQuery).then(results => {
      if (results && results.length) {
        return +results[0].cnt;
      }
      return 0;
    });
  }

  private isExpressionContainsSelectorArgs(expression: string) {
    return /\[\d+\]/.test(expression);
  }

  private isolatedConditions(
    conditions: (query: OrionRepositoryQueryService<T>) => any,
    conditionAction: (...params: any[]) => SelectQueryBuilder<T>,
  ) {
    const query = this.createSubQuery();

    conditions(query);

    // Do not include joins in bracketed condition; perform those in the outer query.
    const whereConditionParts = this.queryBuilderPartsExtractWhereConditions(
      query.queryBuilderParts,
      query.queryBuilder,
    );

    // Perform joins in the outer query.
    const joinParts: Array<
      OrionRepositoryQueryBuilderPart<T>
    > = query.queryBuilderParts.filter(
      qp => whereConditionParts.indexOf(qp) < 0,
    );
    this.queryBuilderParts.push(...joinParts);

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(conditionAction, [
        new Brackets(qb => {
          this.compileQueryParts(qb as any, whereConditionParts, false);
        }),
      ]),
    );

    return this;
  }

  private isGroupByPartExists() {
    return (
      this.queryMode === OrionRepositoryQueryMode.Join ||
      (this.queryMode === OrionRepositoryQueryMode.Master &&
        findIndex(
          this.queryBuilderParts,
          queryBuilderPart =>
            // tslint:disable-next-line: triple-equals
            queryBuilderPart.partAction == this.queryBuilder.groupBy,
        ) > -1)
    );
  }

  private isOrderByPartExists() {
    return (
      this.queryMode === OrionRepositoryQueryMode.Join ||
      (this.queryMode === OrionRepositoryQueryMode.Master &&
        findIndex(
          this.queryBuilderParts,
          queryBuilderPart =>
            // tslint:disable-next-line: triple-equals
            queryBuilderPart.partAction == this.queryBuilder.orderBy,
        ) > -1)
    );
  }

  private isRelationAliasExists(alias: string) {
    return findIndex(this.relationHistory, { relationAlias: alias }) > -1;
  }

  private isRelationSystemAliasExists(alias: string) {
    return findIndex(this.relationHistory, { systemAlias: alias }) > -1;
  }

  private isSelectOnAliasPerformed(targetAlias: string) {
    return findIndex(this.selectHistory, { targetAlias }) > -1;
  }

  private isSelectPartExists() {
    return (
      this.queryMode === OrionRepositoryQueryMode.Join ||
      (this.queryMode === OrionRepositoryQueryMode.Master &&
        findIndex(
          this.queryBuilderParts,
          queryBuilderPart =>
            // tslint:disable-next-line: triple-equals
            queryBuilderPart.partAction == this.queryBuilder.select,
        ) > -1)
    );
  }

  private joinBase<JR extends Object>(
    propertySelector: ((obj: P) => JR) | string,
    joinQueryBuilderFn: (...params: any[]) => SelectQueryBuilder<T>,
    joinAlias?: string,
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    const [propertyName] = this.resolvePropertySelector(propertySelector);

    const relationAlias = this.resolvePropertyAndAutoJoin(
      propertyName,
      joinQueryBuilderFn,
      false,
      joinAlias,
      joinFn as any,
    );

    // const relationHistory = find(this.relationHistory, { relationAlias });
    // const relationMetadata = relationHistory.relationMetadata;

    // if (joinFn) {
    //   const targetEntityMetadata = relationMetadata.inverseEntityMetadata;
    //   const queryBuilder = targetEntityMetadata.connection.createQueryBuilder();
    //   queryBuilder.from(targetEntityMetadata.target, relationAlias);

    //   const linqRepositoryQuery = new OrionRepositoryQueryService<JR>(
    //     this.entityManager,
    //     targetEntityMetadata,
    //     queryBuilder,
    //     null,
    //     relationAlias,
    //     OrionRepositoryQueryMode.Join,
    //     this.relationHistory,
    //     this.selectHistory,
    //     this.propsMetadata,
    //   );

    //   joinFn(linqRepositoryQuery);

    //   this.queryBuilderParts.push(
    //     ...(linqRepositoryQuery.queryBuilderParts as any),
    //   );
    // }

    return this;
  }

  private joinEagerRelations(
    queryBuilder: SelectQueryBuilder<any>,
    alias: string = this.targetAlias,
    entityMetadata?: EntityMetadata,
  ) {
    if (!entityMetadata) {
      entityMetadata = queryBuilder.expressionMap.mainAlias.metadata;
    }
    entityMetadata.eagerRelations.forEach(relation => {
      const relationAlias =
        alias + '_' + relation.propertyPath.replace('.', '_');

      if (!this.isRelationSystemAliasExists(relationAlias)) {
        if (this.isSelectOnAliasPerformed(relationAlias)) {
          queryBuilder.innerJoin(
            alias + '.' + relation.propertyPath,
            relationAlias,
          );
        } else {
          queryBuilder.leftJoinAndSelect(
            alias + '.' + relation.propertyPath,
            relationAlias,
          );
        }
      }

      this.joinEagerRelations(
        queryBuilder,
        relationAlias,
        relation.inverseEntityMetadata,
      );
    });
  }

  private joinOrIncludePropertyUsingAlias(
    propertyName: string,
    entityMetadata: EntityMetadata = this.entityMetadata,
    fromAlias: string,
    queryAction: (...params: any[]) => SelectQueryBuilder<T>,
    relationAlias?: string,
    relationFn?: (q: OrionRepositoryQueryService<any>) => void,
  ) {
    const systemAlias = `${fromAlias}_${propertyName}`;
    if (!relationAlias) {
      relationAlias = systemAlias;
    }
    const relationMetadata = entityMetadata.findRelationWithPropertyPath(
      propertyName,
    );

    // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
    // Only execute the include if it has not been previously executed.
    if (
      !this.isRelationAliasExists(relationAlias) &&
      !this.isRelationSystemAliasExists(systemAlias)
    ) {
      this.relationHistory.push({
        systemAlias,
        relationAlias,
        relationMetadata,
      });

      const queryPartProperty: string = `${fromAlias}.${propertyName}`;
      const queryPartParams: any = [queryPartProperty, relationAlias];

      if (relationFn) {
        const targetEntityMetadata = relationMetadata.inverseEntityMetadata;
        const queryBuilder = targetEntityMetadata.connection.createQueryBuilder();
        queryBuilder.from(targetEntityMetadata.target, relationAlias);

        const orionRepositoryQuery = new OrionRepositoryQueryService<any>(
          this.entityManager,
          targetEntityMetadata,
          queryBuilder,
          null,
          relationAlias,
          OrionRepositoryQueryMode.Join,
          this.relationHistory,
          this.selectHistory,
          this.propsMetadata,
        );

        relationFn(orionRepositoryQuery);

        const relationQueryBuilderParts = orionRepositoryQuery.queryBuilderParts;
        if (
          this.queryBuilderPartsHasOnlyWhere(
            relationQueryBuilderParts,
            queryBuilder,
          )
        ) {
          const compiledQueryBuilder = this.compileQueryParts(
            queryBuilder,
            relationQueryBuilderParts,
          );

          // 2019-07-19 15:11:47 Labib *** current whereString result is enough for now, i don't know if it is already resolve parameters or not
          // 2019-07-19 15:12:00 Labib *** orion repository is currently not giving parameters, it is always passed directly
          const whereString = (compiledQueryBuilder as any).createWhereExpressionString();

          // compiledQueryBuilder.setParameters(
          //   compiledQueryBuilder.getParameters(),
          // );
          // const finalWhereString = this.entityManager.connection.driver.escapeQueryWithParameters(
          //   whereString,
          //   compiledQueryBuilder.getParameters(),
          //   compiledQueryBuilder.expressionMap.nativeParameters,
          // );
          // 2019-07-19 15:11:42 Labib *** the result of finalWhereString is resolved where string but returned as array, inspection needed

          queryPartParams.push(whereString);
        } else {
          // 2019-07-19 15:13:23 Labib *** select, limit, etc other than where expression is not supported yet
          // TODO: replace relationQueryBuilderParts[0] with query builder
        }
      }

      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(queryAction, queryPartParams),
      );
    } else if (this.isRelationSystemAliasExists(systemAlias)) {
      relationAlias = this.resolveRelationAlias(systemAlias);
    }

    return {
      relationAlias,
      relationMetadata,
    };
  }

  private joinRawBase(
    fromQueryOrEntity: OrionRepositoryQueryService<any> | any,
    joinAlias: string,
    condition?: string,
    parameters?: ObjectLiteral,
    joinQueryBuilderFn: (...params: any[]) => SelectQueryBuilder<T> = this
      .queryBuilder.innerJoin,
  ) {
    let targetQueryOrEntity;
    if (fromQueryOrEntity instanceof OrionRepositoryQueryService) {
      targetQueryOrEntity = () => fromQueryOrEntity.compileQueryParts();
    } else {
      targetQueryOrEntity = fromQueryOrEntity;
    }

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(joinQueryBuilderFn, [
        targetQueryOrEntity,
        joinAlias,
        condition,
        parameters,
      ]),
    );

    return this;
  }

  private queryBuilderPartsExtractWhereConditions(
    queryBuilderParts = this.queryBuilderParts,
    queryBuilder: SelectQueryBuilder<any> = this.queryBuilder,
  ) {
    const conditionParts: Array<
      OrionRepositoryQueryBuilderPart<T>
    > = queryBuilderParts.filter(
      qp =>
        // tslint:disable-next-line: triple-equals
        qp.partAction == queryBuilder.where ||
        // tslint:disable-next-line: triple-equals
        qp.partAction == queryBuilder.andWhere ||
        // tslint:disable-next-line: triple-equals
        qp.partAction == queryBuilder.orWhere,
    );

    return conditionParts;
  }

  private queryBuilderPartsHasOnlyWhere(
    queryBuilderParts = this.queryBuilderParts,
    queryBuilder: SelectQueryBuilder<any> = this.queryBuilder,
  ) {
    const whereConditions = this.queryBuilderPartsExtractWhereConditions(
      queryBuilderParts,
      queryBuilder,
    );
    return (
      queryBuilderParts.filter(qp => whereConditions.indexOf(qp) < 0).length ===
      0
    );
  }

  private replaceRawExpressionArrayArgs(rawExpression: string, args: any[]) {
    const rawExpressionFieldsMatches = rawExpression.match(/\[\d+\]/gm);

    if (rawExpressionFieldsMatches && rawExpressionFieldsMatches.length) {
      for (const rawExpressionField of rawExpressionFieldsMatches) {
        const index = toNumber(rawExpressionField.match(/\d+/));
        rawExpression = rawExpression.replace(rawExpressionField, args[index]);
      }
    }

    return rawExpression;
  }

  private resolvePropertyAndAutoJoin(
    property: string,
    joinQueryBuilderFn: (...params: any[]) => SelectQueryBuilder<T> = this
      .queryBuilder.innerJoin,
    escapeAlias: boolean = false,
    lastJoinAlias?: string,
    lastJoinFn?: (q: OrionRepositoryQueryService<any>) => void,
  ): string {
    const properties: string[] = property.split('.');
    let currentEntityMetadata: EntityMetadata = this.entityMetadata;

    let currentAlias = this.targetAlias;
    let resolvedPath: string = this.targetAlias;
    let propMetadata;

    for (const propIdx in properties) {
      const prop = properties[propIdx];
      const isLastProp = +propIdx === properties.length - 1;
      const relation = currentEntityMetadata.findRelationWithPropertyPath(prop);

      if (relation) {
        currentEntityMetadata = relation.inverseEntityMetadata;

        const joinResult = this.joinOrIncludePropertyUsingAlias(
          prop,
          relation.entityMetadata,
          currentAlias,
          joinQueryBuilderFn,
          isLastProp ? lastJoinAlias : undefined,
          isLastProp ? lastJoinFn : undefined,
        );

        resolvedPath = joinResult.relationAlias;
        propMetadata = relation;

        currentAlias = joinResult.relationAlias;
      } else {
        const embedded = currentEntityMetadata.findEmbeddedWithPropertyPath(
          prop,
        );

        if (embedded) {
          currentEntityMetadata = relation.inverseEntityMetadata;
          resolvedPath = `${resolvedPath}.${prop}`;
          propMetadata = embedded;
        } else {
          const columnMetadata = currentEntityMetadata.findColumnWithPropertyPath(
            prop,
          );
          resolvedPath = `${resolvedPath}.${columnMetadata.propertyPath}`;
          propMetadata = columnMetadata;
        }
      }

      this.propsMetadata[resolvedPath] = propMetadata;
    }

    if (escapeAlias) {
      resolvedPath = this.escapeCommaSeparatedAliases(resolvedPath);
      this.propsMetadata[resolvedPath] = propMetadata;
    }

    return resolvedPath;
  }

  private resolvePropertySelector(
    propertySelector:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
  ) {
    let propertyNames: string[] = [];

    if (isArray(propertySelector)) {
      propertyNames = propertySelector.map(prop => nameOfProp(prop));
    } else if (typeof propertySelector === 'string') {
      propertyNames = [propertySelector];
    } else if (propertySelector instanceof Function) {
      propertyNames = nameOfProps(propertySelector);
    }

    return castArray(propertyNames);
  }

  private resolvePropertySelectorAndAutoJoin(
    propertySelector:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
    escapeAlias: boolean = false,
  ) {
    const resolvedPropertyNames = [];

    if (propertySelector) {
      const propertyNames = this.resolvePropertySelector(propertySelector);
      for (let propertyName of propertyNames) {
        propertyName = this.resolvePropertyAndAutoJoin(
          propertyName,
          undefined,
          escapeAlias,
        );
        resolvedPropertyNames.push(propertyName);
      }
    }

    return resolvedPropertyNames;
  }

  private resolveRawExpressionFields(
    rawExpression: string,
    fieldsSelector?:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
    escapeAlias: boolean = false,
  ) {
    if (fieldsSelector) {
      const resolvedPropertyNames = this.resolvePropertySelectorAndAutoJoin(
        fieldsSelector,
        escapeAlias,
      );

      return this.replaceRawExpressionArrayArgs(
        rawExpression,
        resolvedPropertyNames,
      );
    }

    return rawExpression;
  }

  private resolveRelationAlias(alias: string) {
    const relationHistoryBySystemAlias = find(this.relationHistory, {
      systemAlias: alias,
    });
    if (
      relationHistoryBySystemAlias &&
      relationHistoryBySystemAlias.relationAlias
    ) {
      return relationHistoryBySystemAlias.relationAlias;
    }

    return alias;
  }

  private stringArrayEscapeNonSelectorArgs(strings: string[]) {
    strings = castArray(strings);

    const resolvedStrings = [];
    for (const str of strings) {
      resolvedStrings.push(this.stringEscapeNonSelectorArgs(str));
    }

    return resolvedStrings;
  }

  private stringEscapeNonSelectorArgs(str: string) {
    str = str.trim();
    str = str
      .split('.')
      .map(s => {
        if (!this.isExpressionContainsSelectorArgs(s) && !/^"|\(|\s/.test(s)) {
          return this.queryBuilder.escape(s);
        }
        return s;
      })
      .join('.');

    return str;
  }

  private whereBase(
    propertySelector: ((obj: P) => OrionRepositoryQueryComparableProp) | string,
    whereFn: (queryCondition: OrionRepositoryQueryConditionService<T>) => void,
    whereQueryBuilderFn: (...params: any[]) => SelectQueryBuilder<T>,
    resolvePropertyAndAutoJoin: boolean = true,
  ) {
    const [whereProperties] = this.resolvePropertySelector(propertySelector);

    let targetProperty: string;
    if (resolvePropertyAndAutoJoin) {
      // If accessing multiple properties, join relationships using an INNER JOIN.
      targetProperty = this.resolvePropertyAndAutoJoin(
        whereProperties,
        this.queryBuilder.innerJoin,
      );
    } else {
      targetProperty = whereProperties;
    }

    const linqRepositoryQueryCondition = new OrionRepositoryQueryConditionService(
      targetProperty,
      this.queryBuilder,
      this.queryBuilderParts,
      whereQueryBuilderFn,
    );

    whereFn(linqRepositoryQueryCondition);

    return this;
  }

  private whereBaseRaw(
    whereExpression: string,
    whereParams: any = {},
    fieldsSelector?:
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      | string
      | string[],
    whereQueryBuilderFn: (...params: any[]) => SelectQueryBuilder<T> = this
      .queryBuilder.andWhere,
  ) {
    whereExpression = this.resolveRawExpressionFields(
      whereExpression,
      fieldsSelector,
      true,
    );

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(whereQueryBuilderFn, [
        whereExpression,
        whereParams,
      ]),
    );

    return this;
  }
}
