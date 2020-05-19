import * as _ from 'lodash';
import * as sql from 'mssql';

class MsSqlService {
  async getConnectionPool(dbConfig) {
    return new sql.ConnectionPool(dbConfig).connect().then((pool) => {
      return pool;
    });
  }
}

export const mssqlService = new MsSqlService();
