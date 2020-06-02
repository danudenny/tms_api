import winston = require('winston');
import { Loggly } from 'winston-loggly-bulk';
import { ConfigService } from './config.service';

export class WinstonLogglyService {
  public static setup() {
    // NOTE: example data
    winston.add(
      new Loggly({
        token: ConfigService.get('loggly.token'),
        subdomain: ConfigService.get('loggly.subdomain'),
        tags: ConfigService.get('loggly.tags'),
        json: true,
      }),
    );
  }

  public static info(message: any) {
    winston.log('info', message);
  }

  public static error(message: any) {
    winston.log('error', message);
  }

  public static warn(message: any) {
    winston.log('warn', message);
  }
}
