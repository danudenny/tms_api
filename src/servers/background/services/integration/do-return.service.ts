import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbHistoryLastSyncPod } from '../../../../shared/orm-entity/awb-history-last-sync-pod';
import { DoReturnResponseVm } from '../../../main/models/do-return.vm';
import { DoReturnSyncResponseVm } from '../../models/return-do.response.vm';
import moment = require('moment');

export class DoReturnService {
  static async findAllDoKembali(
    payload: BaseMetaPayloadVm,
  ): Promise<DoReturnResponseVm> {
    const result = new DoReturnResponseVm();
    const awbHistoryLastSyncPod = await AwbHistoryLastSyncPod.findOne({
      where: {
        isDeleted: false,
      },
    });
    return;
  }

  private static async searchDoKembali(): Promise<any> {
    await RawQueryService.query(`
        INSERT INTO do_return_awb
        (                        branch_id_last,
                                  awb_number,
                                  awb_status_id_last,
                                  customer_id,
                                  pod_datetime,
                                  user_id_created,
                                  user_id_updated,
                                  do_return_awb_number,
                                  created_time,
                                  updated_time
          )
          (
      SELECT aia.branch_id_last,
      aia.awb_number,
      aia.awb_status_id_last,
      a.customer_account_id AS "customer_id",
      a.history_date_last AS "pod_datetime",
      a.user_id_created,
      a.user_id_updated,
      prd.do_return_number,
      a.created_time,
      a.updated_time
      from pickup_request_detail prd
      inner join awb_item_attr aia on prd.ref_awb_number=aia.awb_number and aia.is_deleted=false
      inner join awb a on aia.awb_id=a.awb_id and a.is_deleted=false
      left join customer_account ca on a.customer_account_id=ca.customer_account_id and ca.is_deleted=false
      where prd.do_return = true and prd.is_doreturn_sync = false and aia.awb_status_id_last >= 3500
      );
    `,
    null,
    false,
    );

    return true;
  }

  private static async updatePickReqDetail(): Promise<any> {
    await RawQueryService.query(` UPDATE pickup_request_detail prd
    SET is_doreturn_sync = true
    FROM do_return_awb p2
    WHERE p1.nostt = p2.awb_number
    AND p1.is_sync_dokembali = false ;`, null, false);
    return true;
  }

  static async syncDoReturn(): Promise<DoReturnSyncResponseVm> {
    const insertReturn = await this.searchDoKembali();
    const status = '200';
    const message = 'Success';
    const time = moment().format('DD/MM/YYYY, h:mm:ss a');
    const result = new DoReturnSyncResponseVm();
    if (insertReturn) {
      const updateReturn = await this.updatePickReqDetail();
    }
    result.message = message;
    result.status = status;
    result.date = time;
    return result;
  }
}
