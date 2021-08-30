import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import moment = require('moment');
import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import { getManager } from 'typeorm';

export class UpdateHubSummaryAwbOutQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'upsert-hub-summary-awb-out-queue',
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
    },
  );

  public static boot() {
    this.queue.process(5, async job => {
      console.log('### UPDATE HUB SUMMARY AWB OUT =========', job.id);
      const data = job.data;
      const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
      console.log('### UPDATE HUB SUMMARY AWB NUMBER OUT =========', data.awbNumber);

      try {
        await getManager().transaction(async transactional => {
          const upsertRawHubSummaryAwbOutSql = `insert into hub_summary_awb (awb_number,user_id_updated, updated_time, branch_id,user_id_created, created_time, out_hub)
                              values ('${escape(data.awbNumber)}', ${data.userId}, '${dateNow}', ${data.branchId}, ${data.userId}, '${dateNow}', true)
                              ON CONFLICT (awb_number,branch_id) DO UPDATE SET out_hub = true, scan_date_out_hub = '${dateNow}', user_id_updated=${data.userId}, updated_time='${dateNow}';`;

          console.log('### UPSERT HUB SUMMARY AWB OUT QUERY =========', upsertRawHubSummaryAwbOutSql);
          await transactional.query(upsertRawHubSummaryAwbOutSql);
          // await transactional.update(
          //   HubSummaryAwb,
          //   {
          //     awbNumber: data.awbNumber,
          //     branchId: data.branchId,
          //   },
          //   {
          //     scanDateOutHub: dateNow,
          //     outHub: true,
          //     userIdUpdated: data.userId,
          //     updatedTime: dateNow,
          //   });
        });
      } catch (error) {
        console.error('### ERROR UPSERT', error);
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
    userId: number,
  ) {
    const obj = {
      branchId,
      awbNumber,
      userId,
    };

    return UpdateHubSummaryAwbOutQueueService.queue.add(obj);
  }
}
