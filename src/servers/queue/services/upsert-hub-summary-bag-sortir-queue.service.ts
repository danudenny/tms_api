import { getManager } from 'typeorm';
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import moment= require('moment');

// DOC: https://optimalbits.github.io/bull/

export class UpsertHubSummaryBagSortirQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'upsert-hub-summary-bag-sortir-queue',
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
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async job => {
      const data = job.data;
      // const podScanInHubBag = await PodScanInHubBag.findOne({
      //   where: { bagItemId: data.bagItemId },
      // });
      // await getManager().transaction(async transactional => {
      //   const dateNow = moment().toDate();
      //
      //     // UPSERT STATUS IN HUB IN AWB SUMMARY
      //     // Handling case scanin hub to hub using bag sortir
      //     // when create bag sortir before scanin hub (status in_hub before do_hub)
      //   const summary = await HubSummaryAwb.find({
      //     where: {
      //       awbNumber: data.awbNumber,
      //     },
      //   });
      //   if (summary && summary.length) {
      //     await transactional.update(
      //       HubSummaryAwb,
      //       { awbNumber: data.awbNumber },
      //       {
      //         scanDateInHub: dateNow,
      //         inHub: true,
      //         bagItemIdIn: data.bagItemId,
      //         bagIdIn: data.bagId,
      //         userIdUpdated: data.userId,
      //         updatedTime: data.timestamp,
      //       },
      //     );
      //   } else {
      //     const hubSummaryAwb = HubSummaryAwb.create(
      //       {
      //         scanDateInHub: dateNow,
      //         branchId: data.branchId,
      //         awbNumber: data.awbNumber,
      //         inHub: true,
      //         bagItemIdIn: data.bagItemId,
      //         bagIdIn: data.bagId,
      //         awbItemId: data.awbItemId,
      //         userIdCreated: data.userId,
      //         userIdUpdated: data.userId,
      //         createdTime: data.timestamp,
      //         updatedTime: data.timestamp,
      //       },
      //     );
      //     await transactional.insert(HubSummaryAwb, hubSummaryAwb);
      //   }
      //
      // }); // end transaction
      try {
        const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        const note = data.note ? `'${data.note}'` : null;
        await getManager().transaction(async transactional => {
          const upsertRawHubSummaryAwbSql = `insert into hub_summary_awb (awb_number, scan_date_in_hub, in_hub, bag_item_id_in, bag_id_in, awb_item_id, note, user_id_updated, updated_time, branch_id, user_id_created, created_time)
                            values ('${escape(data.awbNumber)}', '${dateNow}', true, ${data.bagItemId}, ${data.bagId}, ${data.awbItemId}, ${note}, ${data.userId}, '${dateNow}', ${data.branchId}, ${data.userId}, '${dateNow}')
                            ON CONFLICT (awb_number,branch_id) DO
                            UPDATE SET in_hub = true, scan_date_in_hub = '${dateNow}', bag_item_id_in = ${data.bagItemId}, bag_id_in = ${data.bagId}, note=${note}, user_id_updated=${data.userId}, updated_time='${dateNow}';`;
          console.log('### UPSERT IN HUB SUMMARY QUERY =========', upsertRawHubSummaryAwbSql);
          await transactional.query(upsertRawHubSummaryAwbSql);
        });
      } catch (error) {
        console.error('### ERROR UPSERT', error);
      }
      return true;
    });

    this.queue.on('completed', () => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
    });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  public static async perform(
    bagId: number,
    bagItemId: number,
    bagNumber: string,
    awbItemId: number,
    awbNumber: string,
    userId: number,
    branchId: number,
    timestamp: Date,
    note: string | null = null,
  ) {
    const obj = {
      bagId,
      bagItemId,
      bagNumber,
      awbItemId,
      awbNumber,
      userId,
      branchId,
      timestamp,
      note,
    };

    return UpsertHubSummaryBagSortirQueueService.queue.add(obj);
  }
}
