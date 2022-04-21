import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { MasterDataService } from '../../background/services/integration/masterdata.service';
import { MappingRolePayloadVm } from '../../background/models/mapping-role.payload.vm';
import { MappingRoleUserPayloadVm } from '../../background/models/mapping-role-user.payload.vm';
import { PinoLoggerService } from '../../../shared/services/pino-logger.service';

// DOC: https://optimalbits.github.io/bull/

export class MappingRoleQueueService {
  public static queue = QueueBullBoard.createQueue.add('mapping-role-queue', {
    defaultJobOptions: {
      timeout: 0,
      attempts: Math.round(
        (+ConfigService.get('queue.masterDataMappingRole.keepRetryInHours') *
          60 *
          60 *
          1000) /
          +ConfigService.get('queue.masterDataMappingRole.retryDelayMs'),
      ),
      backoff: {
        type: 'fixed',
        delay: ConfigService.get('queue.masterDataMappingRole.retryDelayMs'),
      },
    },
    limiter: {
      max: 1000,
      duration: 5000, // on seconds
    },
  });

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async job => {
      // await getManager().transaction(async transactionalEntityManager => {
      // }); // end transaction
      PinoLoggerService.log(`### JOB ID ========= ${job.id}`);
      PinoLoggerService.log(`### JOB DATA ========= ${job.data}`);

      const data = job.data;

      try {
        for (const user of data.users) {
          MasterDataService.insertUserRole(user.userid, user.branchidlast, user.branchidnew, data.payload, data.mode);
        }
      } catch (error) {
        console.error(`[mapping-role-queue] `, error);
        throw error;
      }

      return true;
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

  public static async addData(users: any, payload: MappingRolePayloadVm) {
    const obj = {
      users,
      payload,
      mode: 0,
    };

    return MappingRoleQueueService.queue.add(obj);
  }

  public static async addDataUser(users: any, payload: any) {
    const obj = {
      users,
      payload,
      mode: 0,
    };

    return MappingRoleQueueService.queue.add(obj);
  }

  public static async addDataUserTms(users: any, payload: any) {
    const obj = {
      users,
      payload,
      mode: 1,
    };

    return MappingRoleQueueService.queue.add(obj);
  }

}
