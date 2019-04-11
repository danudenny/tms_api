const ormConfigTest = [
  {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '123456',
    database: 'sicepat-tms-api-test',
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
    logging: false,
    synchronize: true,
  },
];

const ormConfigDefault = [
  {
    type: 'postgres',
    host:
      'sicepat-tms-masterdata-staging.cchjcxaiivov.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    username: 'sicepatstaging',
    password: 's1c3p4T$t46Ingb05$sQu',
    database: 'sicepattmsstaging2',
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
    synchronize: false,
  },
];

module.exports =
  process.env.NODE_ENV === 'test' ? ormConfigTest : ormConfigDefault;
