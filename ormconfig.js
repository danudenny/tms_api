const ormConfigTest = [
  {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '123456',
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
    logging: false,
    synchronize: false,
  },
];

const ormConfigDefault = [
  {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '123456',
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
    migrationsRun: true,
    logging: true,
    synchronize: false,
  },
];

module.exports =
  process.env.NODE_ENV === 'test' ? ormConfigTest : ormConfigDefault;
