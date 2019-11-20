import { Injectable, NestMiddleware } from '@nestjs/common';
import { WinstonLogglyService } from '../services/winston-loggly.service';

@Injectable()
export class LogglyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const oldSend = res.send.bind(res);
    res.send = (data) => {
        WinstonLogglyService.info(data);
        return oldSend(data);
      };
    next();
  }
}
