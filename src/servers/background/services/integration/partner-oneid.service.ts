import { MoreThan, Not, In } from 'typeorm';
import { PartnerOneidPayloadVm, ListOneidOrderActivityResponseVm } from '../../models/partner/oneid-task.vm';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';
import { HttpStatus } from '@nestjs/common';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { DatabaseConfig } from '../../config/database/db.config';


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
      const filter = [];

      // Pagination
      const limitValue = parseFloat(query.limit) || 10;
      const page = parseFloat(query.page);
      const offsetValue = limitValue * ((page || 1) - 1);

      // default query
      let pushquery = '';
      const awbref = [];

      // query base on senderPhone
      const pool: any = DatabaseConfig.getSuperAppRedShiftDbPool();
      const client = await pool.connect();
      try {

        if (query.senderPhone) {
          const senderPhoneStringToArray = query.senderPhone.split(',');
          const sqlSenderPhone = `
            SELECT 
              ref_awb_number,
              shipper_phone 
            FROM 
              superapps.pickup_request_detail
            WHERE
              is_deleted = false
              AND created_time >= $1
              AND shipper_phone = ANY($2)
             LIMIT ${limitValue}
             OFFSET ${offsetValue}`;

          const senderPhone = await client.query(sqlSenderPhone, [endDate, senderPhoneStringToArray])
          awbref.push(...senderPhone.rows.map(el => el.ref_awb_number));

          pushquery += `AND a.awb_number IN (${awbref.join(',')})`;

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

        let bindIndex = 1;
        //query default
        filter.push(endDate);
        pushquery += `AND a.awb_date > $${bindIndex} `;
        bindIndex++;

        filter.push(endDate);
        pushquery += `AND a.created_time > $${bindIndex} `;
        bindIndex++;

        // query base on partnerId
        if(query.partnerId) {
          filter.push(parseInt(query.partnerId));
          pushquery += `AND pa.partner_id = $${bindIndex} `;
          bindIndex++;
        }

        // query base on excludePartnerId
        if(query.excludePartnerId) {
          filter.push(parseInt(query.excludePartnerId));
          pushquery += `AND pa.partner_id != $${bindIndex} `;
          bindIndex++;
        }

        // query base on resi status
        if(query.status) {
          filter.push(query.status.split(','));
          pushquery += `AND ai.awb_status_id_last = ANY($${bindIndex}) `;
          bindIndex++;
        }

        // query base on consigneePhone
        if(query.consigneePhone) {
          filter.push(query.consigneePhone);
          pushquery += `AND a.consignee_phone IN ($${bindIndex}) `;
          bindIndex++;
        }

        // query base on awb number
        if(query.consigneePhone) {
          filter.push(query.awbNumber);
          pushquery += `AND a.awb_number = ?$${bindIndex} `;
          bindIndex++;
        }

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
          FROM superapps.awb a 
            INNER JOIN superapps.package_type p  ON p.package_type_id = a.package_type_id
            INNER JOIN superapps.awb_item_attr ai ON a.awb_id = ai.awb_id AND ai.is_deleted = false
            LEFT JOIN superapps.awb_status aws ON aws.awb_status_id = ai.awb_status_id_last
            INNER JOIN superapps.pickup_request_detail prd  ON prd.ref_awb_number = a.awb_number
            LEFT JOIN superapps.partner pa ON pa.customer_account_id = a.customer_account_id AND pa.is_deleted=false
            LEFT JOIN superapps.temp_stt no ON no.nostt = a.awb_number AND pa.is_deleted=false
          WHERE 
            1 = 1 
            ${pushquery}
            ORDER BY awb_date DESC
            LIMIT ${limitValue} 
            OFFSET ${offsetValue}`;

        const rawData= await client.query(sql, filter)
        const results = rawData.rows.length ? rawData.rows : [];

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

      }
      finally {
        client.release()
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
