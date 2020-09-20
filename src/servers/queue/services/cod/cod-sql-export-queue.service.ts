import { ConfigService } from '../../../../shared/services/config.service';
import { QueueBullBoard } from '../queue-bull-board';
import { V1WebReportCodService } from '../../../main/services/web/v1/web-report-cod.service';
import { V1WebReportSqlCodService } from '../../../main/services/web/v1/web-report-sql-cod.service';

export class CodSqlExportMongoQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-export-sql-mongo-queue',
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
      const noncodfee = data.noncodfee;
      const uuid = data.uuid;

      try {
        console.log(noncodfee, uuid, "codtype");
        if (noncodfee === "noncodfee")
          await V1WebReportSqlCodService.printNonCodSupplierInvoice(filter, uuid);
        else {
          await V1WebReportSqlCodService.printCodSupplierInvoice(filter, uuid);
        }
      } catch (error) {
        throw (error);
      }

      return true;
    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      console.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function (job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  public static async perform(
    filter, noncodfee, uuid
  ) {
    const obj = {
      filter, noncodfee, uuid
    };

    return CodSqlExportMongoQueueService.queue.add(obj);
  }
}
