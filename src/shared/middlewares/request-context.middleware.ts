import { Injectable, NestMiddleware } from '@nestjs/common';
import * as requestContext from 'request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use = requestContext.middleware('request').bind(requestContext);
}
