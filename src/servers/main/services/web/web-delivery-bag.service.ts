import { HttpStatus, Injectable } from '@nestjs/common';
import { toInteger } from 'lodash';
import moment = require('moment');

import { GetRoleResult } from '../../../../shared/models/get-role-result';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { WebDeliveryFindAllResponseVm } from '../../models/web-delivery.response.vm';
import { WebDeliveryFilterPayloadVm } from '../../models/web-delivery.vm';

@Injectable()
// TODO: to be remove
export class WebDeliveryBagService {
  constructor() {}
  async findallbagdelivery(
    payload: WebDeliveryFilterPayloadVm,
    ): Promise<WebDeliveryFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;

    const offset = (page - 1) * take;
    const start = moment(payload.filters.startDeliveryDateTime).toDate();
    const end = moment(payload.filters.endDeliveryDateTime).toDate();

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      'select awb_id as "awbId", awb_number as "awbNumber",ref_customer_account_id as "merchant", consignee_name as "consigneeName",consignee_address as "consigneeAddress",consignee_phone as "consigneeNumber" ,is_cod as "isCOD" from awb where awb_date >= :start AND awb_date <= :end LIMIT :take OFFSET :offset',
      { take, start, end , offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      'select count (*) from awb where awb_date >= :start AND awb_date <= :end ',
      { start, end  },
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new WebDeliveryFindAllResponseVm();

    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
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
      RequestErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
