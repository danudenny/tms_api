import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { BagItemAwb } from '../../../shared/orm-entity/bag-item-awb';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { DoPodDetailPostMetaQueueService } from './do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { SharedService } from '../../../shared/services/shared.service';
import { DoSmdPostAwbHistoryMetaQueueService } from './do-smd-post-awb-history-meta-queue.service';
import {AwbHistory} from '../../../shared/orm-entity/awb-history';
import {AwbItemAttr} from '../../../shared/orm-entity/awb-item-attr';

// DOC: https://optimalbits.github.io/bull/

export class BagScanInBranchSmdQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'bag-scan-in-branch-smd-queue',
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
      console.log('### SCAN IN BRANCH SMD JOB ID =========', job.id);
      const data = job.data;

      const bagItemsAwb = await BagItemAwb.find({
        where: {
          bagItemId: data.bagItemId,
          isDeleted: false,
        },
      });

      let employeeIdDriver = null;
      if (data.userIdDriver) {
        const userDriverRepo = await SharedService.getDataUserEmployee(
          data.userIdDriver,
        );
        if (userDriverRepo) {
          employeeIdDriver = userDriverRepo.employeeId;
        }
      }
      // TODO: raw query select insert into
      // 1. update table awbItemAttr ??
      // 2. insert table AwbHistory ??
      if (bagItemsAwb && bagItemsAwb.length) {
        let branchName = 'Kantor Pusat';
        let cityName = 'Jakarta';

        const branch = await SharedService.getDataBranchCity(data.branchId);
        if (branch) {
          branchName = branch.branchName;
          cityName = branch.district ? branch.district.city.cityName : '';
        }
        const noteInternal = `Paket masuk ke ${cityName} [${branchName}]`;
        for (const itemAwb of bagItemsAwb) {
          if (itemAwb.awbItemId) {
            const awbItemAttr = await AwbItemAttr.findOne({
              where: {
                awbItemId: itemAwb.awbItemId,
                isDeleted: false,
              },
            });
            console.log(awbItemAttr);
            if (awbItemAttr) {
              const awbHistory = AwbHistory.create();
              awbHistory.awbItemId = itemAwb.awbItemId;
              awbHistory.branchId = data.branchId.toString();
              awbHistory.refAwbNumber = awbItemAttr.awbNumber;
              awbHistory.historyDate = moment().toDate();
              awbHistory.awbStatusId = AWB_STATUS.DO_HUB;
              awbHistory.userId = data.userId;
              awbHistory.noteInternal = noteInternal;
              awbHistory.userIdCreated = Number(data.userId);
              awbHistory.createdTime = moment().toDate();
              awbHistory.userIdUpdated = Number(data.userId);
              awbHistory.updatedTime = moment().toDate();
              await AwbHistory.insert(awbHistory);
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
    bagItemId: number,
    branchIdNext: number,
    userIdDriver: number,
    userId: number,
    branchId: number,
  ) {
    const obj = {
      bagItemId,
      branchIdNext,
      userIdDriver,
      userId,
      branchId,
      timestamp: moment().toDate(),
    };

    return BagScanInBranchSmdQueueService.queue.add(obj);
  }
}
