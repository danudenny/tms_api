import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { AwbSendPartner } from '../../../shared/orm-entity/awb-send-partner';

// DOC: https://optimalbits.github.io/bull/

export class AwbSendPartnerQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'awb-send-partner-queue',
    {
      defaultJobOptions: {
        timeout: 0,
        attempts: Math.round(
          (+ConfigService.get('queue.doPodDetailPostMeta.keepRetryInHours') *
            60 *
            60 *
            1000) /
            +ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
        ),
        backoff: {
          type: 'fixed',
          delay: ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
        },
      },
      limiter: {
        max: 1000,
        duration: 5000, // on seconds
      },
    },
  );

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(async job => {
      const data = job.data;
      const awbSendPartner = AwbSendPartner.create();
      awbSendPartner.awbNumber = data.awbNumber;
      awbSendPartner.partnerId = data.partnerId;
      awbSendPartner.lastSendDateTime = data.timestamp;
      awbSendPartner.sendData = JSON.stringify(data.requestData);
      awbSendPartner.isSend = true;
      awbSendPartner.sendCount = 1;
      awbSendPartner.userIdCreated = 0;
      awbSendPartner.userIdUpdated = 0;
      awbSendPartner.createdTime = data.timestamp;
      awbSendPartner.updatedTime = data.timestamp;
      await AwbSendPartner.insert(awbSendPartner);
      return true;
    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      console.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  public static async addData(
    awbNumber: number,
    partnerId: number,
    requestData: any,
  ) {
    // NOTE: obj data
    const obj = {
      awbNumber,
      partnerId,
      requestData,
      timestamp: moment().toDate(),
    };

    return AwbSendPartnerQueueService.queue.add(obj);
  }
}
