import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import {
  TrackingAwbPayloadVm,
  TrackingAwbResponseVm,
  AwbSubstituteResponseVm,
  TrackingBagRepresentativePayloadVm,
  TrackingBagRepresentativeResponseVm,
  TrackingBagPayloadVm,
  TrackingBagResponseVm,
  AwbPhotoDetailVm,
  AwbTransactionHistoryResponseVm,
} from '../../../models/tracking.vm';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { PhotoDetailVm } from '../../../models/bag-order-response.vm';
import { PhotoResponseVm } from '../../../models/bag-order-detail-response.vm';
import { createQueryBuilder } from 'typeorm';
import { AuthService } from '../../../../../shared/services/auth.service';
import { Branch } from '../../../../../shared/orm-entity/branch';

export class V1WebTrackingService {
  static async awb(
    payload: TrackingAwbPayloadVm,
  ): Promise<TrackingAwbResponseVm> {
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = new TrackingAwbResponseVm();

    const data = await this.getRawAwb(payload.awbNumber);
    if (data) {
      // mapping data
      result.awbDate                   = data.awbDate;
      result.createdName               = data.employeeName;
      result.awbNumber                 = data.awbNumber;
      result.awbStatusLast             = data.awbStatusLast;
      result.bagNumber                 = data.bagNumber;
      result.branchName                = data.branchName;
      result.branchToName              = data.branchToName;
      result.consigneeName             = data.consigneeName;
      result.consigneeAddress          = data.consigneeAddress;
      result.customerName              = data.customerName;
      result.customerNameRds           = data.customerNameRds;
      result.packageTypeCode           = data.packageTypeCode;
      result.packageTypeName           = data.packageTypeName;
      result.paymentMethodCode         = data.paymentMethodCode;
      result.totalSellPrice            = data.totalSellPrice;
      result.totalCodValue             = data.totalCodValue;
      result.totalWeightFinal          = data.totalWeightFinal;
      result.totalWeightFinalRounded   = data.totalWeightFinalRounded;
      result.isCod                     = data.isCod;
      result.totalWeightVolume         = data.totalWeightVolume;
      result.refResellerPhone          = data.refResellerPhone;
      result.consigneePhone            = data.consigneePhone;
      result.refRepresentativeCode     = data.refRepresentativeCode;
      result.parcelValue               = data.parcelValue;
      result.partnerLogisticAwb        = data.partnerLogisticAwb;
      result.partnerLogisticName       = data.partnerLogisticName;
      result.doPodDeliverDetailId      = data.doPodDeliverDetailId;
      // set photo reveiver only have doPodDeliverDetailId
      result.isHasPhotoReceiver        = data.doPodDeliverDetailId ? true : false;
      result.returnAwbNumber           = data.returnAwbNumber;
      result.doReturnAwb               = data.doReturnAwb;
      result.isDoReturnPartner         = data.isDoReturnPartner;

      // TODO: partial load data
      const history = await this.getRawAwbHistory(data.awbItemId);
      if (history && history.length) {
        result.awbHistory = history;
      }
      // TODO: partial load data
      const transactionHistory = await this.getTransactionHistory(
        data.awbItemId,
        permissonPayload.branchId,
      );
      if (transactionHistory && transactionHistory.length) {
        result.transactionHistory = transactionHistory;
      }
    }
    return result;
  }

  static async bag(
    payload: TrackingBagPayloadVm,
  ): Promise<TrackingBagResponseVm> {
    const result = new TrackingBagResponseVm();
    const data = await this.getRawBag(payload.bagNumber);
    if (data) {
      result.bagNumber         = data.bagNumber;
      result.weight            = data.weight;
      result.bagItemId         = data.bagItemId;
      result.bagItemStatusId   = data.bagItemStatusId;
      result.bagItemStatusName = data.bagItemStatusName;
      result.branchCodeLast    = data.branchCodeLast;
      result.branchNameLast    = data.branchNameLast;
      result.branchCodeNext    = data.branchCodeNext;
      result.branchNameNext    = data.branchNameNext;
      result.representativeCode = data.representativeCode;
      const history = await this.getRawBagHistory(data.bagItemId);
      if (history && history.length) {
        result.bagHistory = history;
      }
    }

    return result;
  }

  static async getAwbSubstitute(payload: BaseMetaPayloadVm): Promise <AwbSubstituteResponseVm> {
    payload.fieldResolverMap['awbSubstitute']     = 't1.awbSubstitute';
    payload.fieldResolverMap['awbNumber']         = 't1.awb_number';
    payload.fieldResolverMap['awbItemId']         = 't1.awb_item_id';
    payload.fieldResolverMap['awbSubstituteType'] = '"awbSubstituteType"';

    const repo = new OrionRepositoryService(DoPodDetail, 't1');
    const q    = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_substitute', 'awbSubstitute'],
      ['t1.do_pod_detail_id', 'doPodDetailId'],
      [`
        CASE
          WHEN t2.partner_logistic_name IS NOT NULL THEN t2.partner_logistic_name
          WHEN t2.partner_logistic_id IS NOT NULL THEN t3.partner_logistic_name
          ELSE
            'Internal'
        END
      `, 'awbSubstituteType'],
    );
    q.innerJoin(e => e.doPod, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doPod.partnerLogistic, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw('t1.awb_substitute IS NOT NULL');

    const data   = await q.exec();
    const total  = await q.countWithoutTakeAndSkip();

    const result = new AwbSubstituteResponseVm();
    result.data  = data;
    result.buildPaging(payload.page, payload.limit, total);
    return result;
  }

  static async getPhotoDetail(payload: PhotoDetailVm) {
    const qq = createQueryBuilder();
    qq.addSelect('attachments.url', 'url');
    qq.addSelect('dpda.type', 'type');
    qq.addSelect('dpdd.awb_number', 'awbNumber');
    qq.from('do_pod_deliver_attachment', 'dpda');
    qq.innerJoin(
      'do_pod_deliver_detail',
      'dpdd',
      'dpdd.do_pod_deliver_detail_id = dpda.do_pod_deliver_detail_id AND dpdd.is_deleted = false',
    );
    qq.innerJoin(
      'attachment_tms',
      'attachments',
      'attachments.attachment_tms_id = dpda.attachment_tms_id ',
    );
    qq.where('dpdd.do_pod_deliver_detail_id = :doPodDeliverDetailId', {
      doPodDeliverDetailId: payload.doPodDeliverDetailId,
    });

    if (payload.attachmentType) {
      qq.andWhere('dpda.type = :attachmentType', { attachmentType: payload.attachmentType });
    }

    const result = new PhotoResponseVm();
    result.data = await qq.getRawMany();
    return result;
  }

  // get data photo by awb item id
  static async awbPhotoDetail(payload: AwbPhotoDetailVm): Promise<PhotoResponseVm> {
    const qq = createQueryBuilder();
    qq.addSelect('attachments.url', 'url');
    qq.addSelect('dpda.type', 'type');
    qq.addSelect('dpdd.awb_number', 'awbNumber');
    qq.from('do_pod_deliver_attachment', 'dpda');
    qq.innerJoin(
      'do_pod_deliver_detail',
      'dpdd',
      'dpdd.do_pod_deliver_detail_id = dpda.do_pod_deliver_detail_id AND dpdd.is_deleted = false',
    );
    qq.innerJoin(
      'attachment_tms',
      'attachments',
      'attachments.attachment_tms_id = dpda.attachment_tms_id ',
    );
    qq.where('dpdd.awb_item_id = :awbItemId', {
      awbItemId: payload.awbItemId,
    });

    if (payload.attachmentType) {
      qq.andWhere('dpda.type = :attachmentType', { attachmentType: payload.attachmentType });
    }

    const result = new PhotoResponseVm();
    result.data = await qq.getRawMany();
    return result;
  }

  static async bagRepresentative(
    payload: TrackingBagRepresentativePayloadVm,
  ): Promise<TrackingBagRepresentativeResponseVm> {
    const result = new TrackingBagRepresentativeResponseVm();
    const data = await this.getRawBagRepresentative(payload.bagRepresentativeNumber);
    if (data) {
      result.bagRepresentativeCode = data.bagRepresentativeCode;
      result.weight = data.weight;
      result.bagRepresentativeId = data.bagRepresentativeId;
      result.bagRepresentativeStatusId = data.bagRepresentativeStatusId;
      result.bagRepresentativeStatusName = data.bagRepresentativeStatusName;
      result.branchName = data.branchName;
      result.representativeCode = data.representativeCode;
      const history = await this.getRawBagRepresentativeHistory(data.bagRepresentativeId);
      if (history && history.length) {
        result.bagRepresentativeHistory = history;
      } else {
        result.bagRepresentativeHistory = null;
      }
    }
    // result.bagHistory =
    return result;
  }

  // private method
  private static async getRawAwb(awbNumber: string): Promise<any> {
    const query = `
      SELECT
        ai.awb_item_id as "awbItemId",
        a.total_item as "totalItem",
        a.awb_number as "awbNumber",
        a.user_id as "userId",
        e.fullname as "employeeName",
        a.total_sell_price as "totalSellPrice",
        a.total_weight_final::numeric(10, 2) as "totalWeightFinal",
        a.total_weight_final_rounded::numeric(10, 2) as "totalWeightFinalRounded",
        COALESCE(b.branch_name, '') as "branchName",
        CONCAT(r.representative_code, ' - ', dt.district_name) as "branchToName",
        CONCAT(ca.customer_account_code, ' - ',ca.customer_account_name) as "customerName",
        COALESCE(a.ref_prev_customer_account_id, '') as "customerNameRds",
        COALESCE(a.consignee_name, dpd.consignee_name, '') as "consigneeName",
        COALESCE(a.consignee_address, '') as "consigneeAddress",
        a.awb_date as "awbDate",
        a.is_cod as "isCod",
        a.ref_reseller_phone as "refResellerPhone",
        a.total_weight_volume as "totalWeightVolume",
        a.consignee_phone as "consigneePhone",
        a.ref_representative_code as "refRepresentativeCode",
        ast.awb_status_name as "awbStatusLast",
        a.history_date_last as "historyDateLast",
        prd.parcel_value as "parcelValue",
        COALESCE(pt.package_type_code, '') as "packageTypeCode",
        COALESCE(pt.package_type_name, '') as "packageTypeName",
        COALESCE(p.payment_method_code, '') as "paymentMethodCode",
        COALESCE(
          (
            CASE
              WHEN ar.is_partner_logistic = true THEN null
              ELSE ar.return_awb_number
            END
          ), ''
        ) as "returnAwbNumber",
        COALESCE(ar.partner_logistic_awb, '') as "partnerLogisticAwb",
        COALESCE(ar.partner_logistic_name, '') as "partnerLogisticName",
        a.total_cod_value as "totalCodValue",
        CONCAT(ba.bag_number, LPAD(bi.bag_seq :: text, 3, '0')) as "bagNumber",
        COALESCE(bg.bagging_code, '') as "baggingCode",
        COALESCE(s.smu_code, '') as "smuCode",
        dpd.do_pod_deliver_detail_id as "doPodDeliverDetailId",
        COALESCE(ai.doreturn_new_awb, ai.doreturn_new_awb_3pl) as "doReturnAwb",
        CASE
            WHEN ai.doreturn_new_awb_3pl IS NOT NULL THEN true
            ELSE false
        END as "isDoReturnPartner"
      FROM awb a
        INNER JOIN awb_item_attr ai ON a.awb_id = ai.awb_id AND ai.is_deleted = false
        LEFT JOIN package_type pt ON pt.package_type_id = a.package_type_id
        LEFT JOIN customer_account ca ON ca.customer_account_id = a.customer_account_id
        LEFT JOIN branch b ON b.branch_id = a.branch_id
        LEFT JOIN users u on a.user_id = u.user_id
        LEFT JOIN employee e on u.employee_id = e.employee_id
        LEFT JOIN pickup_request_detail prd ON ai.awb_item_id = prd.awb_item_id
        LEFT JOIN district df ON df.district_id = a.from_id AND a.from_type = 40
        LEFT JOIN district dt ON dt.district_id = a.to_id AND a.to_type = 40
        LEFT JOIN branch bt ON bt.branch_id = dt.branch_id_delivery
        LEFT JOIN representative r ON r.representative_id = bt.representative_id
        LEFT JOIN awb_status ast ON ast.awb_status_id = ai.awb_status_id_last
        LEFT JOIN branch bl on bl.branch_id = a.branch_id_last
        LEFT JOIN payment_method p ON p.payment_method_id = a.payment_method_id
        LEFT JOIN bag_item bi ON bi.bag_item_id = ai.bag_item_id_last AND bi.is_deleted = false
        LEFT JOIN bag ba ON ba.bag_id = bi.bag_id AND ba.is_deleted = false
        LEFT JOIN bagging bg ON bg.bagging_id = bi.bagging_id_last AND bg.is_deleted = false
        LEFT JOIN smu s ON s.smu_id = bg.smu_id_last AND s.is_deleted = false
        LEFT JOIN do_pod_deliver_detail dpd ON dpd.awb_id = a.awb_id
          AND dpd.awb_status_id_last <> 14000 AND dpd.is_deleted = false
        LEFT JOIN awb_return ar ON ar.origin_awb_id = ai.awb_id AND ar.is_deleted = false
      WHERE a.awb_number = :awbNumber
      AND a.is_deleted = false LIMIT 1;
    `;

    const rawData = await RawQueryService.queryWithParams(query, {
      awbNumber,
    });
    return rawData ? rawData[0] : null;
  }

  private static async getRawAwbHistory(awbItemId: number): Promise<any> {
    // find awb item attr where awb number
    const query = `
      SELECT
        ah.awb_status_id as "awbStatusId",
        ah.history_date as "historyDate",
        ast.awb_visibility as "awbVisibility",
        ah.employee_id_driver as "employeeIdDriver",
        e.fullname as "employeeNameDriver",
        e2.fullname as "employeeNameScan",
        e2.nik as "employeeNikScan",
        u.username,
        b.branch_name as "branchName",
        ast.awb_status_name as "awbStatusName",
        ah.note_internal as "noteInternal",
        ah.note_public as "notePublic",
        case when is_direction_back = false then 'TIDAK' else 'YA' end as direction
      FROM awb_history ah
        LEFT JOIN branch b ON b.branch_id = ah.branch_id
        LEFT JOIN users u ON u.user_id = ah.user_id
        LEFT JOIN employee e2 ON e2.employee_id = u.employee_id
        LEFT JOIN awb_status ast ON ast.awb_status_id = ah.awb_status_id
        LEFT JOIN employee e ON e.employee_id = ah.employee_id_driver
      WHERE ah.awb_item_id = :awbItemId
      AND ah.is_deleted = false
      ORDER BY ah.history_date DESC
    `;
    return await RawQueryService.queryWithParams(query, { awbItemId });
  }


  private static async getRawBagRepresentative(bagRepresentativeNumber: string): Promise<any> {
    const query = `
      SELECT
        br.bag_representative_code as "bagRepresentativeCode",
        br.total_weight::numeric(10,2) as weight,
        br.bag_representative_id as "bagRepresentativeId",
        brs.bag_representative_status_id as "bagRepresentativeStatusId",
        brs.status_code as "bagRepresentativeStatusName",
        b.branch_name as "branchName",
        r.representative_code as "representativeCode"
      FROM bag_representative br
      LEFT JOIN bag_representative_status brs ON br.bag_representative_status_id_last = brs.bag_representative_status_id AND brs.is_deleted = false
      LEFT JOIN branch b ON br.branch_id = b.branch_id AND b.is_deleted = FALSE
      LEFT JOIN representative r ON br.representative_id_to = r.representative_id AND r.is_deleted = FALSE
      WHERE
        br.bag_representative_code = :bagRepresentativeNumber
      LIMIT 1
    `;
    const rawData = await RawQueryService.queryWithParams(query, {
      bagRepresentativeNumber,
    });
    return rawData ? rawData[0] : null;
  }

  private static async getRawBagRepresentativeHistory(bagRepresentativeId: number): Promise<any> {
    const query = `
      SELECT
        brh.bag_representative_history_id as "bagRepresentativeHistoryId",
        brs.bag_representative_status_id as "bagRepresentativeStatusId",
        brs.status_code as "bagRepresentativeStatusName",
        brh.created_time as "historyDate",
        b.branch_name as "branchName",
        u.username
      FROM bag_representative_history brh
      LEFT JOIN branch b ON brh.branch_id = b.branch_id AND b.is_deleted = FALSE
      LEFT JOIN users u ON brh.user_id_created = u.user_id AND u.is_deleted = FALSE
      LEFT JOIN bag_representative_status brs ON brh.bag_representative_status_id_last = brs.bag_representative_status_id AND brs.is_deleted = FALSE
      WHERE
        brh.bag_representative_id = :bagRepresentativeId AND
        brh.is_deleted = false
      ORDER BY
        brh.created_time DESC
    `;
    return await RawQueryService.queryWithParams(query, { bagRepresentativeId });
  }
  
  private static async getRawBag(bagNumberSeq: string): Promise<any> {
    const regexNumber = /^[0-9]+$/;
    if (regexNumber.test(bagNumberSeq.substring(7, 10))) {
      const bagNumber: string = bagNumberSeq.substring(0, 7);
      const seqNumber: number = Number(bagNumberSeq.substring(7, 10));
      const query = `
        SELECT
          CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, '0')) as "bagNumber",
          bi.weight::numeric(10,2) as weight,
          bi.bag_item_id as "bagItemId",
          bis.bag_item_status_id as "bagItemStatusId",
          bis.bag_item_status_name as "bagItemStatusName",
          blast.branch_code as "branchCodeLast",
          blast.branch_name as "branchNameLast",
          bto.branch_code as "branchCodeNext",
          bto.branch_name as "branchNameNext",
          b.ref_representative_code as "representativeCode"
        FROM bag b
        INNER JOIN bag_item bi ON b.bag_id = bi.bag_id AND bi.is_deleted = false
        LEFT JOIN bag_item_status bis ON bi.bag_item_status_id_last = bis.bag_item_status_id AND bis.is_deleted = false
        LEFT JOIN branch blast ON bi.branch_id_last = blast.branch_id AND blast.is_deleted = false
        LEFT JOIN branch bto ON bi.branch_id_next = bto.branch_id AND bto.is_deleted = false
        WHERE b.bag_number = :bagNumber AND bi.bag_seq = :seqNumber LIMIT 1
      `;
      const rawData = await RawQueryService.queryWithParams(query, {
        bagNumber,
        seqNumber,
      });
      return rawData ? rawData[0] : null;
    } else {
      return null;
    }
  }

  private static async getRawBagHistory(bagItemId: number): Promise<any> {
    const query = `
      SELECT
        bh.bag_item_history_id,
        bh.bag_item_status_id as "bagItemStatusId",
        ast.bag_item_status_name as "bagItemStatusName",
        bh.history_date as "historyDate",
        b.branch_name as "branchName",
        u.username
      FROM bag_item_history bh
        LEFT JOIN branch b ON b.branch_id = bh.branch_id
        LEFT JOIN users u ON u.user_id = bh.user_id
        LEFT JOIN bag_item_status ast ON ast.bag_item_status_id = bh.bag_item_status_id
      WHERE bh.bag_item_id = :bagItemId
      AND bh.is_deleted = false
      ORDER BY bh.history_date DESC
    `;
    return await RawQueryService.queryWithParams(query, { bagItemId });
  }

  private static async getTransactionHistory(
    awbItemId: number,
    branchId: number,
  ): Promise<AwbTransactionHistoryResponseVm[]> {
    // check status level by branch login head office true
    const branch = await Branch.findOne({
      cache: 60000, // 1 minute
      select: ['branchId', 'branchCode'],
      where: {
        branchId,
        isHeadOffice: true,
        isActive: true,
        isDeleted: false,
      },
    });
    const statusLevel = branch ? 2 : 1;

    // #region get data query builder
    const qb = createQueryBuilder();
    qb.addSelect('t1.awb_item_id', 'awbItemId');
    qb.addSelect('t1.transaction_date', 'transactionDate');
    qb.addSelect('t1.transaction_status_id', 'transactionStatusId');
    qb.addSelect('t2.status_code', 'transactionStatusCode');
    qb.addSelect('t2.status_title', 'transactionStatusTitle');
    qb.addSelect('t1.branch_id', 'branchId');
    qb.addSelect('t3.branch_name', 'branchName');
    qb.addSelect('t5.fullname', 'employeeNameScan');
    qb.addSelect('t5.nik', 'employeeNikScan');

    qb.from('cod_transaction_history', 't1');
    qb.innerJoin(
      'transaction_status',
      't2',
      't1.transaction_status_id = t2.transaction_status_id AND t2.is_deleted = false',
    );
    qb.innerJoin(
      'branch',
      't3',
      't1.branch_id = t3.branch_id AND t3.is_deleted = false',
    );
    qb.innerJoin(
      'users',
      't4',
      't1.user_id_created = t4.user_id AND t3.is_deleted = false',
    );
    qb.innerJoin(
      'employee',
      't5',
      't4.employee_id = t5.employee_id AND t5.is_deleted = false',
    );
    qb.where('t1.awb_item_id = :awbItemId AND t1.is_deleted = false', {
      awbItemId,
    });
    qb.andWhere('t2.status_level <= :statusLevel', { statusLevel });
    qb.orderBy('t1.transaction_date', 'DESC');
    // #endregion query

    return await qb.getRawMany();
  }

}
