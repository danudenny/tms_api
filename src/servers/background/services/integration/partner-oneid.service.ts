import { MoreThan, Not, In } from 'typeorm';
import { PartnerOneidPayloadVm, ListOneidOrderActivityResponseVm } from '../../models/partner/oneid-task.vm';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { HttpStatus } from '@nestjs/common';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { MetaService } from '../../../../shared/services/meta.service';


export class PartnerOneidService {

  static async orderActivity(
    payload: PartnerOneidPayloadVm,
  ): Promise<ListOneidOrderActivityResponseVm> {
    const result = new ListOneidOrderActivityResponseVm();

    const partnerIdSst = 95;
    const dateNow = moment().toDate();
    var limit = 10;
    var offset = (payload.page - 1) * limit;
    var oneId = payload.oneId;

    result.status = false;
    result.statusCode = HttpStatus.BAD_REQUEST;

    if (oneId == "") {
      result.message = 'Payload is missing';
      return result
    }

    payload.fieldResolverMap['awbNumber'] = 'awb.awb_number';
    payload.fieldResolverMap['awbStatusGrpId'] = 'asg.awb_status_grp_id';
    payload.fieldResolverMap['partnerId'] = 'pr.partner_id';
    payload.fieldResolverMap['awbHistoryDateLast'] = 'awb_item_attr.awb_history_date_last';
    payload.fieldResolverMap['email'] = 'pr.pickup_request_email';

    const q = RepositoryService.awbItemAttr.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['awb_item_attr.awb_number', 'awbNumber'],
      ['awb_item_attr.awb_status_id_last', 'awbStatusIdLast'],
      ['awb_item_attr.awb_history_date_last', 'awbHistoryDateLast'],
      ['pr.partner_id', 'partnerId'],
      ['p.partner_name', 'partnerName'],
      ['prd.recipient_name', 'consigneeName'],
      ['awb.base_price', 'totalItemPrice'],
      ['asg.awb_status_grp_id', 'awbStatusGrpId'],
      ['asg.awb_status_grp_name', 'awbStatusGrpName'],
      ['prd.delivery_type', 'packageTypeName'],
      ['pr.pickup_request_email', 'email'],
    );


    q.innerJoin(e => e.awb, 'awb', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail, 'prd', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest, 'pr', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 'p', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusGrpDetail, 'asgd', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusGrpDetail.awbStatusGrp, 'asg', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.pickupRequestDetail.pickupRequest.customerMembershipDetail, 'cmd', j =>
      j
        .andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.oneId, w => w.equals(oneId))
        .andWhere(e => e.status, w => w.equals('verified'))
      ,
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());


    // if(payload.fieldResolverMap['partnerId'] == null) {
    //   const customerMembership = await CustomerMembership.findOne({
    //     where: {
    //       oneId: oneId,
    //       isDeleted: false,
    //     },
    //   });

    //   const q2 = RepositoryService.awbItemAttr.findAllRaw();
    //   payload.applyToOrionRepositoryQuery(q2, true);

    //   q2.selectRaw(
    //     ['awb_item_attr.awb_number', 'awbNumber'],
    //     ['awb_item_attr.awb_status_id_last', 'awbStatusIdLast'],
    //     ['awb_item_attr.awb_history_date_last', 'awbHistoryDateLast'],
    //     ['pr.partner_id', 'partnerId'],
    //     ['p.partner_name', 'partnerName'],
    //     ['prd.recipient_name', 'consigneeName'],
    //     ['awb.base_price', 'totalItemPrice'],
    //     ['asg.awb_status_grp_id', 'awbStatusGrpId'],
    //     ['asg.awb_status_grp_name', 'awbStatusGrpName'],
    //     ['prd.delivery_type', 'packageTypeName'],
    //   );

    //   q2.innerJoin(e => e.pickupRequestDetail.pickupRequest, 'pr', j =>
    //     j
    //       .andWhere(e => e.isDeleted, w => w.isFalse())
    //       .andWhere(e => e.pickupRequestEmail, w => customerMembership.email)
    //       .andWhere(e => e.partnerId, w => partnerIdSst)
    //     ,
    //   );

    //   q2.innerJoin(e => e.pickupRequestDetail, 'prd', j =>
    //     j.andWhere(e => e.isDeleted, w => w.isFalse()),
    //   );

    //   q2.innerJoin(e => e.pickupRequestDetail.pickupRequest.partner, 'p', j =>
    //     j.andWhere(e => e.isDeleted, w => w.isFalse()),
    //   );

    //   q2.innerJoin(e => e.awbStatusGrpDetail.awbStatusGrp, 'asg', j =>
    //     j.andWhere(e => e.isDeleted, w => w.isFalse()),
    //   );

    //   q2.innerJoin(e => e.awb, 'awb', j =>
    //     j.andWhere(e => e.isDeleted, w => w.isFalse()),
    //   );

    //   q2.andWhere(e => e.isDeleted, w => w.isFalse());

    //   const data2 = await q.exec();
    //   const total2 = await q.countWithoutTakeAndSkip();
    // }

    // tinggal combine aja data1 dan data2 ?

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);
    result.status = true;
    result.statusCode = HttpStatus.OK;
    result.message = "Success";
    return result;
  }

  static async getOrder(query) {
    try {

      // default filter
      let endDate = moment().subtract(3, "days").format("YYYY-MM-DD HH:mm:ss");
      const filter: any = {};

      // Pagination
      const limitValue = parseFloat(query.limit) || 10;
      const page = parseFloat(query.page);
      const offsetValue = limitValue * ((page || 1) - 1);

      // default query
      let pushquery = '';
      filter.awb_date = endDate;
      const awbref = [];
      const consigneePhoneStringToArray = query.consigneePhone.split(',');


      // query base on partnerName
      // (query.partnerName) ? filter.partner_name = query.partnerName : '';
      // (query.partnerName) ? pushquery = 'AND pa.partner_name = :partner_name ' : '';

      // query base on partnerId
      (query.partnerId) ? filter.partner_id = query.partnerId : '';
      (query.partnerId) ? pushquery += 'AND pa.partner_id = :partner_id ' : '';

      // query base on excludePartnerId
      (query.excludePartnerId) ? filter.exclude_partner_id = query.excludePartnerId : '';
      (query.excludePartnerId) ? pushquery += 'AND pa.partner_id != :exclude_partner_id ' : '';

      // query base on resi status
      (query.status) ? filter.awb_status_id_last = query.status.split(',') : '';
      (query.status) ? pushquery += 'AND ai.awb_status_id_last IN (:...awb_status_id_last) ' : '';


      // query base on consigneePhone
      (query.consigneePhone) ? filter.consignee_phone = consigneePhoneStringToArray : '';
      (query.consigneePhone) ? pushquery += 'AND a.consignee_phone IN (:...consignee_phone)' : '';


      // query base on awb number
      (query.awbNumber) ? filter.awb_number = query.awbNumber : '';
      (query.awbNumber) ? pushquery += 'AND a.awb_number = :awb_number' : '';

      // query base on senderPhone
      if (query.senderPhone) {
        const senderPhoneStringToArray = query.senderPhone.split(',');
        if (!query.awbNumber) {
          const getSenderPhone = await PickupRequestDetail.find({
            select: ['refAwbNumber', 'shipperPhone'],
            where: {
              createdTime: MoreThan(endDate),
              shipperPhone: In(senderPhoneStringToArray),
              isDeleted: false
            },
            take: limitValue,
            skip: offsetValue,
          });

          awbref.push(...getSenderPhone.map(el => el.refAwbNumber));

          filter.awb_number = awbref;
          pushquery += `AND a.awb_number IN (:...awb_number)`
        }

        (query.awbNumber) ? filter.awb_number = query.awbNumber : '';
        (query.awbNumber) ? pushquery = 'AND a.awb_number = :awb_number' : '';

        if (awbref.length == 0 && !query.awbNumber) {
          return {
            status: true,
            statusCode: 200,
            limit: limitValue,
            page,
            data: []
          }
        }

      }
      // query
      let sql = `
      SELECT
       a.awb_id, 
       a.awb_number, 
       a.consignee_name, 
       a.consignee_phone, 
       a.awb_date, 
       a.customer_account_id, 
       a.created_time,
       p.package_type_code,
       a.is_deleted,
       ai.awb_status_id_last,
       aws.awb_status_name,
       prd.shipper_name,
       prd.shipper_phone,
       prd.parcel_content,
       pa.partner_name,
       no.totalbiaya
        FROM awb a 
        INNER JOIN package_type p  ON p.package_type_id = a.package_type_id
        INNER JOIN awb_item_attr ai ON a.awb_id = ai.awb_id AND ai.is_deleted = false
        LEFT JOIN awb_status aws ON aws.awb_status_id = ai.awb_status_id_last
        INNER JOIN pickup_request_detail prd  ON prd.ref_awb_number = a.awb_number
        LEFT JOIN partner pa ON pa.customer_account_id = a.customer_account_id AND pa.is_deleted=false
        LEFT JOIN temp_stt no ON no.nostt = a.awb_number AND pa.is_deleted=false
        WHERE a.awb_date > :awb_date AND a.created_time > :awb_date
        ${pushquery}
        ORDER BY awb_date DESC
        LIMIT ${limitValue} OFFSET ${offsetValue}`;

      // excute query
      const rawData = await RawQueryService.queryWithParams(sql, filter);
      const results = rawData.length ? rawData : [];

      // mapping

      const mapping = [];
      for (let i = 0; i < results.length; i += 1) {
        mapping.push({
          awbId: results[i].awb_id,
          awbNumber: results[i].awb_number,
          receiver: results[i].consignee_name,
          recipientAddress: results[i].consignee_address,
          senderName: results[i].shipper_name,
          shipperAddress: results[i].shipper_address,
          partnerName: results[i].partner_name,
          date: results[i].awb_date,
          service: results[i].package_type_code,
          price: results[i].totalbiaya,
          description: results[i].parcel_content,
          status: results[i].awb_status_name,
        })
      }

      return {
        status: true,
        statusCode: 200,
        limit: limitValue,
        page,
        data: mapping
      }
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        message: (error) ? error.message : null
      };
    }
  }

  static async getStatusResi() {
    try {
      const data = await AwbStatus.find({  where: { isDeleted: false }, select:['awbStatusId', 'awbStatusName']});
      const mapping = [];
      for(let i = 0; i < data.length; i += 1){
        mapping.push({
          awbStatusId: data[i].awbStatusId,
          awbStatusName: data[i].awbStatusName
        })
      }
      return {
        status: true,
        statusCode: 200,
        data: mapping
      }

    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        message: (error) ? error.message : null
      };
    }
  }
}
