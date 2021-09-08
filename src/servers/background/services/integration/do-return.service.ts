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
    const startDate = moment().format('YYYY-MM-DD 00:00:00');
    const endDate = moment().format('YYYY-MM-DD 23:59:59');
    await RawQueryService.query(
      `
          insert
          into
          do_return_awb ( branch_id_last,
          awb_number,
          awb_status_id_last,
          customer_account_id,
          customer_id,
          pod_datetime,
          user_id_created,
          user_id_updated,
          do_return_awb_number,
          created_time,
          updated_time )
          (
            SELECT
            aia.branch_id_last,
            aia.awb_number,
            aia.awb_status_id_last,
            A.customer_account_id AS "customeAccountId",
            ca.customer_id AS "customerId",
            A.history_date_last AS "pod_datetime",
            A.user_id_created,
            A.user_id_updated,
            prd.do_return_number,
            A.created_time,
            A.updated_time
          FROM
            pickup_request_detail prd
            INNER JOIN awb_item_attr aia ON prd.ref_awb_number = aia.awb_number
            AND aia.is_deleted =
            FALSE INNER JOIN awb A ON aia.awb_id = A.awb_id
            AND A.is_deleted =
            FALSE LEFT JOIN customer_account ca ON A.customer_account_id = ca.customer_account_id
            AND ca.is_deleted =
            FALSE LEFT JOIN customer cust ON ca.customer_id = cust.customer_id
            AND cust.is_deleted = FALSE
          WHERE
            prd.created_time >= ${startDate}
            AND prd.created_time < ${endDate}
            AND prd.do_return = TRUE
            AND prd.is_doreturn_sync IS NULL
            AND aia.awb_status_id_last >= 1500
            LIMIT 100;
      );
      `,
      null,
      false,
    );

    return true;
  }

  private static async updatePickReqDetail(): Promise<any> {
    await RawQueryService.query(
      ` UPDATE pickup_request_detail prd
      SET is_doreturn_sync = true
      FROM do_return_awb p2
      WHERE prd.ref_awb_number = p2.awb_number
      AND prd.is_doreturn_sync is null;`,
      null,
      false,
    );
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
