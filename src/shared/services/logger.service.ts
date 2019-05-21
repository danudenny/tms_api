import { Inject, Injectable, LoggerService, Module } from '@nestjs/common';
import { Logger, QueryRunner } from 'typeorm';
// import { ConfigModule, ConfigService } from './config';
import pino = require('pino');

export const create_pino = () =>
  pino({
    prettyPrint: true,
    level: 'info',
  });

@Injectable()
export class PinoLoggerService implements LoggerService {
  public logger: pino.Logger;

  constructor() {
    this.logger = create_pino();
  }

  public trace(message: any, ...args: any[]) {
    this.logger.trace(message, ...args);
  }
  public debug(message: any, ...args: any[]) {
    this.logger.debug(message, ...args);
  }
  public info(message: any, ...args: any[]) {
    this.logger.info(message, ...args);
  }
  public warn(message: any, ...args: any[]) {
    this.logger.warn(message, ...args);
  }
  public error(message: any, ...args: any[]) {
    this.logger.error(message, ...args);
  }
  public log(message: any, ...args: any[]) {
    this.logger.info(message, ...args);
  }
}

@Injectable()
export class TypeOrmLoggerService implements Logger {
  constructor(
    @Inject(PinoLoggerService) private readonly logger: pino.Logger,
  ) {}
  /**
   * Logs query and parameters used in it.
   */
  public logQuery(
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.trace('typeorm:query ' + query, parameters || []);
  }
  /**
   * Logs query that is failed.
   */
  public logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.error('typeorm:query ' + error, {
      query,
      parameters: parameters || [],
    });
  }
  /**
   * Logs query that is slow.
   */
  public logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): any {
    this.logger.warn(`typeorm:query slow +${time}`, {
      query,
      parameters,
    });
  }
  /**
   * Logs events from the schema build process.
   */
  public logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    this.logger.info('typeorm:schema ' + message);
  }
  /**
   * Logs events from the migrations run process.
   */
  public logMigration(message: string, queryRunner?: QueryRunner): any {
    this.logger.info('typeorm:migration ' + message);
  }
  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  public log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ): any {
    switch (level) {
      case 'log':
        this.logger.debug(message);
        break;
      case 'info':
        this.logger.info(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }
}

@Module({
  providers: [PinoLoggerService, TypeOrmLoggerService],
  exports: [PinoLoggerService, TypeOrmLoggerService],
})
export class LoggerModule {}
