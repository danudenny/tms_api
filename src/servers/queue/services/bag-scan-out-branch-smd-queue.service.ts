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
import { BagRepresentativeHistory } from '../../../shared/orm-entity/bag-representative-history';
import { BAG_REPRESENTATIVE_STATUS } from '../../../shared/constants/bag-representative-status.constant';

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
      console.log('### SCAN OUT BRANCH SMD JOB ID =========', job.id);
      const data = job.data;
      let employeeIdDriver = null;
      let employeeNameDriver = '';

      const resultBagItemBranch = await RawQueryService.query(`
        SELECT
          bi.bag_item_id,
          b.branch_id AS branch_id_to,
          b.branch_name AS branch_name_to,
          bih.bag_item_status_id,
          bih1.branch_id
        FROM do_smd_detail dsd
        INNER JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
        INNER JOIN bag_item bi ON dsdi.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE
        INNER JOIN bag bag ON bag.bag_id = bi.bag_id AND bag.is_deleted = FALSE
        INNER JOIN branch b ON b.branch_id = dsd.branch_id_to AND b.is_deleted = FALSE
        LEFT JOIN bag_item_history bih ON bih.bag_item_id = bi.bag_item_id AND bih.is_deleted = FALSE
        LEFT JOIN bag_item_history bih1 ON bih1.bag_item_id = bi.bag_item_id AND bih1.is_deleted = FALSE
          AND bih1.branch_id = '${data.branchId}' AND bih1.bag_item_status_id = '${BAG_STATUS.OUT_LINE_HAUL}'
        WHERE dsd.do_smd_id = ${data.doSmdId} AND dsd.is_deleted = FALSE
        ORDER BY bih.history_date DESC;` ,
      );

      const resultBagRepresentative = await RawQueryService.query(`
        SELECT
          bri.awb_item_id,
          b.branch_id AS branch_id_to,
          b.branch_name AS branch_name_to,
          brh.bag_representative_status_id_last,
          br.bag_representative_code,
          br.bag_representative_date,
          br.bag_representative_id,
          br.representative_id_to,
          br.total_item,
          br.total_weight
        FROM do_smd_detail dsd
        INNER JOIN do_smd_detail_item dsdi ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsdi.is_deleted = FALSE
        INNER JOIN bag_representative br ON br.bag_representative_id = dsdi.bag_representative_id AND br.is_deleted = FALSE
        INNER JOIN branch b ON b.branch_id = dsd.branch_id_to AND b.is_deleted = FALSE
        INNER JOIN bag_representative_item bri ON bri.bag_representative_id = dsdi.bag_representative_id AND bri.is_deleted = FALSE
        INNER JOIN awb awb ON awb.awb_id = bri.awb_id AND awb.is_deleted = FALSE
        LEFT JOIN bag_representative_history brh ON brh.bag_representative_id = br.bag_representative_id AND brh.is_deleted = FALSE
        WHERE dsd.do_smd_id = ${data.doSmdId} AND dsd.is_deleted = FALSE
        ORDER BY brh.created_time DESC;` ,
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

      const branch = await SharedService.getDataBranchCity(data.branchId);
      if (branch) {
        branchName = branch.branchName;
        cityName = branch.district ? branch.district.city.cityName : '';
      }

      await this.createHistoryCombinePackageAwb(
        data,
        resultBagItemBranch,
        employeeIdDriver,
        employeeNameDriver,
        branchName,
        cityName,
      );

      await this.createHistoryBagRepresentativeAwb(
        data,
        resultBagRepresentative,
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
    const tempBag = [];
    for (const item of resultQuery) {
      // handle duplikat bag_item_id
      if (tempBag.includes(Number(item.bag_item_id))) {
        continue;
      }
      tempBag.push(Number(item.bag_item_id));

      if (Number(item.bag_item_status_id) == BAG_STATUS.OUT_LINE_HAUL && resultQuery.branch_id) {
        // failed to update
        // do nothing
      } else {
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
          where: {
            bagItemId: Number(item.bag_item_id),
            isDeleted: false,
          },
        });
        // console.log(bagItemsAwb);
        const resultbagItemHistory = BagItemHistory.create();
        resultbagItemHistory.bagItemId = item.bag_item_id.toString();
        resultbagItemHistory.userId = data.userId.toString();
        resultbagItemHistory.branchId = data.branchId.toString();
        resultbagItemHistory.historyDate = moment().toDate();
        resultbagItemHistory.bagItemStatusId = BAG_STATUS.OUT_LINE_HAUL.toString();
        resultbagItemHistory.userIdCreated = Number(data.userId);
        resultbagItemHistory.createdTime = moment().toDate();
        resultbagItemHistory.userIdUpdated = Number(data.userId);
        resultbagItemHistory.updatedTime = moment().toDate();
        await BagItemHistory.insert(resultbagItemHistory);

        if (bagItemsAwb && bagItemsAwb.length) {
          for (const itemAwb of bagItemsAwb) {
            if (itemAwb.awbItemId && !tempAwb.includes(itemAwb.awbItemId)) {
              // handle duplikat resi dalam beberapa gabung paket
              tempAwb.push(itemAwb.awbItemId);

              DoSmdPostAwbHistoryMetaQueueService.createJobByScanOutBag(
                Number(itemAwb.awbItemId),
                Number(data.branchId),
                Number(data.userId),
                Number(employeeIdDriver),
                employeeNameDriver,
                AWB_STATUS.OUT_LINE_HAUL,
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
  }

  public static async createHistoryBagRepresentativeAwb(
    data: any,
    resultQuery: any,
    employeeIdDriver: number,
    employeeNameDriver: string,
    branchName: string,
    cityName: string,
  ) {
    let branchNameNext = '';
    const tempAwb = [];
    const tempBag = [];

    for (const item of resultQuery) {
      if (Number(item.bag_representative_status_id_last) == BAG_REPRESENTATIVE_STATUS.OUT_LINE_HAUL) {
        // failed to update
        // do nothing
      } else {
        // branch next
        if (item.branch_id_to) {
          const branchNext = await SharedService.getDataBranchCity(
            item.branch_id_to,
          );
          if (branchNext) {
            branchNameNext = branchNext.branchName;
          }
        }

        // check if not duplicate bag_representative_id then create history bag rep.
        if (!tempBag.includes(Number(item.bag_representative_id))) {
          const historyBag = BagRepresentativeHistory.create();
          historyBag.bagRepresentativeCode = item.bag_representative_code;
          historyBag.bagRepresentativeDate = moment(item.bag_representative_date).toDate();
          historyBag.bagRepresentativeId = item.bag_representative_id;
          historyBag.bagRepresentativeStatusIdLast = BAG_REPRESENTATIVE_STATUS.OUT_LINE_HAUL.toString();
          historyBag.branchId = data.branchId.toString();
          historyBag.representativeIdTo = item.representative_id_to;
          historyBag.totalItem = item.total_item;
          historyBag.totalWeight = item.total_weight;
          historyBag.userIdCreated = data.userId.toString();
          historyBag.createdTime = moment().toDate();
          historyBag.userIdUpdated = data.userId.toString();
          historyBag.updatedTime = moment().toDate();
          await BagRepresentativeHistory.insert(historyBag);
        }
        tempBag.push(Number(item.bag_representative_id)); // handle duplicate

        if (!tempAwb.includes(item.awb_item_id)) {
          // handle duplikat resi dalam beberapa gabung paket
          tempAwb.push(item.awb_item_id);

          DoSmdPostAwbHistoryMetaQueueService.createJobByScanOutBag(
            Number(item.awb_item_id),
            Number(data.branchId),
            Number(data.userId),
            Number(employeeIdDriver),
            employeeNameDriver,
            AWB_STATUS.OUT_LINE_HAUL,
            branchName,
            cityName,
            Number(item.branch_id_to),
            branchNameNext,
          );
        }
      }
    }
  }

  public static async perform(
    // doSmdDetailIds: any,
    doSmdId: any,
    branchId: number,
    userId: number,
  ) {
    const obj = {
      // doSmdDetailIds,
      doSmdId,
      branchId,
      userId,
      timestamp: moment().toDate(),
    };

    return BagScanOutBranchSmdQueueService.queue.add(obj);
  }
}
