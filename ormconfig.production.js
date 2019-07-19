module.exports = {
  type: 'postgres',
  host:
    'sicepat-tms-masterdata-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com',
  port: 5432,
  username: 'sicepatstaging',
  password: 's1c3p4T$t46Ingb05$sQu',
  database: 'sicepattmsstaging2',
  schema: 'public',
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
