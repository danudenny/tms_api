import { ConfigService } from '../../../shared/services/config.service';
const { createQueues } = require('bull-board');

export class QueueBullBoard {
  public static createQueue = createQueues({
    redis: ConfigService.get('redis'),
  });
}
