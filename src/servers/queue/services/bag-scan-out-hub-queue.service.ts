import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { SharedService } from '../../../shared/services/shared.service';
import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';

// DOC: https://optimalbits.github.io/bull/

export class BagScanOutHubQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-out-hub-queue',
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
    this.queue.process(5, async job => {
      // await getManager().transaction(async transactionalEntityManager => {
      // }); // end transaction
      console.log('### SCAN OUT HUB JOB ID =========', job.id);
      const data = job.data;

      const dateNow = moment().toDate();
      const bagItemsAwb = await BagItemAwb.find({
        where: {
          bagItemId: data.bagItemId,
          isDeleted: false,
        },
      });
      // TODO: raw query select insert into
      // 1. insert table doPOdDetail ??
      // 2. update table awbItemAttr ??
      // 3. insert table AwbHistory ??
      if (bagItemsAwb && bagItemsAwb.length) {
        let employeeIdDriver = null;
        let employeeNameDriver = '';
        const userDriverRepo = await SharedService.getDataUserEmployee(
          data.userIdDriver,
        );
        if (userDriverRepo) {
          employeeIdDriver = userDriverRepo.employeeId;
          employeeNameDriver = userDriverRepo.employee.employeeName;
        }
        let branchName = 'Kantor Pusat';
        let cityName = 'Jakarta';
        let branchNameNext = 'Pluit';

        const branch = await SharedService.getDataBranchCity(data.branchId);
        if (branch) {
          branchName = branch.branchName;
          cityName = branch.district ? branch.district.city.cityName : '';
        }
        // branch next
        if (data.branchIdNext) {
          const branchNext = await SharedService.getDataBranchCity(
              data.branchIdNext,
            );
          if (branchNext) {
            branchNameNext = branchNext.branchName;
          }
        }

        for (const itemAwb of bagItemsAwb) {
          if (itemAwb.awbItemId) {
            const doPodDetail = DoPodDetail.create();
            doPodDetail.doPodId = data.doPodId;
            doPodDetail.awbItemId = itemAwb.awbItemId;
            doPodDetail.awbNumber = itemAwb.awbNumber;
            doPodDetail.bagNumber = data.bagNumber;
            doPodDetail.bagId = data.bagId;
            doPodDetail.bagItemId = data.bagItemId;
            doPodDetail.isScanOut = true;
            doPodDetail.scanOutType = 'bag';
            doPodDetail.transactionStatusIdLast = 300; // OUT_HUB
            doPodDetail.userIdUpdated = data.userId;
            doPodDetail.userIdCreated = data.userId;
            await DoPodDetail.insert(doPodDetail);

            await HubSummaryAwb.update(
              {
                awbNumber: itemAwb.awbNumber,
              },
              {
                scanDateOutHub: dateNow,
                outHub: true,
                userIdUpdated: data.userId,
                updatedTime: data.timestamp,
              },
            );

            // TODO: if isTransit auto IN
            if (data.doPodType == 3020) {
              // queue bull IN HUB
              DoPodDetailPostMetaQueueService.createJobByScanOutBagInHubAndOutHub(
                itemAwb.awbItemId,
                data.branchId,
                data.userId,
                employeeIdDriver,
                employeeNameDriver,
                branchName,
                cityName,
                data.branchIdNext,
                branchNameNext,
                1,
              );
            } else {
              // NOTE: queue bull OUT HUB
              DoPodDetailPostMetaQueueService.createJobByScanOutBag(
                itemAwb.awbItemId,
                data.branchId,
                data.userId,
                employeeIdDriver,
                employeeNameDriver,
                AWB_STATUS.OUT_HUB,
                branchName,
                cityName,
                data.branchIdNext,
                branchNameNext,
                1,
              );
            }
          }
        }
      } else {
        console.log('### Data Bag Item Awb :: Not Found!!');
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
    bagId: number,
    bagItemId: number,
    doPodId: string,
    branchIdNext: number,
    userIdDriver: number,
    bagNumber: string,
    userId: number,
    branchId: number,
    doPodType: number,
  ) {
    const obj = {
      bagId,
      bagItemId,
      doPodId,
      branchIdNext,
      userIdDriver,
      bagNumber,
      userId,
      branchId,
      doPodType,
      timestamp: moment().toDate(),
    };

    return BagScanOutHubQueueService.queue.add(obj);
  }
}
