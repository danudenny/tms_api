import * as _ from 'lodash';
import { Pool } from 'pg';
import { mssqlService } from '../../config/database/mssql.service';
import * as mysql from 'mysql';
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

export abstract class DatabaseConfig {

  private static masterDataDbPool: Pool;

  private static podDbConnectionString = {
    user: 'spartan',
    password: '5pArtAaAn116688_6969_',
    server: 'bosicepat.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com', // You can use 'localhost\\instance' to connect to named instance
    database: 'POD',
    options: {
      encrypt: true, // Use this if you're on Windows Azure
    },
    stream: true,
    connectionTimeout: 12000000, // 2 minutes,
    requestTimeout: 12000000, // 2 minutes
  };

  private static sicepatMonggoConnectionString: string = 'mongodb+srv://sicepatmongo:5icepaTmong0888@sicepat-tracking-cluster-nrgvr.mongodb.net/test?retryWrites=true&w=majority';
  private static sicepatMonggoClient: any;
  public static async getSicepatMonggoClient() {
    if (!this.sicepatMonggoClient) {
      try {
        const client = await MongoClient.connect(this.sicepatMonggoConnectionString, { useNewUrlParser: true });
        this.sicepatMonggoClient = client;
      } catch (error) {
        console.log(error);
        throw error;
      }
    }

    return this.sicepatMonggoClient;
  }

  public static async getSicepatMonggoDb() {
    const client = await this.getSicepatMonggoClient();
    return client.db('sicepat');
  }

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

  private static mysqlDbConnectionString = {
    user: 'rudydarw_damar',
    password: 'Rudybosnyasicepat168168',
    host: 'sicepatrds-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com',
    database: 'rudydarw_sicepat',
    connectionTimeout: 12000000, // 2 minutes,
    requestTimeout: 12000000,
  };

  public static async getMySqlDbConn() {
    const conn = mysql.createConnection(this.mysqlDbConnectionString);

    conn.connect(function(err) {
      if (err) { throw err; }
      console.log('Connected to Mysql');
    });

    return conn;
  }

  public static getMasterDataDbPool() {
    if (!this.masterDataDbPool) {
      this.masterDataDbPool = new Pool({
        host: 'sicepat-tms-masterdata-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com',
        port: 5432,
        database: 'sicepatmasterdatastaging2',
        user: 'sicepatstaging',
        password: 's1c3p4T$t46Ingb05$sQu',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
      });
    }

    return this.masterDataDbPool;
  }

}
