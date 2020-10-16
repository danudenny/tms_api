import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { In } from 'typeorm';
import { BAG_STATUS } from '../../../shared/constants/bag-status.constant';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import {BagItemHistory} from '../../../shared/orm-entity/bag-item-history';

// DOC: https://optimalbits.github.io/bull/

export class BagAwbDeleteHistoryInHubFromSmdQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-awb-reset-history-in-hub',
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
      // await getManager().transaction(async transactionalEntityManager => {
      // }); // end transaction
      console.log('### DELETE HISTORY BAG AND AWB SMD IN_HUB JOB ID =========', job.id);
      const data = job.data;
      const bagItemIds = new Set(); // unique data
      const awbItemIds = [];

      // GET bag_item_id FROM COMBINE PACKAGE SMD
      const resultBagItemFromCombinePackageSMD = await RawQueryService.query(`
        SELECT
          bi.bag_item_id
        FROM do_smd_detail dsd
        INNER JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
        INNER JOIN bag_item bi ON dsdi.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE
        WHERE dsd.do_smd_id = ${data.doSmdId} AND dsd.is_deleted = FALSE;` ,
      );

      // GET bag_item_id FROM BAGGING SMD
      const resultBagItemFromBaggingSMD = await RawQueryService.query(`
        SELECT
          bi.bag_item_id
        FROM do_smd_detail dsd
        INNER JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
        INNER JOIN bagging_item bai ON bai.bagging_id = dsdi.bagging_id AND bai.is_deleted = FALSE
        INNER JOIN bag_item bi ON bi.bag_item_id = bai.bag_item_id AND bi.is_deleted = FALSE
        WHERE dsd.do_smd_id = ${data.doSmdId} AND dsd.is_deleted = FALSE;` ,
      );

      for (const bagItem of resultBagItemFromCombinePackageSMD) {
        bagItemIds.add(bagItem.bag_item_id);
      }
      for (const bagItem of resultBagItemFromBaggingSMD) {
        bagItemIds.add(bagItem.bag_item_id);
      }

      for (const bagItemId of bagItemIds) {
        // DELETE BAG HISTORY ONLY STATUS IN_HUB
        if (bagItemId) {
          await this.updateBagItemHistory(bagItemId.toString(), data);

          const bagItemsAwb = await BagItemAwb.find({
            select: ['awbItemId'],
            where: {
              bagItemId,
              isDeleted: false,
            },
          });

          for (const awbItemId of bagItemsAwb) {
            if (awbItemId.awbItemId) {
            // DELETE AWB HISTORY ONLY STATUS IN_HUB
              await this.updateAwbHistory(awbItemId.awbItemId, data);
            }
          }
        }
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

  private static async updateBagItemHistory(id: string, data: any) {
    await BagItemHistory.update({
      bagItemId: id,
      bagItemStatusId: BAG_STATUS.IN_HUB.toString(),
      isDeleted: false,
    }, {
      isDeleted: true,
      updatedTime: data.timestamp,
      userIdUpdated: data.userId,
    });
  }

  private static async updateAwbHistory(id: number, data: any) {
    await AwbHistory.update({
      awbItemId: id,
      awbStatusId: AWB_STATUS.IN_HUB,
      isDeleted: false,
    }, {
      isDeleted: true,
      updatedTime: data.timestamp,
      userIdUpdated: data.userId,
    });
  }

  public static async perform(
    doSmdId: number,
    userId: number,
  ) {
    const obj = {
      doSmdId,
      userId,
      timestamp: moment().toDate(),
    };

    return BagAwbDeleteHistoryInHubFromSmdQueueService.queue.add(obj);
  }
}
