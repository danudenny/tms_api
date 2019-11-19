module.exports = {
  type: 'postgres',
  host:
    'sicepat-tms-reborn.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  username: 'sicepattmsuser',
  password: 's1c3p4Ttm$us3R3ncrypT3dbo05$',
  database: 'sicepattms',
  schema: 'public',
  entities: ['src/shared/orm-entity/*.ts'],
  migrations: ['src/shared/orm-migration/*.ts'],
  subscribers: ['src/shared/orm-subscriber/*.ts'],
  cli: {
    entitiesDir: 'src/shared/orm-entity',
    migrationsDir: 'src/shared/orm-migration',
    subscribersDir: 'src/shared/orm-subscriber',
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