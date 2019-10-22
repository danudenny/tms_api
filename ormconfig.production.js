module.exports = {
  type: 'postgres',
  replication: {
    master: {
      host: 'sicepat-tms-reborn.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com',
      port: 5432,
      username: 'sicepattmsuser',
      password: 's1c3p4Ttm$us3R3ncrypT3dbo05$',
      database: 'sicepattms',
      schema: 'public',
    },
    slaves: [{
      host: 'sicepat-tms-reborn.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com',
      port: 5432,
      username: 'sicepattmsuser',
      password: 's1c3p4Ttm$us3R3ncrypT3dbo05$',
      database: 'sicepattms',
      schema: 'public',
    }]
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
  logging: true,
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
