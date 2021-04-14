import { getManager } from 'typeorm';
import { MetaService } from './meta.service';
import { BadRequestException } from '@nestjs/common';

export class RawQueryService {

  static get manager() {
    return getManager();
  }

  static get connection() {
    return RawQueryService.manager.connection;
  }

  public static escapeQueryWithParameters(sql: string, parameters: Object) {
    return this.connection.driver.escapeQueryWithParameters(sql, parameters, {});
  }

  public static async query(sql: string, parameters?: any[], slaveMode: boolean = true) {
    let queryRunner;

    try {
      if (slaveMode) {
        queryRunner = this.manager.connection.createQueryRunner('slave');
        if (queryRunner && queryRunner.isReleased) {
          throw new BadRequestException(
            'Database connection provided by a query runner was already released',
          );
        }
        return await queryRunner.query(sql, parameters);  // await is needed here because we are using finally
      } else {
        return await this.manager.query(sql, parameters);
      }
    } finally {
      if (queryRunner) {
        await queryRunner.release();
        console.log('isReleased Slave : ', queryRunner.isReleased);
      }
    }
  }

  public static async queryWithParams(sql: string, parameters: Object, slaveMode: boolean = true) {
    let queryRunner;
    try {
      const [q, params] = this.connection.driver.escapeQueryWithParameters(sql, parameters, {});

      if (slaveMode) {
        queryRunner = this.manager.connection.createQueryRunner('slave');
        if (queryRunner && queryRunner.isReleased) {
          throw new BadRequestException(
            'Database connection provided by a query runner was already released',
          );
        }
        return await queryRunner.query(q, params);  // await is needed here because we are using finally
      } else {
        return await this.manager.query(q, params);
      }
    } finally {
      if (queryRunner) {
        await queryRunner.release();
        console.log('isReleased Slave : ', queryRunner.isReleased);
      }
    }
  }

  public static async queryCount(sql: string, sqlParamters?: any[], dbMode?: 'master' | 'slave') {
    let queryRunner;

    if (dbMode) {
      queryRunner = this.manager.connection.createQueryRunner(dbMode);
    } else {
      queryRunner = this.manager;
    }

    try {
      const sqlModified = `SELECT COUNT(1) AS total FROM (${sql}) as t`;
      const results = await RawQueryService.queryWithParams(sqlModified, sqlParamters);
      return results && results.length ? +results[0].total : 0;
    } finally {
      if (dbMode && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  // not used now
  public static async queryWithPaginate(
    sql: string,
    page: number = 1,
    limit: number = 100,
    total: number = 0,
    countField: string = '1',
    distinct: boolean = false,
    dbMode?: 'master' | 'slave',
  ) {
    let queryRunner;

    if (dbMode) {
      queryRunner = this.manager.connection.createQueryRunner(dbMode);
    } else {
      queryRunner = this.manager;
    }

    try {
      let totalData = total;
      //  calculate total data
      if (total == 0) {
        const sqlCount = `SELECT COUNT(${
          distinct ? 'DISTINCT ' : ''
        }${countField}) AS total FROM (${sql}) as t`;

        const countData = await queryRunner.query(sqlCount);
        totalData = countData && countData.length ? +countData[0].total : 0;
      }

      const offset = (page - 1) * limit;
      const data = await queryRunner.query(
        sql + ` LIMIT ${limit} OFFSET ${offset}`,
      );
      const paging = MetaService.set(page, limit, totalData);
      return [data, paging];
    } finally {
      if (dbMode && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public static async exec(sql: string, parameters: Object = {}, dbMode?: 'master' | 'slave') {
    let queryRunner;

    if (dbMode) {
      queryRunner = this.manager.connection.createQueryRunner(dbMode);
    } else {
      queryRunner = this.manager;
    }

    try {
      const [sqlQuery, sqlQueryNativeParameters] = this.escapeQueryWithParameters(sql, parameters);
      return queryRunner.query(sqlQuery, sqlQueryNativeParameters);
    } finally {
      if (dbMode && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
