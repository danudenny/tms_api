import moment = require('moment');
import { getManager } from 'typeorm';
import { AWB_STATUS } from '../../../shared/constants/awb-status.constant';
import { AwbHistory } from '../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import { AwbStatus } from '../../../shared/orm-entity/awb-status';
import { DoPodDetail } from '../../../shared/orm-entity/do-pod-detail';
import { ConfigService } from '../../../shared/services/config.service';
import { OrionRepositoryService } from '../../../shared/services/orion-repository.service';
import { QueueBullBoard } from './queue-bull-board';
import { User } from '../../../shared/orm-entity/user';
import { Reason } from '../../../shared/orm-entity/reason';
import { SharedService } from '../../../shared/services/shared.service';

export class DoPodDetailPostMetaInQueueService {
  public static queue = QueueBullBoard.createQueue.add('awb-history-post-meta', {
    defaultJobOptions: {
      timeout: 0,
      attempts: Math.round(
        (+ConfigService.get('queue.doPodDetailPostMetaIn.keepRetryInHours') *
          60 *
          60 *
          1000) /
          +ConfigService.get('queue.doPodDetailPostMetaIn.retryDelayMs'),
      ),
      backoff: {
        type: 'fixed',
        delay: ConfigService.get('queue.doPodDetailPostMetaIn.retryDelayMs'),
      },
    },
  });

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(10, async job => {
      const data = job.data;
      // Logger.log('### JOB ID =========', job.id);
      await getManager().transaction(async transactionalEntityManager => {

        // NOTE: get awb_ite_attr and update awb_history_id
        const awbItemAttr = await AwbItemAttr.findOne({
          where: {
            awbItemId: data.awbItemId,
            isDeleted: false,
          },
        });
        // TODO: to be fixed create data awb history
        if (awbItemAttr) {
          // NOTE: Insert Data awb history
          const awbHistory = AwbHistory.create({
            awbItemId: data.awbItemId,
            refAwbNumber: awbItemAttr.awbNumber,
            userId: data.userId,
            branchId: data.branchId,
            employeeIdDriver: data.employeeIdDriver,
            historyDate: data.timestamp,
            awbStatusId: data.awbStatusId,
            awbHistoryIdPrev: awbItemAttr.awbHistoryIdLast,
            userIdCreated: data.userIdCreated,
            userIdUpdated: data.userIdUpdated,
            noteInternal: data.noteInternal,
            notePublic: data.notePublic,
            receiverName: data.receiverName,
            awbNote: data.awbNote,
            branchIdNext: data.branchIdNext,
            latitude: data.latitude,
            longitude: data.longitude,
            reasonId: data.reasonId,
            reasonName: data.reasonName,
            location: data.location,
          });
          await transactionalEntityManager.insert(AwbHistory, awbHistory);
          // });
        }
      }); // end transaction

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

  // NOTE: status ONLY IN_HUB
  public static async createJobByAwbFilter(
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
    return DoPodDetailPostMetaInQueueService.queue.add(obj);
  }

}
