import * as _ from 'lodash';
import { mssqlService } from '../../config/database/mssql.service';

export abstract class DatabaseConfig {
  private static podDbConnectionString = {
    user: 'spartan',
    password: '5pArtAaAn116688_6969_',
    server: 'bosicepat.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com', // You can use 'localhost\\instance' to connect to named instance
    database: 'POD',
    options: {
      encrypt: true, // Use this if you're on Windows Azure
    },
    connectionTimeout: 12000000, // 2 minutes,
    requestTimeout: 12000000, // 2 minutes
  };

  public static getPodDbConfig(config) {
    return config
      ? _.merge({}, this.podDbConnectionString, config)
      : _.merge({}, this.podDbConnectionString);
  }

  public static async getPodDbConn() {
    const conn = await mssqlService.getConnectionPool(
      this.getPodDbConfig({
        connectionTimeout: 18000000,
        requestTimeout: 18000000,
      }),
    );

    return conn;
  }
}
