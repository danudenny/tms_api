import { getManager } from 'typeorm';
import { MetaService } from './meta.service';

export class RawQueryService {

  // TODO: fix config get connection manager??
  // init connect

  static get manager() {
    return getManager();
  }

  static get connection() {
    return RawQueryService.manager.connection;
  }

  public static escapeQueryWithParameters(sql: string, parameters: Object) {
    return this.connection.driver.escapeQueryWithParameters(sql, parameters, {});
  }

  public static async query(sql: string, parameters?: any[], dbMode?: 'master' | 'slave') {
    let queryRunner;

    if (dbMode) {
      queryRunner = this.manager.connection.createQueryRunner(dbMode);
    } else {
      queryRunner = this.manager;
    }

    try {
      return queryRunner.query(sql, parameters);
    } finally {
      if (dbMode && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public static async queryWithParams(sql: string, parameters: Object, dbMode: 'master' | 'slave' = 'slave') {
    let queryRunner;
    console.log('########################## MODE : ', dbMode);
    if (dbMode) {
      queryRunner = this.manager.connection.createQueryRunner(dbMode);
    } else {
      queryRunner = this.manager;
    }

    try {
      const [q, params] = this.connection.driver.escapeQueryWithParameters(sql, parameters, {});
      return queryRunner.query(q, params);
    } finally {
      if (dbMode && !queryRunner.isReleased) {
        await queryRunner.release();
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
      const results = await RawQueryService.query(sqlModified, sqlParamters, dbMode);
      return results && results.length ? +results[0].total : 0;
    } finally {
      if (dbMode && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

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
