import { snakeCase } from 'lodash';
import {
  DeepPartial,
  EntityManager,
  EntityMetadata,
  ObjectID,
  QueryRunner,
  SaveOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { getEntityManagerOrTransactionManager } from '../external/typeorm-transactional-cls-hooked';
import { OrionRepositoryOptions, OrionRepositoryQueryMode } from '../models/orion-repository.model';
import { OrionRepositoryQueryService } from './orion-repository-query.service';

export class OrionRepositoryService<T> {
  private readonly connectionName: string;

  public get defaultEntityAlias(): string {
    return snakeCase(this.entityMetadata.name);
  }

  public get entityMetadata(): EntityMetadata {
    return this.manager.connection.getMetadata(this.entityType);
  }

  public get manager(): EntityManager {
    return this.options.manager || getEntityManagerOrTransactionManager(this.connectionName);
  }

  public constructor(
    public readonly entityType: Constructor<T>,
    public readonly entityAlias?: string,
    private readonly options: OrionRepositoryOptions = {} as any,
  ) {
    let connectionName: string = 'default';

    if (this.options.connectionName) {
      connectionName = this.options.connectionName;
    }

    this.entityAlias = entityAlias || this.defaultEntityAlias;
    this.connectionName = connectionName;
  }

  public create(entityLike: DeepPartial<T>) {
    return this.manager.create(this.entityType, entityLike);
  }

  public createMultiple(entityLikeArray: Array<DeepPartial<T>>) {
    return this.manager.create(this.entityType, entityLikeArray);
  }

  public createQueryBuilder(queryRunner?: QueryRunner): SelectQueryBuilder<T> {
    return this.manager.createQueryBuilder(this.entityType, this.entityAlias, queryRunner);
  }

  public createSelectQueryRunner(dbMode: 'master' | 'slave' = 'slave'): QueryRunner {
    return this.manager.connection.createQueryRunner(dbMode);
  }

  public deleteById(id: string | number | Date | ObjectID) {
    return this.manager.delete(this.entityType, id);
  }

  public findAll(dbMode?: 'master' | 'slave') {
    let queryRunner: QueryRunner;
    if (dbMode) {
      queryRunner = this.createSelectQueryRunner(dbMode);
    }

    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(queryRunner);

    const query = new OrionRepositoryQueryService<T, T[]>(
      this.manager,
      this.entityMetadata,
      queryRunner,
      queryBuilder,
      queryBuilder.getMany,
      queryBuilder.alias,
    );

    return query;
  }

  public findAllRaw(dbMode?: 'master' | 'slave') {
    let queryRunner: QueryRunner;
    if (dbMode) {
      queryRunner = this.createSelectQueryRunner(dbMode);
    }

    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(queryRunner);

    const query = new OrionRepositoryQueryService<T, any>(
      this.manager,
      this.entityMetadata,
      queryRunner,
      queryBuilder,
      queryBuilder.getRawMany,
      queryBuilder.alias,
    );

    return query;
  }

  public findOne(dbMode?: 'master' | 'slave') {
    let queryRunner: QueryRunner;
    if (dbMode) {
      queryRunner = this.createSelectQueryRunner(dbMode);
    }

    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(queryRunner);

    const query = new OrionRepositoryQueryService<T, T>(
      this.manager,
      this.entityMetadata,
      queryRunner,
      queryBuilder,
      queryBuilder.getOne,
      queryBuilder.alias,
    );

    return query;
  }

  public findOneRaw(dbMode?: 'master' | 'slave') {
    let queryRunner: QueryRunner;
    if (dbMode) {
      queryRunner = this.createSelectQueryRunner(dbMode);
    }

    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(queryRunner);

    const query = new OrionRepositoryQueryService<T, any>(
      this.manager,
      this.entityMetadata,
      queryRunner,
      queryBuilder,
      queryBuilder.getRawOne,
      queryBuilder.alias,
    );

    return query;
  }

  public loadById(id: string | number | Date | ObjectID, dbMode?: 'master' | 'slave') {
    let queryRunner: QueryRunner;
    if (dbMode) {
      queryRunner = this.createSelectQueryRunner(dbMode);
    }

    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(queryRunner);

    const query = new OrionRepositoryQueryService<T, T>(
      this.manager,
      this.entityMetadata,
      queryRunner,
      queryBuilder,
      queryBuilder.getOne,
      queryBuilder.alias,
    );

    query.andWhereInIds(id);

    return query;
  }

  public loadByMultipleId(ids: Array<string | number | Date | ObjectID>, dbMode?: 'master' | 'slave') {
    let queryRunner: QueryRunner;
    if (dbMode) {
      queryRunner = this.createSelectQueryRunner(dbMode);
    }

    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(queryRunner);

    const query = new OrionRepositoryQueryService<T, T[]>(
      this.manager,
      this.entityMetadata,
      queryRunner,
      queryBuilder,
      queryBuilder.getMany,
      queryBuilder.alias,
    );

    query.andWhereInIds(ids);

    return query;
  }

  public save(entity: T, options?: SaveOptions): Promise<T> {
    return this.manager.save(this.entityType, entity, options);
  }

  public saveMultiple(entities: T[], options?: SaveOptions): Promise<T[]> {
    return this.manager.save(entities, options);
  }

  public subQuery() {
    const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder()
      .subQuery()
      .from(this.entityType, this.entityAlias);

    const query = new OrionRepositoryQueryService<T, T>(
      this.manager,
      this.entityMetadata,
      (queryBuilder as any).queryRunner,
      queryBuilder,
      null,
      queryBuilder.alias,
      OrionRepositoryQueryMode.SubQuery,
    );

    return query;
  }

  public updateById(id: string | number | Date | ObjectID, partialEntity: QueryDeepPartialEntity<T>) {
    return this.manager.update(this.entityType, id, partialEntity);
  }
}
