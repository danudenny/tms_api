import { RawQueryService } from '../../../../shared/services/raw-query.service';
import {
  TrackingAwbPayloadVm,
  TrackingBagPayloadVm,
  TrackingAwbResponseVm,
  TrackingBagResponseVm,
} from '../../models/tracking.vm';

export class WebTrackingService {
  static async awb(payload: TrackingAwbPayloadVm): Promise<TrackingAwbResponseVm> {
    const result = new TrackingAwbResponseVm();

    const data = await this.getRawAwb(payload.awbNumber);
    if (data) {
      // mapping data
      result.awbDate = data.awbDate;
      result.awbNumber = data.awbNumber;
      result.awbStatusLast = data.awbStatusLast;
      result.bagNumber = data.bagNumber;
      result.branchName = data.branchName;
      result.branchToName = data.branchToName;
      result.consigneeName = data.consigneeName;
      result.consigneeAddress = data.consigneeAddress;
      result.customerName = data.customerName;
      result.customerNameRds = data.customerNameRds;
      result.packageTypeCode = data.packageTypeCode;
      result.packageTypeName = data.packageTypeName;
      result.paymentMethodCode = data.paymentMethodCode;
      result.totalSellPrice = data.totalSellPrice;
      result.totalCodValue = data.totalCodValue;
      result.totalWeightFinal = data.totalWeightFinal;
      result.totalWeightFinalRounded = data.totalWeightFinalRounded;

      // TODO: get data image awb number
      // relation to do pod deliver

      const history = await this.getRawAwbHistory(data.awbItemId);
      if (history && history.length) {
        result.awbHistory = history;
      }
    }
    return result;
  }

  static async bag(payload: TrackingBagPayloadVm): Promise<TrackingBagResponseVm> {

    const result = new TrackingBagResponseVm();
    return result;
  }

  static async getRawAwb(awbNumber: string): Promise<any> {
    const query = `
      SELECT
        ai.awb_item_id as "awbItemId",
        a.total_item as "totalItem",
        a.awb_number as "awbNumber",
        a.total_sell_price as "totalSellPrice",
        a.total_weight_final::numeric(10, 2) as "totalWeightFinal",
        a.total_weight_final_rounded::numeric(10, 2) as "totalWeightFinalRounded",
        COALESCE(b.branch_name, '') as "branchName",
        CONCAT(r.representative_code, ' - ', dt.district_name) as "branchToName",
        CONCAT(ca.customer_account_code, ca.customer_account_name) as "customerName",
        COALESCE(a.ref_prev_customer_account_id, '') as "customerNameRds",
        COALESCE(a.consignee_name, '') as "consigneeName",
        COALESCE(a.consignee_address, '') as "consigneeAddress",
        a.awb_date as "awbDate",
        ast.awb_status_name as "awbStatusLast",
        a.history_date_last as "historyDateLast",
        COALESCE(pt.package_type_code, '') as "packageTypeCode",
        COALESCE(pt.package_type_name, '') as "packageTypeName",
        COALESCE(p.payment_method_code, '') as "paymentMethodCode",
        a.total_cod_value as "totalCodValue",
        CONCAT(ba.bag_number, LPAD(bi.bag_seq :: text, 3, '0')) as "bagNumber",
        COALESCE(bg.bagging_code, '') as "baggingCode",
        COALESCE(s.smu_code, '') as "smuCode"
      FROM awb a
        INNER JOIN awb_item ai ON a.awb_id = ai.awb_id AND ai.is_deleted = false
        LEFT JOIN package_type pt ON pt.package_type_id = a.package_type_id
        LEFT JOIN customer_account ca ON ca.customer_account_id = a.customer_account_id
        LEFT JOIN branch b ON b.branch_id = a.branch_id
        LEFT JOIN district df ON df.district_id = a.from_id AND a.from_type = 40
        LEFT JOIN district dt ON dt.district_id = a.to_id AND a.to_type = 40
        LEFT JOIN branch bt ON bt.branch_id = dt.branch_id_delivery
        LEFT JOIN representative r ON r.representative_id = bt.representative_id
        LEFT JOIN awb_item_attr ait ON ait.awb_item_id = ai.awb_item_id
        LEFT JOIN awb_status ast ON ast.awb_status_id = ait.awb_status_id_last
        LEFT JOIN branch bl on bl.branch_id = a.branch_id_last
        LEFT JOIN payment_method p ON p.payment_method_id = a.payment_method_id
        LEFT JOIN bag_item bi ON bi.bag_item_id = ai.bag_item_id_last AND bi.is_deleted = false
        LEFT JOIN bag ba ON ba.bag_id = bi.bag_id AND ba.is_deleted = false
        LEFT JOIN bagging bg ON bg.bagging_id = bi.bagging_id_last AND bg.is_deleted = false
        LEFT JOIN smu s ON s.smu_id = bg.smu_id_last AND s.is_deleted = false
      WHERE a.awb_number = :awbNumber
      AND a.is_deleted = false LIMIT 1;
    `;

    const rawData = await RawQueryService.queryWithParams(query, {
      awbNumber,
    });
    return rawData ? rawData[0] : null;
  }

  static async getRawAwbHistory(awbItemId: number): Promise<any> {
    const query = `
      SELECT
        ah.awb_status_id as "awbStatusId",
        ah.history_date as "historyDate",
        ah.employee_id_driver as "employeeIdDriver",
        e.fullname as "employeeNameDriver",
        u.username,
        b.branch_name as "branchName",
        ast.awb_status_name as "awbStatusName",
        case when is_direction_back = false then 'TIDAK' else 'YA' end as direction
      FROM awb_history ah
        LEFT JOIN branch b ON b.branch_id = ah.branch_id
        LEFT JOIN users u ON u.user_id = ah.user_id
        LEFT JOIN awb_status ast ON ast.awb_status_id = ah.awb_status_id
        LEFT JOIN employee e ON e.employee_id = ah.employee_id_driver
      WHERE ah.awb_item_id = :awbItemId
      AND ah.is_deleted = false
      ORDER BY ah.history_date DESC
    `;
    return await RawQueryService.queryWithParams(query, { awbItemId });
  }
}
