import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbHistoryLastSyncPod } from '../../../../shared/orm-entity/awb-history-last-sync-pod';
import { DoReturnResponseVm } from '../../../main/models/do-return.vm';
import { DoReturnSyncResponseVm } from '../../models/return-do.response.vm';

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
      t.nokonfirmasi,
      a.created_time,
      a.updated_time
      from temp_stt t
      inner join awb_item_attr aia on t.nostt=aia.awb_number and aia.is_deleted=false
      inner join awb a on aia.awb_id=a.awb_id and a.is_deleted=false
      left join customer_account ca on a.customer_account_id=ca.customer_account_id and ca.is_deleted=false
      where t.dokembali = true and t.is_sync_dokembali = false and aia.awb_status_id_last >= 3500
      );
    `);

    return true;
  }

  private static async updateTempStt(): Promise<any> {
    await RawQueryService.query(` UPDATE temp_stt p1
    SET is_sync_dokembali = true
    FROM do_return_awb p2
    WHERE p1.nostt = p2.awb_number
    AND p1.is_sync_dokembali = false ;`);
    return true;
  }

  static async syncDoReturn(): Promise<DoReturnSyncResponseVm> {
    const insertReturn = await this.searchDoKembali();
    const status = '200';
    const message = 'Success';
    const result = new DoReturnSyncResponseVm();
    if (insertReturn) {
      const updateReturn = await this.updateTempStt();
    }
    result.message = message;
    result.status = status;
    return result;
  }
}
