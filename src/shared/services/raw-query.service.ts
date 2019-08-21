import { getManager } from 'typeorm';

export class RawQueryService {

  // init connect
  static manager = getManager();
  static connection = RawQueryService.manager.connection;

  public static escapeQueryWithParameters(sql: string, parameters: Object) {
    return this.connection.driver.escapeQueryWithParameters(sql, parameters, {});
  }

  public static query(sql: string, parameters?: any[]) {
    return this.manager.query(sql, parameters);
  }

  public static exec(sql: string, parameters: Object = {}) {
    const [sqlQuery, sqlQueryNativeParameters] = this.escapeQueryWithParameters(sql, parameters);
    return this.manager.query(sqlQuery, sqlQueryNativeParameters);
  }
}
