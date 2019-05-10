switch (process.env.NODE_ENV) {
  case undefined:
    module.exports = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'sicepat-tms',
      entities: ['src/shared/orm-entity/*.entity.ts'],
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
    };
    break;
  case 'test':
    module.exports = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'sicepat-tms',
      entities: ['src/shared/orm-entity/*.entity.ts'],
      migrations: ['src/shared/orm-migration/*.ts'],
      subscribers: ['src/shared/orm-subscriber/*.ts'],
      cli: {
        entitiesDir: 'src/shared/orm-entity',
        migrationsDir: 'src/shared/orm-migration',
        subscribersDir: 'src/shared/orm-subscriber',
      },
      migrationsRun: true,
      logging: true,
      synchronize: false
    };
    break;
  case 'development':
    module.exports = {
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
      cache: {
        type: "redis",
        duration: 10000,
        options: {
          host: "localhost",
          port: 6379
        }
      }
    };
    break;
  case 'production':
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
      synchronize: false,
      cache: {
        type: "redis",
        duration: 10000,
        options: {
          host: "localhost",
          port: 6379
        }
      }
    };
    break;
}