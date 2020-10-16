import moment = require('moment');
import { QueueBullBoard } from '../queue-bull-board';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { NotificationMailService } from '../../../main/services/v1/notification-mail.service';
import { NotifEmailProblemVm } from '../../../main/models/notification/email-problem.vm';

// DOC: https://optimalbits.github.io/bull/

export class AwbNotificationMailQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'awb-notification-mail-queue',
    {
      defaultJobOptions: {
        timeout: 0,
        attempts: 1,
        backoff: {
          type: 'fixed',
          delay: 500,
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
    this.queue.process(5, async (job, done) => {
      // await getManager().transaction(async transactionalEntityManager => {
      // }); // end transaction
      const data = job.data;

      try {
        // find awb status
        const awbStatus = await AwbStatus.findOne({
          where: { awbStatusId: data.awbStatusId },
          cache: true,
        });
        if (awbStatus) {
          // check status problem and recipient email
          if (awbStatus.isProblem) {
            const pickreq = await PickupRequestDetail.findOne({
              select: [
                'refAwbNumber',
                'recipientName',
                'recipientPhone',
                'recipientEmail',
                'recipientAddress',
              ],
              where: { awbItemId: data.awbItemId },
            });
            // TODO: check pickreq.recipientEmail is valid
            if (pickreq && pickreq.recipientEmail) {
              const message: NotifEmailProblemVm = {
                problem_status: awbStatus.awbStatusTitle,
                awb_number: pickreq.refAwbNumber,
                customer: {
                  name: pickreq.recipientName,
                  phone: pickreq.recipientPhone,
                  time_delivery: moment(data.timestamp).format('DD MMMM YYYY, HH:mm'),
                  address: pickreq.recipientAddress,
                },
              };
              // NOTE: only for testing
              await NotificationMailService.podProblem(
                pickreq.recipientEmail,
                message,
              );
            } else {
              console.log(' ### NOTIF EMAIL :: NOT FOUND RECIPIENT EMAIL :: ', pickreq.refAwbNumber);
            } // end pickreq
          }
        }
        done();
      } catch (error) {
        console.error(error);
        done(error);
      }
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
    awbItemId: number,
    awbStatusId: number,
  ) {
    // NOTE: obj data
    const obj = {
      awbItemId,
      awbStatusId,
      timestamp: moment().toDate(),
    };

    return AwbNotificationMailQueueService.queue.add(obj);
  }
}
