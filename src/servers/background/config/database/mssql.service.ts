import * as _ from 'lodash';
import * as sql from 'mssql';

class MsSqlService {
  async getConnectionPool(dbConfig) {
    const pool = new sql.ConnectionPool(dbConfig).connect();
    return pool;
  }
}

export const mssqlService = new MsSqlService();
