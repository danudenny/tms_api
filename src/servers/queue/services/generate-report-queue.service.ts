import * as Bull from 'bull';

import moment = require('moment');
import { ConfigService } from '../../../shared/services/config.service';
import { getManager } from 'typeorm';
import { RawQueryService } from '../../../shared/services/raw-query.service';

// DOC: https://optimalbits.github.io/bull/

export class GenerateReportQueueService {
  public static queue = new Bull('generate-report-queue', {
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
    redis: ConfigService.get('redis'),
    limiter: {
      max: 1000,
      duration: 5000, // on seconds
    },
  });

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(5, async (job) => {
      // await getManager().transaction(async transactionalEntityManager => {
      // }); // end transaction
      console.log('### JOB ID =========', job.id);
      console.log('### DATA =========', job.data);
      const q = this.getDataAwbCancel();
      const data = await RawQueryService.queryCount(q);
      console.log(data);
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

  public static async createReportJob(payload) {
    // NOTE: obj filter data
    const obj = { test: 'generateCsv'};

    return GenerateReportQueueService.queue.add(obj);
  }

  private static getDataAwbCancel() {
    return `
      SELECT a.awb_id,
            a.awb_number,
            a.total_item,
            a.ref_prev_customer_account_id,
            CONCAT(a.awb_number, ' : ', a.total_item, ' koli')                as awb_number_value,
            a.total_sell_price,
            CONCAT('Rp. ' || (a.total_sell_price :: INTEGER) :: TEXT)         as total_sell_price_format,
            a.total_weight_final :: numeric(10, 2)                            as total_weight_final,
            a.total_weight_final_rounded :: numeric(10, 2)                    as total_weight_final_rounded,
            CONCAT(r.representative_code, ' Kec. ', dt.district_name)         as awb_to,
            b.branch_name                                                     as awb_branch,
            CONCAT(ca.customer_account_code, ' - ', ca.customer_account_name) as customer_account,
            TO_CHAR(a.awb_date :: DATE, 'dd-mm-YYYY')                         as awb_date_value,
            CONCAT(ast.awb_status_name, ' (',
                    TO_CHAR(COALESCE(a.history_date_last) :: DATE, 'dd-mm-YYYY HH:mm'), ') ',
                    ' - ',
                    bl.branch_name)                                            as awb_status_last,
            pt.package_type_code,
            p.payment_method_code,
            a.total_cod_value,
            CONCAT(TO_CHAR(a.awb_date :: DATE, 'dd-mm-YYYY'), ' - ',
                  pt.package_type_code)                                      as date_trans_type,
            bi.bag_item_id,
            CONCAT(ba.bag_number, LPAD(bi.bag_seq :: text, 3, '0'))           as bag_number_seq,
            CASE
              WHEN bi.bag_item_id is null THEN ''
              ELSE CONCAT(bi.bag_item_id,
                          CONCAT(ba.bag_number, LPAD(bi.bag_seq :: text, 3, '0')))
                END                                                           AS bag_item_value,
            bg.bagging_id,
            bg.bagging_code,
            CASE
              WHEN bg.bagging_id is null THEN ''
              ELSE CONCAT(bg.bagging_id, bg.bagging_code)
                END                                                           AS bagging_item_value,
            s.smu_code,
            s.smu_id,
            CASE
              WHEN s.smu_id is null THEN ''
              ELSE CONCAT(s.smu_id, s.smu_code)
                END                                                           AS smu_item_value
      FROM awb a
            INNER JOIN awb_item ai ON a.awb_id = ai.awb_id AND ai.is_deleted = false
            LEFT JOIN package_type pt ON pt.package_type_id = a.package_type_id
            LEFT JOIN customer_account ca ON ca.customer_account_id = a.customer_account_id
            LEFT JOIN branch b ON b.branch_id = a.branch_id
            LEFT JOIN district df ON df.district_id = a.from_id AND a.from_type = 40
            LEFT JOIN district dt ON dt.district_id = a.to_id AND a.to_type = 40
            LEFT JOIN branch bt ON bt.branch_id = dt.branch_id_delivery
            LEFT JOIN representative r ON r.representative_id = bt.representative_id
            LEFT JOIN awb_status ast ON ast.awb_status_id = a.awb_status_id_last
            LEFT JOIN branch bl on bl.branch_id = a.branch_id_last
            LEFT JOIN payment_method p ON p.payment_method_id = a.payment_method_id
            LEFT JOIN bag_item bi ON bi.bag_item_id = ai.bag_item_id_last AND bi.is_deleted = false
            LEFT JOIN bag ba ON ba.bag_id = bi.bag_id AND ba.is_deleted = false
            LEFT JOIN bagging bg ON bg.bagging_id = bi.bagging_id_last AND bg.is_deleted = false
            LEFT JOIN smu s ON s.smu_id = bg.smu_id_last AND s.is_deleted = false
      WHERE a.is_deleted = false limit 50000`;
  }

}
