import { ConfigService } from '../../../shared/services/config.service';
import { QueueBullBoard } from './queue-bull-board';
import {PaymentService} from '../../main/services/web/payment.service';
import axios from 'axios';

// DOC: https://optimalbits.github.io/bull/

export class CodPaymentQueueService {
  // Default attempt mengikuti attempt detail surat jalan
  public static queue = QueueBullBoard.createQueue.add(
    'cod-payment-queue',
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
      console.log('### COD PAYMENT JOB ID =========', job.id);

      const data = job.data;
      const jsonData = {
        jsonrpc: '2.0',
        params: {
          air_waybill: data.awbNumber,
          trx_no: data.noReference,
        },
      };
      const options = {
        headers: PaymentService.headerOdoo,
      };
      const urlPost = `${PaymentService.odooBaseUrl}diva_payment`;
      try {
        const response = await axios.post(urlPost, jsonData, options);
        const res = response.data;

        if (res && res.result && res.result.response_code && res.result.response_code === '00') {
        } else {
          console.log('### Gagal post ke odoo cod payment:');
          console.log(JSON.stringify(res));
        }
      } catch (error) {
        console.log('### Gagal post ke odoo cod payment!!');
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
    awbNumber: string,
    noReference: string,
  ) {
    const obj = {
      awbNumber,
      noReference,
    };

    return CodPaymentQueueService.queue.add(obj);
  }
}
