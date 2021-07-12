import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { SharedService } from '../../../shared/services/shared.service';
import { HubSummaryAwb } from '../../../shared/orm-entity/hub-summary-awb';
import { getManager } from 'typeorm';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';

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
      await getManager().transaction(async transactionalEntityManager => {
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
              await transactionalEntityManager.insert(DoPodDetail, doPodDetail);

              await transactionalEntityManager.update(
                HubSummaryAwb,
              {
                awbNumber: itemAwb.awbNumber,
              },
              {
                scanDateOutHub: dateNow,
                outHub: true,
                userIdUpdated: data.userId,
                updatedTime: data.timestamp,
              });

              // TODO: if isTransit auto IN
              if (data.doPodType == 3020) {
                // INSERT history IN_HUB awb
                const obj = await this.getObjectDataInHub(itemAwb.awbItemId, data.branchId, data.userId);
                const awbHistory = await this.getAwbHistory(obj);

                if (awbHistory) {
                  await transactionalEntityManager.insert(AwbHistory, awbHistory);
                } else {
                  continue;
                }
              }

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
        } else {
          console.log('### Data Bag Item Awb :: Not Found!!');
        }
      }); // end transaction
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

  public static async getObjectDataInHub(
    awbItemId: number,
    branchId: number,
    userId: number,
  ) {
    // TODO: need to be reviewed ??
    // TODO: ONLY IN_HUB IN_BRANCH
    let branchName = 'Kantor Pusat';
    let cityName = 'Jakarta';
    const branch = await SharedService.getDataBranchCity(branchId);
    if (branch) {
      branchName = branch.branchName;
      cityName = branch.district ? branch.district.city.cityName : '';
    }
    const noteInternal = `Paket telah di terima di ${cityName} [${branchName}]`;
    const notePublic = `Paket telah di terima di ${cityName} [${branchName}]`;

    // provide data
    const obj = {
      awbItemId,
      userId,
      branchId,
      awbStatusId: AWB_STATUS.IN_HUB,
      awbStatusIdLastPublic: AWB_STATUS.ON_PROGRESS,
      userIdCreated: userId,
      userIdUpdated: userId,
      employeeIdDriver: null,
      timestamp: moment().toDate(),
      noteInternal,
      notePublic,
    };
    return obj;
  }

  public static async getAwbHistory(
    data: any,
  ) {
    const awbItemAttr = await AwbItemAttr.findOne({
      where: {
        awbItemId: data.awbItemId,
        isDeleted: false,
      },
    });
    // TODO: to be fixed create data awb history
    if (awbItemAttr) {
      const awbHistory = AwbHistory.create({
        awbItemId: data.awbItemId,
        refAwbNumber: awbItemAttr.awbNumber,
        userId: data.userId,
        branchId: data.branchId,
        employeeIdDriver: data.employeeIdDriver,
        historyDate: data.timestamp,
        awbStatusId: data.awbStatusId,
        userIdCreated: data.userIdCreated,
        userIdUpdated: data.userIdUpdated,
        noteInternal: data.noteInternal,
        notePublic: data.notePublic,
        branchIdNext: data.branchIdNext,
      });
      return awbHistory;
    } else {
      return null;
    }
  }
}
