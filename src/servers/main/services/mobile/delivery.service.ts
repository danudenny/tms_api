import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { GetRoleResult } from '../../../../shared/models/get-role-result';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { toInteger } from 'lodash';
import { MobileDeliveryFindAllResponseVm } from '../../models/mobile-delivery.response.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { Awb } from '../../../../shared/orm-entity/awb';
import { DeliveryFilterPayloadVm } from '../../models/mobile-dashboard.vm';


@Injectable()
export class MobileDeliveryService {
  constructor() {}
  async findalldelivery(
    payload: DeliveryFilterPayloadVm,
    ): Promise<MobileDeliveryFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;

    const offset = (page - 1) * take;
    const start = moment(payload.filters.startDeliveryDateTime).toDate();
    const end = moment(payload.filters.endDeliveryDateTime).toDate();

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
    `select
      t4.awb_id as "awbId",
      t4.awb_date as "awbDate",
      t4.awb_number as "awbNumber",
      t4.ref_customer_account_id as "merchant",
      t4.consignee_name as "consigneeName",
      t4.consignee_address as "consigneeAddress ",
      t4.consignee_phone as "consigneeNumber",
      t4.is_cod as "isCOD",
      t5.package_type_name as "packageTypeName",
      t6.awb_status_name as "awbStatusName",
      array_to_json(t13."data") as "redeliveryHistory"
    from
      do_pod t1
    inner join do_pod_detail t2 on t1.do_pod_id = t2.do_pod_id
    inner join awb_item t3 on t2.awb_item_id = t3.awb_item_id
    inner join awb t4 on t3.awb_id = t4.awb_id
    inner join package_type t5 on t4.package_type_id = t5.package_type_id
    inner join awb_status t6 on t4.awb_status_id_last = t6.awb_status_id
    left join lateral (
      select array(
        select row_to_json(row)
        from
        (
          select
            t10.history_date_time as "historyDateTime",
            t11.reason_code as "reasonCode",
            t12.fullname as "employeeName"
          from
            do_pod_history t10
          left join lateral (
            select
              t11.reason_code
            from
              reason t11
            where
              t11.reason_id = t10.reason_id
          ) t11 on true
          inner join lateral (
            select
              t12.fullname
            from
              employee t12
            where
              t12.employee_id = t10.employee_id_driver
          ) t12 on true
          where
            t10.do_pod_id = t1.do_pod_id
        ) row
      ) "data"
    ) t13 on true
    where t1.do_pod_date_time >= :start AND t1.do_pod_date_time <= :end LIMIT :take OFFSET :offset`,
      {take, start, end, offset},
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      'select count (*) from do_pod where do_pod_date_time >= :start AND do_pod_date_time <= :end ',
      { start, end },
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new MobileDeliveryFindAllResponseVm();

    // condition data
    if (data.length > 0) {

      result.data = data;
      result.paging = MetaService.set(page, take, toInteger(total[0].count));
      return result;

    } else {
      ContextualErrorService.throw(
        {
          message: 'DATA_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async permissionRoles(): Promise<GetRoleResult> {
    const authMeta = AuthService.getAuthMetadata();
    // const user = await this.userRepository.findByUserIdWithRoles());
    // check user present
    if (!!authMeta) {
      // Populate return value
      const result = new GetRoleResult();
      result.userId = authMeta.userId;
      result.username = authMeta.username;
      result.email = authMeta.email;
      result.displayName = authMeta.displayName;

      return result;
    } else {
      ContextualErrorService.throw(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
