import { QueueBullBoard } from '../queue-bull-board';
import { AwbSunfishService } from '../../../main/services/integration/awb-sunfish.service';

// DOC: https://optimalbits.github.io/bull/

export class AwbSunfishV2QueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'awb-sunfish-queue',
    {
      defaultJobOptions: {
        timeout: 0,
        attempts: 3,
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
      const data = job.data;
      try {
        await AwbSunfishService.pushDataDlv(
          data.awbNumber,
          data.employeeId,
          data.historyDate,
        );
        done();
      } catch (error) {
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
    awbNumber: string,
    employeeId: number,
    historyDate: Date,
  ) {
    // NOTE: obj data
    const obj = {
      awbNumber,
      employeeId,
      historyDate,
    };

    return AwbSunfishV2QueueService.queue.add(obj);
  }
}
