import { Injectable, LoggerService, Optional } from '@nestjs/common';
import { isObject } from 'lodash';
import moment = require('moment');
import pino = require('pino');

import { ConfigService } from './config.service';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private static lastTimestamp?: number = Date.now();
  private static instance?: LoggerService = PinoLoggerService;

  private static logger: pino.Logger = pino({
    ...ConfigService.get('logger'),
    prettyPrint: {
      messageKey: 'message',
    },
  });

  constructor(@Optional() private readonly context?: string) {}

  error(message: any, trace = '', context?: string) {
    const instance = this.getInstance();
    if (instance) {
      instance.error.call(instance, message, trace, context || this.context);
    }
  }

  log(message: any, context?: string) {
    this.callFunction('log', message, context);
  }

  warn(message: any, context?: string) {
    this.callFunction('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.callFunction('debug', message, context);
  }

  verbose(message: any, context?: string) {
    this.callFunction('verbose', message, context);
  }

  static withContext(context: string) {
    return new PinoLoggerService(context);
  }

  static overrideLogger(logger: LoggerService | boolean) {
    PinoLoggerService.instance = isObject(logger) ? (logger as LoggerService) : undefined;
  }

  static log(message: any, context?) {
    PinoLoggerService.logger.info({
      time: PinoLoggerService.getTimestamp(),
      timestampDiff: PinoLoggerService.getTimestampDiff(),
      message,
      context,
    });
  }

  static error(message: any, context?) {
    PinoLoggerService.logger.error({
      time: PinoLoggerService.getTimestamp(),
      timestampDiff: PinoLoggerService.getTimestampDiff(),
      message,
      context,
    });

    let errorStack;
    if (message.stack || message instanceof Error) {
      errorStack = message.stack;
    }
    if (errorStack) {
      console.error(errorStack);
    }
  }

  static warn(message: any, context?) {
    PinoLoggerService.logger.warn({
      time: PinoLoggerService.getTimestamp(),
      timestampDiff: PinoLoggerService.getTimestampDiff(),
      message,
      context,
    });
  }

  static debug(message: any, context?) {
    PinoLoggerService.logger.debug({
      time: PinoLoggerService.getTimestamp(),
      timestampDiff: PinoLoggerService.getTimestampDiff(),
      message,
      context,
    });
  }

  static verbose(message: any, context?) {
    PinoLoggerService.logger.trace({
      time: PinoLoggerService.getTimestamp(),
      timestampDiff: PinoLoggerService.getTimestampDiff(),
      message,
      context,
    });
  }

  private callFunction(
    name: 'log' | 'warn' | 'debug' | 'verbose',
    message: any,
    context?: string,
  ) {
    const instance = this.getInstance();
    const func = instance && (instance as typeof PinoLoggerService)[name];
    if (func) {
      func.call(instance, message, context || this.context);
    }
  }

  private getInstance(): LoggerService {
    return PinoLoggerService.instance === PinoLoggerService
      ? PinoLoggerService
      : PinoLoggerService.instance;
  }

  private static getTimestampDiff() {
    const timestampDiff = `+${Date.now() - PinoLoggerService.lastTimestamp}ms`;
    PinoLoggerService.lastTimestamp = Date.now();
    return timestampDiff;
  }

  private static getTimestamp() {
    return moment().format('DD/MM/YYYY HH:mm:ss.SSS');
  }
}
