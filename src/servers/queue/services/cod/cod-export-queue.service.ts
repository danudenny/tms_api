import { ConfigService } from '../../../../shared/services/config.service';
import { QueueBullBoard } from '../queue-bull-board';
import { V1WebReportCodService } from '../../../main/services/web/v1/web-report-cod.service';

export class CodExportMongoQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-export-mongo-queue',
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
      const filter = data.filter;
      const codType = data.codType;
      const awbFilter = data.awbFilter;
      const uuid = data.uuid;

      try {
        await V1WebReportCodService.printNonCodSupplierInvoice(filter, codType, awbFilter, uuid);
      } catch (error) {
        throw(error);
      }

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

  public static async perform(
    filter, codType, awbFilter, uuid,
  ) {
    const obj = {
      filter, codType, awbFilter, uuid,
    };

    return CodExportMongoQueueService.queue.add(obj);
  }
}
