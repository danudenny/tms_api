import { castArray, find, findIndex, forEach, isArray, isBoolean, isFunction, isString, toNumber, transform } from 'lodash';
import { from } from 'rxjs';
import { Brackets, EntityMetadata, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
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

  public constructor(
    public readonly entityMetadata: EntityMetadata,
    public queryBuilder: SelectQueryBuilder<T>,
    public execAction: () => Promise<R>,
    public targetAlias: string,
    private readonly queryMode: OrionRepositoryQueryMode = OrionRepositoryQueryMode.Master,
    private readonly relationHistory: Array<{
      relationAlias: string;
      relationMetadata: RelationMetadata;
    }> = [],
    private readonly selectHistory: Array<{
      properties: string[];
      targetAlias: string;
    }> = [],
  ) {
    this.relationHistory.push(
      ...this.queryBuilder.expressionMap.joinAttributes.map(joinAttribute => ({
        relationAlias: joinAttribute.alias.name,
        relationMetadata: joinAttribute.relation,
      })),
    );

    if (
      !this.execAction ||
      // tslint:disable-next-line: triple-equals
      this.execAction == (this.queryBuilder.getRawMany as any) ||
      // tslint:disable-next-line: triple-equals
      this.execAction == this.queryBuilder.getRawOne
    ) {
      this._autoJoinEagerRelations = false;
    }
  }

  public andWhere(
    propertySelector: ((obj: P) => OrionRepositoryQueryComparableProp) | string,
    whereFn: (queryCondition: OrionRepositoryQueryConditionService<T>) => void,
  ) {
    return this.whereBase(
      propertySelector,
      whereFn,
      this.queryBuilder.andWhere,
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

    return compiledQueryBuilder.getCount();
  }

  public countWithoutTakeAndSkip(): Promise<number> {
    const queryBuilderParts = this.queryBuilderParts
      .slice()
      .filter(
        part =>
          // tslint:disable-next-line: triple-equals
          part.partAction != this.queryBuilder.take &&
          // tslint:disable-next-line: triple-equals
          part.partAction != this.queryBuilder.skip,
      );

    const compiledQueryBuilder = this.compileQueryParts(
      this.queryBuilder.clone(),
      queryBuilderParts,
    );

    return compiledQueryBuilder.getCount();
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
    return this.stringEscapeNonSelectorArgs(str);
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
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(propertySelector, this.queryBuilder.innerJoin, joinFn);
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
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(
      propertySelector,
      this.queryBuilder.innerJoinAndSelect,
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
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(propertySelector, this.queryBuilder.leftJoin, joinFn);
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
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    return this.joinBase(
      propertySelector,
      this.queryBuilder.leftJoinAndSelect,
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
  ) {
    return this.whereBase(propertySelector, whereFn, this.queryBuilder.orWhere);
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

    if (!this.isSelectPartExists()) {
      this.queryBuilderParts.unshift(
        new OrionRepositoryQueryBuilderPart(this.queryBuilder.select, [
          targetSelectProperties,
        ]),
      );
    } else {
      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(this.queryBuilder.addSelect, [
          targetSelectProperties,
        ]),
      );
    }

    return this;
  }

  public selectRaw(
    ...args: Array<
      | string
      | string[]
      | ((
          obj: P,
        ) => OrionRepositoryQueryPropType | OrionRepositoryQueryPropType[])
      // tslint:disable-next-line: trailing-comma
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
        `Fields selector cannot be more than inside selectRaw method`,
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
        new OrionRepositoryQueryBuilderPart(this.queryBuilder.skip, [skip]),
      );
    }

    return this;
  }

  public take(limit: number) {
    if (limit > 0) {
      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(this.queryBuilder.take, [limit]),
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
  ) {
    return this.whereBase(propertySelector, whereFn, this.queryBuilder.where);
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
      this.entityMetadata,
      queryBuilder,
      null,
      queryBuilder.alias,
      OrionRepositoryQueryMode.SubQuery,
      this.relationHistory,
      this.selectHistory,
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
        this.entityMetadata,
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
  >(properties: OrionRepositoryQueryProps<T>) {
    const flattenProperties = this.flattenProperties(properties);

    const resolvedProperties = transform(
      flattenProperties as any,
      (result, value, key) => {
        const resolvedProperty = this.resolvePropertyAndAutoJoin(key as any);
        result[resolvedProperty] = value;
      },
      {},
    );

    return resolvedProperties as TR;
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
    const conditionParts: Array<
      OrionRepositoryQueryBuilderPart<T>
    > = query.queryBuilderParts.filter(
      qp =>
        // tslint:disable-next-line: triple-equals
        qp.partAction == query.queryBuilder.where ||
        // tslint:disable-next-line: triple-equals
        qp.partAction == query.queryBuilder.andWhere ||
        // tslint:disable-next-line: triple-equals
        qp.partAction == query.queryBuilder.orWhere,
    );

    // Perform joins in the outer query.
    const joinParts: Array<
      OrionRepositoryQueryBuilderPart<T>
    > = query.queryBuilderParts.filter(qp => conditionParts.indexOf(qp) < 0);
    this.queryBuilderParts.push(...joinParts);

    this.queryBuilderParts.push(
      new OrionRepositoryQueryBuilderPart(conditionAction, [
        new Brackets(qb => {
          this.compileQueryParts(qb as any, conditionParts, false);
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
    joinFn?: (q: OrionRepositoryQueryService<JR>) => void,
  ): OrionRepositoryQueryService<T, R, P> {
    const [propertyName] = this.resolvePropertySelector(propertySelector);
    const relationAlias = this.resolvePropertyAndAutoJoin(
      propertyName,
      joinQueryBuilderFn,
    );
    const { relationMetadata } = find(this.relationHistory, { relationAlias });

    if (joinFn) {
      const queryBuilder = relationMetadata.inverseEntityMetadata.connection.createQueryBuilder();

      const linqRepositoryQuery = new OrionRepositoryQueryService<JR>(
        relationMetadata.inverseEntityMetadata,
        queryBuilder,
        null,
        relationAlias,
        OrionRepositoryQueryMode.Join,
        this.relationHistory,
        this.selectHistory,
      );

      joinFn(linqRepositoryQuery);

      this.queryBuilderParts.push(
        ...(linqRepositoryQuery.queryBuilderParts as any),
      );
    }

    return this;
  }

  private joinEagerRelations(
    queryBuilder: SelectQueryBuilder<any>,
    alias: string = this.targetAlias,
    entityMetadata: EntityMetadata = this.entityMetadata,
  ) {
    entityMetadata.eagerRelations.forEach(relation => {
      const relationAlias =
        alias + '_' + relation.propertyPath.replace('.', '_');

      if (!this.isRelationAliasExists(relationAlias)) {
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
  ) {
    const relationAlias: string = `${fromAlias}_${propertyName}`;
    const relationMetadata = entityMetadata.findRelationWithPropertyPath(
      propertyName,
    );

    // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
    // Only execute the include if it has not been previously executed.
    if (!this.isRelationAliasExists(relationAlias)) {
      this.relationHistory.push({ relationAlias, relationMetadata });

      if (
        // tslint:disable-next-line: triple-equals
        (queryAction == this.queryBuilder.leftJoinAndSelect ||
          // tslint:disable-next-line: triple-equals
          queryAction == this.queryBuilder.innerJoinAndSelect) &&
        this.isSelectOnAliasPerformed(relationAlias)
      ) {
        // TODO: add select for relationAlias if previously joinned by not selected
      }
      const queryProperty: string = `${fromAlias}.${propertyName}`;
      this.queryBuilderParts.push(
        new OrionRepositoryQueryBuilderPart(queryAction, [
          queryProperty,
          relationAlias,
        ]),
      );
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
  ): string {
    const properties: string[] = property.split('.');
    let currentEntityMetadata: EntityMetadata = this.entityMetadata;

    let currentAlias = this.targetAlias;
    let resolvedPath: string = this.targetAlias;

    for (const prop of properties) {
      const relation = currentEntityMetadata.findRelationWithPropertyPath(prop);

      if (relation) {
        currentEntityMetadata = relation.inverseEntityMetadata;

        const joinResult = this.joinOrIncludePropertyUsingAlias(
          prop,
          relation.entityMetadata,
          currentAlias,
          joinQueryBuilderFn,
        );

        resolvedPath = joinResult.relationAlias;

        currentAlias = joinResult.relationAlias;
      } else {
        const embedded = currentEntityMetadata.findEmbeddedWithPropertyPath(
          prop,
        );

        if (embedded) {
          currentEntityMetadata = relation.inverseEntityMetadata;
          resolvedPath = `${resolvedPath}.${prop}`;
        } else {
          resolvedPath = `${resolvedPath}.${prop}`;
        }
      }
    }

    resolvedPath = this.escapeCommaSeparatedAliases(resolvedPath);

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
  ) {
    const resolvedPropertyNames = [];

    if (propertySelector) {
      const propertyNames = this.resolvePropertySelector(propertySelector);
      for (const propertyName of propertyNames) {
        resolvedPropertyNames.push(
          this.resolvePropertyAndAutoJoin(propertyName),
        );
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
  ) {
    if (fieldsSelector) {
      const resolvedPropertyNames = this.resolvePropertySelectorAndAutoJoin(
        fieldsSelector,
      );

      return this.replaceRawExpressionArrayArgs(
        rawExpression,
        resolvedPropertyNames,
      );
    }

    return rawExpression;
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
    whereQueryBuilderFn?: (...params: any[]) => SelectQueryBuilder<T>,
  ) {
    const [whereProperties] = this.resolvePropertySelector(propertySelector);

    // If accessing multiple properties, join relationships using an INNER JOIN.
    const targetProperty = this.resolvePropertyAndAutoJoin(whereProperties);

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
