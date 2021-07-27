import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import moment = require('moment');
import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import { getManager } from 'typeorm';

export class UpsertHubSummaryAwbQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'upsert-hub-summary-queue',
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
    this.queue.process(10, async job => {
      console.log('### UPSERT HUB SUMMARY AWB =========', job.id);
      const data = job.data;
      const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
      console.log('### UPSERT HUB SUMMARY AWB NUMBER =========', data.awbNumber);
      try {
        await getManager().transaction(async transactional => {
          const upsertRawHubSummaryAwbSql = `insert into hub_summary_awb (awb_number, scan_date_do_hub,do_hub, bag_item_id_do, bag_id_do, awb_item_id, user_id_updated, updated_time, branch_id,user_id_created, created_time)
                              values ('${escape(data.awbNumber)}', '${dateNow}', true, ${data.bagItemId}, ${data.bagId}, ${data.awbItemId}, ${data.userId}, '${dateNow}', ${data.branchId}, ${data.userId}, '${dateNow}')
                              ON CONFLICT (awb_number,branch_id) DO UPDATE SET do_hub = true, scan_date_do_hub = '${dateNow}', user_id_updated=${data.userId}, updated_time='${dateNow}';`;
  
          console.log('### UPSERT HUB SUMMARY AWB QUERY =========', upsertRawHubSummaryAwbSql);
          await transactional.query(upsertRawHubSummaryAwbSql);
        });
      } catch (error) {
        console.error('### ERROR UPSERT',error);
        // console.log('### ERROR UPSERT',error );
      }
      
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
    branchId: number,
    awbNumber: string,
    bagItemId: number,
    bagId: number,
    awbItemId: number,
    userId: number,
  ) {
    const obj = {
      branchId,
      awbNumber,
      bagItemId,
      bagId,
      awbItemId,
      userId,
    };

    return UpsertHubSummaryAwbQueueService.queue.add(obj);
  }
}
