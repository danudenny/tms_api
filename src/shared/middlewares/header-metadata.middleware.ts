import { Injectable, NestMiddleware } from '@nestjs/common';
import * as requestIp from 'request-ip';

import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class HeaderMetadataMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    this.parseRequestIp(req);
    this.parseRequestUserAgent(req);
    next();
  }

  parseRequestIp(req: Request) {
    const clientRequestIp = requestIp.getClientIp(req);
    if (clientRequestIp) {
      RequestContextMetadataService.setMetadata(
        'REQUEST_IP',
        clientRequestIp,
      );
    }
  }

  parseRequestUserAgent(req: Request) {
    RequestContextMetadataService.setMetadata(
      'REQUEST_USER_AGENT',
      req.headers['user-agent'],
    );
  }
}
