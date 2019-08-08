import { HttpStatus, Injectable } from '@nestjs/common';
import { toInteger } from 'lodash';
import moment = require('moment');

import { GetRoleResult } from '../../../../shared/models/get-role-result';
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { WebDeliveryListFilterPayloadVm } from '../../models/web-delivery-payload.vm';
import { WebScanInListResponseVm } from '../../models/web-scanin-list.response.vm';

@Injectable()
export class WebDeliveryListService {
  constructor() {}
  async findAllDeliveryList(
    payload: WebDeliveryListFilterPayloadVm,
    ): Promise<WebScanInListResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;

    const offset = (page - 1) * take;
    const start = moment(payload.filters.startDeliveryDateTime).toDate();
    const end = moment(payload.filters.endDeliveryDateTime).toDate();

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      'select pod_scanin_date_time as "podScaninDateTime", awb_id as "awbId",branch_id as "branchId", user_id as "employeId" from pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end LIMIT :take OFFSET :offset',
      { take, start, end , offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      'select count (*) from pod_scan where pod_scanin_date_time >= :start AND pod_scanin_date_time <= :end ',
      { start, end },
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new WebScanInListResponseVm();

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
