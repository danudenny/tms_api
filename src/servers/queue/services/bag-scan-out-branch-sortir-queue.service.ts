import moment = require('moment');
import { QueueBullBoard } from './queue-bull-board';
import { ConfigService } from '../../../shared/services/config.service';
import { RawQueryService } from '../../../shared/services/raw-query.service';
import { BAG_STATUS } from '../../../shared/constants/bag-status.constant';
import { SharedService } from '../../../shared/services/shared.service';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { BagItemHistory } from '../../../shared/orm-entity/bag-item-history';
import { BagItem } from '../../../shared/orm-entity/bag-item';
import { DoSmdPostAwbHistoryMetaQueueService } from './do-smd-post-awb-history-meta-queue.service';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
export class BagScanOutBranchSortirQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-out-branch-sortir-queue',
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
    this.queue.process(5, async job => {
      console.log('### SCAN OUT BRANCH SORTATION JOB ID =========', job.id);
      const data = job.data;
      let branchName = 'Kantor Pusat';
      let cityName = 'Jakarta';
      let employeeIdDriver = null;
      let employeeNameDriver = '';
      const resultBagItemBranch = await RawQueryService.query(`
        SELECT
            bi.bag_item_id,
            b.branch_id AS branch_id_to,
            b.branch_name AS branch_name_to,
            bih.bag_item_status_id,
            bih1.branch_id
        FROM do_sortation_detail dsd
        INNER JOIN do_sortation_detail_item dsdi ON dsdi.do_sortation_detail_id = dsd.do_sortation_detail_id AND dsdi.is_deleted = FALSE
        INNER JOIN bag_item bi ON dsdi.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE
        INNER JOIN bag bag ON bag.bag_id = bi.bag_id AND bag.is_deleted = FALSE
        INNER JOIN branch b ON b.branch_id = dsd.branch_id_to AND b.is_deleted = FALSE
        LEFT JOIN bag_item_history bih ON bih.bag_item_id = bi.bag_item_id AND bih.is_deleted = FALSE
        LEFT JOIN bag_item_history bih1 ON bih1.bag_item_id = bi.bag_item_id AND bih1.is_deleted = FALSE AND bih1.branch_id = '${data.branchId}' AND bih1.bag_item_status_id = '${BAG_STATUS.OUT_HUB}'
        WHERE dsd.do_sortation_id = '${data.doSortationId}' AND dsd.is_deleted = FALSE
        ORDER BY CASE WHEN bih.bag_item_status_id = ${BAG_STATUS.OUT_HUB} THEN 1 ELSE 2 END, bih.history_date DESC
      `);
      const tempBag = [];
      const dataResultBagItemBranch = [];
      for (const item of resultBagItemBranch) {
        if (tempBag.includes(Number(item.bag_item_id))) {
          continue;
        }
        tempBag.push(Number(item.bag_item_id));
        dataResultBagItemBranch.push(item);
      }

      const resultDriver = await RawQueryService.query(`
         SELECT
          e.employee_id AS employee_driver_id,
          e.fullname AS employee_name_driver
        FROM do_sortation_vehicle dsv
        INNER JOIN employee e ON e.employee_id = dsv.employee_driver_id AND e.is_deleted =  FALSE
        WHERE dsv.do_sortation_id = '${data.doSortationId}' AND dsv.is_deleted = FALSE
        LIMIT 1
      `);

      if (resultDriver.length > 0) {
        employeeIdDriver = resultDriver[0].employee_driver_id;
        employeeNameDriver = resultDriver[0].employee_name_driver;
      }

      const branch = await SharedService.getDataBranchCity(data.branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district ? branch.district.city.cityName : '';
      }

      await this.createHistoryCombinePackageAwb(
        data,
        dataResultBagItemBranch,
        employeeIdDriver,
        employeeNameDriver,
        branchName,
        cityName,
      );
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

  public static async createHistoryCombinePackageAwb(
    data: any,
    resultQuery: any,
    employeeIdDriver: number,
    employeeNameDriver: string,
    branchName: string,
    cityName: string,
  ) {
    let branchNameNext = '';
    const tempAwb = [];
    for (const item of resultQuery) {
      if (item.branch_id_to) {
        const branchNext = await SharedService.getDataBranchCity(
          item.branch_id_to,
        );
        if (branchNext) {
          branchNameNext = branchNext.branchName;
        }
      }

      const bagItemsAwb = await BagItemAwb.find({
        where: {
          bagItemId: Number(item.bag_item_id),
          isDeleted: false,
        },
      });

      const resultbagItemHistory = BagItemHistory.create();
      resultbagItemHistory.bagItemId = item.bag_item_id.toString();
      resultbagItemHistory.userId = data.userId.toString();
      resultbagItemHistory.branchId = data.branchId.toString();
      resultbagItemHistory.historyDate = moment().toDate();
      resultbagItemHistory.bagItemStatusId = BAG_STATUS.OUT_HUB.toString();
      resultbagItemHistory.userIdCreated = Number(data.userId);
      resultbagItemHistory.createdTime = moment().toDate();
      resultbagItemHistory.userIdUpdated = Number(data.userId);
      resultbagItemHistory.updatedTime = moment().toDate();
      await BagItemHistory.insert(resultbagItemHistory);

      await BagItem.update(
        { bagItemId : item.bag_item_id },
        {
          bagItemStatusIdLast: BAG_STATUS.OUT_HUB,
          branchIdLast: data.branchId,
          bagItemHistoryId: Number(resultbagItemHistory.bagItemHistoryId),
          userIdUpdated: data.userId,
          branchIdNext: item.branch_id_to,
          updatedTime: moment().toDate(),
        },
      );

      if (bagItemsAwb && bagItemsAwb.length) {
        for (const itemAwb of bagItemsAwb) {
          if (itemAwb.awbItemId && !tempAwb.includes(itemAwb.awbItemId)) {
            tempAwb.push(itemAwb.awbItemId);

            DoSmdPostAwbHistoryMetaQueueService.createJobByScanOutBag(
              Number(itemAwb.awbItemId),
              Number(data.branchId),
              Number(data.userId),
              Number(employeeIdDriver),
              employeeNameDriver,
              AWB_STATUS.OUT_HUB,
              branchName,
              cityName,
              Number(item.branch_id_to),
              branchNameNext,
            );
          }
        }
      }
    }
  }

  public static async perform(
    doSortationId: any,
    branchId: number,
    userId: number,
  ) {
    const obj = {
      // doSmdDetailIds,
      doSortationId,
      branchId,
      userId,
      timestamp: moment().toDate(),
    };
    return BagScanOutBranchSortirQueueService.queue.add(obj);
  }
}
