import winston = require('winston');
import { Loggly } from 'winston-loggly-bulk';

export class WinstonLogglyService {
  public static setup() {
    // NOTE: example data
    winston.add(new Loggly({
        token: '44060a1c-5fb6-4a9d-8bde-6925e7cc3fc8',
        subdomain: 'adrysicepat',
        tags: ['API-POD'],
        json: true,
    }));
  }

  public static info(message: any) {
    winston.log('info', message);
  }
}
