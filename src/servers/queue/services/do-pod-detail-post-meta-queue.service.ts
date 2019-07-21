import * as Bull from 'bull';

import { ConfigService } from '../../../shared/services/config.service';

export class DoPodDetailPostMetaQueueService {
  public static queue = new Bull('do-pod-detail-post-meta', {
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
  });

  public static boot() {
    this.queue.process(async job => {
      /**
       * TODO:
       * 2019-07-21 14:50:38 Labib *** START
       * 1. Insert into awb_history
       *    1.1 awb_item_id = do_pod_detail.awb_item_id
       *    1.2 user_id = do_pod_detail.user_id_created
       *    1.3 branch_id = ?
       *    1.4 history_date = job.timestamp
       *    1.5 awb_status_id = ?
       *    1.6 awb_note = ?
       *    1.7 user_id_created = do_pod_detail.user_id_created
       *    1.8 user_id_updated = do_pod_detail.user_id_updated
       *
       * 2. Insert into awb_item_summary
       *    1.1 awb_item_id = do_pod_detail.awb_item_id
       *    1.2 summary_date = job.timestamp
       *    1.3 awb_history_id_last = ?
       *    1.4 awb_status_id_last = ?
       *    1.5 user_id_last = ?
       *    1.6 branch_id_last = ?
       *    1.7 branch_id_next = ?
       *    1.8 history_date_last = ?
       *
       * NOTE:
       *    - Execute number 1 and number 2 in single transaction
       * END
       */
    });
  }

  public static async createJobByDoPodDetailId(doPodDetailId: string) {
    /**
     * TODO:
     * 2019-07-21 14:47:21 Labib *** START
     * 1. Load do_pod_detail and its do_pod (as normal orm join)
     * 2. If do_pod_detail exists then continue else exit
     * 3. If do_pod_detail.is_posted is other than 0, 0 means success then do nothing
     * 4. If do_pod_detail.is_posted is greater than 0 (contains jobId), load the queue job and get the queue job status
     *    4.1 If job status is failed, continue create new job (do not retry) and update do_pod_detail.is_posted = jobId
     *    4.2 Else do nothing
     * 5. If do_pod_detail.is_posted is lower than 0, continue create new job and update do_pod_detail.is_posted = jobId
     * 6. Pass loaded do_pod_detail including its do_pod as job data
     * END
     */
  }
}
