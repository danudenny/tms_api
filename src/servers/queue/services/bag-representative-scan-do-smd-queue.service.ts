import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { SharedService } from '../../../shared/services/shared.service';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { BAG_STATUS } from '../../../shared/constants/bag-status.constant';
import { BagItemHistory } from '../../../shared/orm-entity/bag-item-history';
import { DoSmdPostAwbHistoryMetaQueueService } from './do-smd-post-awb-history-meta-queue.service';
import {In} from 'typeorm';
import {BagRepresentativeHistory} from '../../../shared/orm-entity/bag-representative-history';

// DOC: https://optimalbits.github.io/bull/

export class BagRepresentativeScanDoSmdQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-representative-scan-do-smd-queue',
    {
      defaultJobOptions: {
        timeout: 0,
        attempts: Math.round(
          (+ConfigService.get('queue.doSmdDetailPostMeta.keepRetryInHours') *
            60 *
            60 *
            1000) /
            +ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
        ),
        backoff: {
          type: 'fixed',
          delay: ConfigService.get('queue.doSmdDetailPostMeta.retryDelayMs'),
        },
      },
      redis: ConfigService.get('redis'),
      limiter: {
        max: 1000,
        duration: 5000, // on seconds
      },
    },
  );

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async job => {
      try {
        // await getManager().transaction(async transactionalEntityManager => {
        // }); // end transaction
        console.log('### SCAN BAG REPRESENTATIVE DO SMD JOB ID =========', job.id);
        const data = job.data;
        const tempAwb = [];

        const rawQuery = `
            SELECT
              bri.awb_item_id
            FROM bag_representative_item bri
            where
              bri.bag_representative_id  = '${data.bagRepresentativeId}' AND
              bri.is_deleted = FALSE;
          `;
        const resultDataRepresentative = await RawQueryService.query(rawQuery);

        // TO DO:
        // 1. add history bag representative
        // 2. add history awb IN_HUB

        const historyBag = BagRepresentativeHistory.create();
        historyBag.bagRepresentativeCode = data.bagRepresentativeCode;
        historyBag.bagRepresentativeDate = moment(data.bagRepresentativeDate).toDate();
        historyBag.bagRepresentativeId = data.bagRepresentativeId;
        historyBag.bagRepresentativeStatusIdLast = '3050';
        historyBag.branchId = data.branchId;
        historyBag.representativeIdTo = data.representativeIdTo;
        historyBag.totalItem = data.totalItem;
        historyBag.totalWeight = data.totalWeight;
        historyBag.userIdCreated = data.userId;
        historyBag.createdTime = moment().toDate();
        historyBag.userIdUpdated = data.userId;
        historyBag.updatedTime = moment().toDate();
        await BagRepresentativeHistory.insert(historyBag);

        for (const item of resultDataRepresentative) {
          if (item.awb_item_id && !tempAwb.includes(item.awb_item_id)) {
            // handle duplicate awb item id
            tempAwb.push(item.awb_item_id);

            DoSmdPostAwbHistoryMetaQueueService.createJobByScanDoSmd(
              Number(item.awb_item_id),
              Number(data.branchId),
              Number(data.userId),
              AWB_STATUS.IN_LINE_HAUL,
            );
          }
        }
        return true;
      } catch (error) {
        console.error(`[bag-representative-scan-do-smd-queue] `, error);
        throw error;
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
    bagRepresentativeId: number | string,
    representativeIdTo: string,
    bagRepresentativeCode: string,
    bagRepresentativeDate: string,
    totalItem: number,
    totalWeight: string,
    userId: number,
    branchId: number,
  ) {
    const obj = {
      bagRepresentativeId,
      representativeIdTo,
      bagRepresentativeCode,
      bagRepresentativeDate,
      totalItem,
      totalWeight,
      userId,
      branchId,
    };

    return BagRepresentativeScanDoSmdQueueService.queue.add(obj);
  }
}
