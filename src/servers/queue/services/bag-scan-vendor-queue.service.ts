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
import {getManager, In} from 'typeorm';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { BagItem } from '../../../shared/orm-entity/bag-item';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

// DOC: https://optimalbits.github.io/bull/

export class BagScanVendorQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-vendor-queue',
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
        PinoLoggerService.log(`### SCAN DO SMD VENDOR BAG JOB ID ========= ${job.id}`);
        const data = job.data;
        const tempAwb = [];
        const tempBag = [];

        const bagItemsAwb = await BagItemAwb.find({
          where: {
            bagItemId: data.bagItemId ? Number(data.bagItemId) : In(data.arrBagItemId),
            isDeleted: false,
          },
        });

        // UPDATE HISTORY BAG IF REQUESTED
        if (data.isUpdatedHistoryBag) {
          let bagItemIds = null;
          if (data.bagItemId) {
            bagItemIds = [data.bagItemId];
          } else {
            bagItemIds = data.arrBagItemId;
          }
          for (const bagItemIdEach of bagItemIds) {
            if (tempBag.includes(bagItemIdEach)) {
              continue;
            }
            tempBag.push(bagItemIdEach);
            const resultbagItemHistory = BagItemHistory.create();
            resultbagItemHistory.bagItemId = bagItemIdEach.toString();
            resultbagItemHistory.userId = data.userId.toString();
            resultbagItemHistory.branchId = data.branchId.toString();
            resultbagItemHistory.historyDate = moment().toDate();
            resultbagItemHistory.bagItemStatusId = BAG_STATUS.IN_LINE_HAUL.toString();
            resultbagItemHistory.userIdCreated = data.userId;
            resultbagItemHistory.createdTime = moment().toDate();
            resultbagItemHistory.userIdUpdated = data.userId;
            resultbagItemHistory.updatedTime = moment().toDate();

            const resultbagItemOutHistory = BagItemHistory.create();
            resultbagItemOutHistory.bagItemId = bagItemIdEach.toString();
            resultbagItemOutHistory.userId = data.userId.toString();
            resultbagItemOutHistory.branchId = data.branchId.toString();
            resultbagItemOutHistory.historyDate = moment().add(1, 'minutes').toDate();
            resultbagItemOutHistory.bagItemStatusId = BAG_STATUS.OUT_LINE_HAUL.toString();
            resultbagItemOutHistory.userIdCreated = data.userId;
            resultbagItemOutHistory.createdTime = moment().add(1, 'minutes').toDate();
            resultbagItemOutHistory.userIdUpdated = data.userId;
            resultbagItemOutHistory.updatedTime = moment().add(1, 'minutes').toDate();

            await getManager().transaction(async transactionalEntityManager => {
              await transactionalEntityManager.insert(BagItemHistory, resultbagItemHistory);
              const bagItemHistoryOut = await transactionalEntityManager.insert(BagItemHistory, resultbagItemOutHistory);
              await transactionalEntityManager.update(BagItem,
                { bagItemId : bagItemIdEach },
                {
                  bagItemHistoryId: bagItemHistoryOut.identifiers[0].bagItemHistoryId,
                  updatedTime: moment().add(1, 'minutes').toDate(),
                },
              );
            });
          }
        }

        if (bagItemsAwb && bagItemsAwb.length) {

          for (const itemAwb of bagItemsAwb) {
            if (itemAwb.awbItemId && !tempAwb.includes(itemAwb.awbItemId)) {
              // handle duplicate awb item id
              tempAwb.push(itemAwb.awbItemId);

              DoSmdPostAwbHistoryMetaQueueService.createJobByVendorSmd(
                Number(itemAwb.awbItemId),
                Number(data.branchId),
                Number(data.userId),
                AWB_STATUS.IN_LINE_HAUL,
                data.vendorName,
              );

              DoSmdPostAwbHistoryMetaQueueService.createJobByVendorSmd(
                Number(itemAwb.awbItemId),
                Number(data.branchId),
                Number(data.userId),
                AWB_STATUS.OUT_LINE_HAUL,
                data.vendorName,
                moment().add(1, 'minutes').toDate(),
              );

              // Update Internal Process Type
              await AwbItemAttr.update(
                { awbItemId : itemAwb.awbItemId },
                {
                  internalProcessType: 'DARAT_MP',
                  updatedTime:  moment().add(1, 'minutes').toDate(),
                },
              );
            }
          }
        }
        return true;
      } catch (error) {
        console.error(`[bag-scan-vendor-queue] `, error);
        throw error;
      }
    });

    this.queue.on('completed', job => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
      PinoLoggerService.log(`Job with id ${job.id} has been completed`);
    });

    this.queue.on('cleaned', function(job, type) {
      PinoLoggerService.log(`Cleaned ${job.length} ${type} jobs`);
    });
  }

  public static async perform(
    bagItemId: number,
    userId: number,
    branchId: number,
    arrBagItemId = [],
    isUpdatedHistoryBag = false,
    vendorName,
  ) {
    const obj = {
      bagItemId,
      userId,
      branchId,
      arrBagItemId,
      isUpdatedHistoryBag,
      vendorName,
    };

    return BagScanVendorQueueService.queue.add(obj);
  }
}
