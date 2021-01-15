import { PartnerOneidPayloadVm, ListOneidOrderActivityResponseVm } from '../../models/partner/oneid-task.vm';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { HttpStatus } from '@nestjs/common';
import { createQueryBuilder } from 'typeorm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { MetaService } from '../../../../shared/services/meta.service';


export class PartnerOneidService {

  static async orderActivity(
    payload: PartnerOneidPayloadVm,
  ): Promise<ListOneidOrderActivityResponseVm> {
    const result = new ListOneidOrderActivityResponseVm();

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
    payload.fieldResolverMap['partnerId'] = 'p.partner_id';
    payload.fieldResolverMap['awbHistoryDateLast'] = 'aia.awb_history_date_last';
    payload.fieldResolverMap['email'] = 'awb.email_merchant';

    const q = RepositoryService.awbItemAttr.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['awb.awb_number', 'awbNumber'],
      ['p.partner_id', 'partnerId'],
      ['p.partner_name', 'partnerName'],
      ['awb.consignee_name', 'consigneeName'],
      ['awb.total_item_price', 'totalItemPrice'],
      ['asg.awb_status_grp_id', 'awbStatusGrpId'],
      ['asg.awb_status_grp_name', 'awbStatusGrpName'],
      ['aia.awb_status_id_last', 'awbStatusIdLast'],
      ['aia.awb_history_date_last', 'awbHistoryDateLast'],
      ['pt.package_type_name', 'packageTypeName'],
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    q.innerJoin(e => e.awb, 'awb', j => 
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.customerAccount, 'ca', j => 
      j
        .andWhere(e => e.oneId, w => w.equals(oneId))
        .andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.customerAccount.partner, 'p', j => 
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awbStatusGrpDetail.awbStatusGrp, 'asg', j => 
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.awb.packageType, 'pt', j => 
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip()

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);
    result.status = true;
    result.statusCode = HttpStatus.OK;
    result.message = "Success";
    return result;
  }
}
