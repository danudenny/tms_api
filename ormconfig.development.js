module.exports = {
  type: 'postgres',
  host: 'pgpool-primary-staging-5361beef21559214.elb.ap-southeast-1.amazonaws.com',
  port: 54321,
  username: 'pgpoolpod',
  password: 'Bp570Aa8zaya29dH',
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
    duration: 60000,
    options: {
      host: 'localhost',
      port: 6379,
    },
  },

};