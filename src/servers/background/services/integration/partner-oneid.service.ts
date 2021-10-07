import { MoreThan, Not } from 'typeorm';
import { PartnerOneidPayloadVm, ListOneidOrderActivityResponseVm } from '../../models/partner/oneid-task.vm';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { Awb } from '../../../../shared/orm-entity/awb';
import { CustomerAccount } from '../../../../shared/orm-entity/customer-account';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { HttpStatus } from '@nestjs/common';
import { createQueryBuilder } from 'typeorm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { CustomerMembership } from '../../../../shared/orm-entity/customer-membership';
import { PickupRequest } from '../../../../shared/orm-entity/pickup-request';


export class PartnerOneidService {

  static async orderActivity(
    payload: PartnerOneidPayloadVm,
  ): Promise<ListOneidOrderActivityResponseVm> {
    const result = new ListOneidOrderActivityResponseVm();
    
    const partnerIdSst = 95;
    const dateNow = moment().toDate();
    var limit = 10;
    var offset = (payload.page-1) * limit;
    var oneId = payload.oneId;
    
    result.status = false;
    result.statusCode = HttpStatus.BAD_REQUEST;
    
    if(oneId == "" ) {
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

  static async getOrder(query){
    try {

     const endDate =  moment().subtract(30, "days").format("YYYY-MM-DD HH:mm:ss");
      const filter: any = {};

      // default filter
      filter.isDeleted = false;
     filter.awbDate =  MoreThan(endDate);
      // Pagination
      const limitValue = parseFloat(query.limit) || 10;
      const page = parseFloat(query.page);
      const offsetValue =limitValue * ((page || 1) - 1);

      // filter
      if(query.awbNumber){
        filter.awbNumber = query.awbNumber;
      }
      if(query.consigneePhone){
        filter.consigneeNumber = query.consigneePhone;
      }

      let getSenderPhone;
      if(query.senderPhone){
          getSenderPhone = await CustomerAccount.findOne( {
          select:['customerAccountId', 'mobile1'],
          where: {
            mobile1: query.senderPhone,
            customerAccountIdBilling: Not(0)
          }
        });
        filter.customerAccountId = (getSenderPhone) ? getSenderPhone.customerAccountId : 0;
      }

      const results = await Awb.find({
        select: ['awbId','awbNumber','consigneeName', 'consigneeNumber', 'consigneeAddress', 'awbDate', 'customerAccountId', 'basePrice', 'createdTime'],
        relations: ['packageType','awbStatus', 'partnerInfo','pickupRequestDetail'],
        where: filter,
        take: limitValue,
        skip: offsetValue
      });
      
      // mapping

      const mapping = [];
      for(let i = 0; i < results.length; i += 1){
        mapping.push({
          awbId: results[i].awbId,
          awbNumber: results[i].awbNumber,
          receiver: results[i].consigneeName,
          recipientAddress: results[i].consigneeAddress,
          senderName: (results[i].pickupRequestDetail) ? results[i].pickupRequestDetail.shipperName : null,
          shipperAddress: (results[i].pickupRequestDetail) ? results[i].pickupRequestDetail.shipperAddress : null,
          partnerName: (results[i].partnerInfo) ? results[i].partnerInfo.partnerName : null,
          date: results[i].awbDate,
          service: (results[i].packageType) ? results[i].packageType.packageTypeCode : null,
          price: results[i].basePrice,
          status: (results[i].awbStatus) ? results[i].awbStatus.awbStatusName : null,
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
}
