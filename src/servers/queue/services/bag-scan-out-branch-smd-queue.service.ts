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

// DOC: https://optimalbits.github.io/bull/

export class BagScanOutBranchSmdQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-out-branch-smd-queue',
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
      console.log('### SCAN OUT BRANCH SMD JOB ID =========', job.id);
      const data = job.data;
      let employeeIdDriver = null;
      let employeeNameDriver = null;

      const resultBagItemBranch = await RawQueryService.query(`
        SELECT
          bi.bag_item_id,
          b.branch_id AS branch_id_to,
          b.branch_name AS branch_name_to,
          bih.bag_item_status_id
        FROM do_smd_detail dsd
        INNER JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
        INNER JOIN bag_item bi ON dsdi.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE
        INNER JOIN bag bag ON bag.bag_id = bi.bag_id AND bag.is_deleted = FALSE
        INNER JOIN branch b ON b.branch_id = dsd.branch_id_to AND b.is_deleted = FALSE
        INNER JOIN bag_item_history bih ON bih.bag_item_id = bi.bag_item_id AND bih.is_deleted = FALSE
        WHERE dsd.do_smd_detail_id IN (${data.doSmdDetailIds.join(',')}) AND dsd.is_deleted = FALSE
        GROUP BY bih.bag_item_id, bi.bag_item_id, b.branch_id, b.branch_name, bih.history_date, bih.bag_item_status_id
        ORDER BY bih.history_date DESC;` ,
      );

      const resultDriver = await RawQueryService.query(`
        SELECT
          e.employee_id AS employee_id_driver,
          e.fullname AS employee_name_driver
        FROM do_smd_vehicle dsv
        INNER JOIN employee e ON e.employee_id = dsv.employee_id_driver AND e.is_deleted =  FALSE
        WHERE dsv.do_smd_id = ${data.doSmdId} AND dsv.is_deleted = FALSE
        LIMIT 1;` ,
      );

      if (resultDriver.length > 0) {
        employeeIdDriver = resultDriver[0].employee_id_driver;
        employeeNameDriver = resultDriver[0].employee_name_driver;
      }
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      let branchNameNext = '';
      const tempAwb = [];
      const tempBag = [];

      for (const item of resultBagItemBranch) {
        // handle duplikat bag_item_id
        if (tempBag.includes(item.bag_item_id)) {
          continue;
        }
        tempBag.push(item.bag_item_id);

        if (item.bag_item_status_id == BAG_STATUS.OUT_HUB.toString()) {
          // failed to update
          // do nothing
        } else {
          const branch = await SharedService.getDataBranchCity(data.branchId);
          if (branch) {
            branchName = branch.branchName;
            cityName = branch.district ? branch.district.city.cityName : '';
          }
          // branch next
          if (item.branch_id_to) {
            const branchNext = await SharedService.getDataBranchCity(
              item.branch_id_to,
            );
            if (branchNext) {
              branchNameNext = branchNext.branchName;
            }
          }

          const bagItemsAwb = await BagItemAwb.find({
            select: ['awbItemId'],
            where: {
              bagItemId: item.bag_item_id,
              isDeleted: false,
            },
          });
          // console.log(bagItemsAwb);
          const resultbagItemHistory = BagItemHistory.create();
          resultbagItemHistory.bagItemId = item.bag_item_id.toString();
          resultbagItemHistory.userId = data.userId.toString();
          resultbagItemHistory.branchId = data.branchId.toString();
          resultbagItemHistory.historyDate = moment().toDate();
          resultbagItemHistory.bagItemStatusId = BAG_STATUS.OUT_HUB.toString();
          resultbagItemHistory.userIdCreated = data.userId;
          resultbagItemHistory.createdTime = moment().toDate();
          resultbagItemHistory.userIdUpdated = data.userId;
          resultbagItemHistory.updatedTime = moment().toDate();
          await BagItemHistory.insert(resultbagItemHistory);

          if (bagItemsAwb && bagItemsAwb.length) {
            for (const itemAwb of bagItemsAwb) {
              if (itemAwb.awbItemId && !tempAwb.includes(itemAwb.awbItemId)) {
                // handle duplikat resi dalam beberapa gabung paket
                tempAwb.push(itemAwb.awbItemId);

                DoSmdPostAwbHistoryMetaQueueService.createJobByScanOutBag(
                  itemAwb.awbItemId,
                  data.branchId,
                  data.userId,
                  employeeIdDriver,
                  employeeNameDriver,
                  AWB_STATUS.OUT_HUB,
                  branchName,
                  cityName,
                  item.branch_id_to,
                  branchNameNext,
                );
              }
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

  public static async perform(
    doSmdDetailIds: any,
    doSmdId: any,
    branchId: number,
    userId: number,
  ) {
    const obj = {
      doSmdDetailIds,
      doSmdId,
      branchId,
      userId,
      timestamp: moment().toDate(),
    };

    return BagScanOutBranchSmdQueueService.queue.add(obj);
  }
}
