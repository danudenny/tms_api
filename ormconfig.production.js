// ENV: STAGING
// MASTER : sicepat-tmspod-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com
// REPLICA :
// front end: sicepat-tmspod-frontend-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com
// api: sicepat-tmspod-api-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com
// background: sicepat-tmspod-background-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com
// process: sicepat-tmspod-process-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com
// ENV: PRODUCTION
module.exports = {
  type: 'postgres',
  replication: {
    master: {
      host: 'tmsnew.sicepat.com',
      port: 5432,
      username: 'sicepattmsuser',
      password: 's1c3p4Ttm$us3R3ncrypT3dbo05$',
      database: 'sicepattms',
      schema: 'public',
    },
    slaves: [
      {
        host: 'tmsslaverr.sicepat.com',
        port: 5432,
        username: 'sicepattmsuser',
        password: 's1c3p4Ttm$us3R3ncrypT3dbo05$',
        database: 'sicepattms',
        schema: 'public',
      },
      {
        host: 'tmsslavecron.sicepat.com',
        port: 5432,
        username: 'sicepattmsuser',
        password: 's1c3p4Ttm$us3R3ncrypT3dbo05$',
        database: 'sicepattms',
        schema: 'public',
      },
      {
        host: 'tmsmobileapirep.sicepat.com',
        port: 5432,
        username: 'sicepattmsuser',
        password: 's1c3p4Ttm$us3R3ncrypT3dbo05$',
        database: 'sicepattms',
        schema: 'public',
      },
    ],
    /**
     * Determines how slaves are selected:
     * RR: Select one alternately (Round-Robin).
     * RANDOM: Select the node by random function.
     * ORDER: Select the first node available unconditionally.
     */
    selector: 'ORDER',
  },
  extra: {
    max: 20,
    idleTimeoutMillis: 2000,
    connectionTimeoutMillis: 2000,
  },
  entities: ['dist/shared/orm-entity/*.js'],
  migrations: ['dist/shared/orm-migration/*.js'],
  subscribers: ['dist/shared/orm-subscriber/*.js'],
  cli: {
    entitiesDir: 'dist/shared/orm-entity',
    migrationsDir: 'dist/shared/orm-migration',
    subscribersDir: 'dist/shared/orm-subscriber',
  },
  migrationsRun: false,
  logging: ['warn', 'error'],
  logger: 'advanced-console',
  maxQueryExecutionTime: 1000,
  synchronize: false,
  cache: {
    type: 'redis',
    duration: 10000,
    options: {
      host: 'localhost',
      port: 6379,
    },
  },
};
