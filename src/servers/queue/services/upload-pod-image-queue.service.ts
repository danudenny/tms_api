import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import { DoPodDeliverDetail } from '../../../shared/orm-entity/do-pod-deliver-detail';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';

// DOC: https://optimalbits.github.io/bull/

export class UploadImagePodQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'upload-pod-image-queue',
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
    this.queue.process(async job => {
      const data = job.data;
      // find data and get awb number
      const deliver = await DoPodDeliverDetail.findOne({
        select: ['doPodDeliverDetailId', 'awbNumber'],
        where: {
          doPodDeliverDetailId: data.doPodDeliverDetailId,
          isDeleted: false,
        },
      });

      if (deliver) {
        const awsKey = `attachments/${data.imageType}POD/${
          deliver.awbNumber
        }`;
        // upload image S3 from url image
        const response = await AwsS3Service.uploadFromUrl(
          data.pathUrl,
          awsKey,
        );

        if (response) {
          // TODO: update flag data DoPodDeliverDetail
          console.log('### Upload S3 with KEY : ', response.awsKey);
        } else {
          console.log('### Upload Response Error');
        }
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
    doPodDeliverDetailId: string,
    pathUrl: string,
    imageType: string,
  ) {
    const obj = {
      doPodDeliverDetailId,
      pathUrl,
      imageType,
    };
    UploadImagePodQueueService.queue.add(obj);
    return true;
  }
}
