module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'sicepat-tms-api-test',
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
};
