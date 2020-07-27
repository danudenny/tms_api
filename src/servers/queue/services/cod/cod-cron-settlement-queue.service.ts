import { QueueBullBoard } from '../queue-bull-board';
import moment = require('moment');

// DOC: this sample Cron with bull
// https://docs.bullmq.io/guide/jobs/repeatable
// https://github.com/OptimalBits/bull/blob/c23ed7477a65ac11c964ccf95ef0a4a91944e87c/REFERENCE.md

export class CodCronSettlementQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-cron-settlement-queue',
    {
      defaultJobOptions: {
        attempts: 3,
        timeout: 1000 * 60 * 10,
      },
    },
  );

  public static init() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(async (job, done) => {

      // const data = job.data;

      console.log('########## TEST CRON WITH BULL :: timeNow ==============  ', moment().toDate());
      try {
        await this.logicCron();
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

    // start cron
    // https://crontab.guru/
    // NOTE: sample cron every minute
    this.queue.add(null, {
      repeat: {
        cron: '*/10 * * * *',
      },
    });
  }

  private static async logicCron() {
    // TODO: this logic cron process
    console.log('## FUNC HERE !!!');
    // find table transaction where
  }

}
