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

  public static query(sql: string, parameters?: any[]) {
    return this.manager.query(sql, parameters);
  }

  public static queryWithParams(sql: string, parameters: Object) {
    const [q, params] = this.connection.driver.escapeQueryWithParameters(sql, parameters, {});
    return this.manager.query(q, params);
  }

  public static async queryCount(sql: string, sqlParamters?: any[]) {
    const sqlModified = `SELECT COUNT(1) AS total FROM (${sql}) as t`;
    const results = await RawQueryService.query(sqlModified, sqlParamters);
    return results && results.length ? + results[0].total : 0;
  }

  public static async queryWithPaginate(
    sql: string,
    page: number = 1,
    limit: number = 100,
    total: number = 0,
    countField: string = '1',
    distinct: boolean = false,
  ) {
    let totalData = total;
    //  calculate total data
    if (total == 0) {
      const sqlCount = `SELECT COUNT(${
        distinct ? 'DISTINCT ' : ''
      }${countField}) AS total FROM (${sql}) as t`;

      const countData = await this.manager.query(sqlCount);
      totalData = countData && countData.length ? + countData[0].total : 0;
    }

    const offset = (page - 1) * limit;
    const data = await this.manager.query(
      sql + ` LIMIT ${limit} OFFSET ${offset}`,
    );
    const paging = MetaService.set(page, limit, totalData);
    return [ data,  paging ];
  }

  public static exec(sql: string, parameters: Object = {}) {
    const [sqlQuery, sqlQueryNativeParameters] = this.escapeQueryWithParameters(sql, parameters);
    return this.manager.query(sqlQuery, sqlQueryNativeParameters);
  }
}
