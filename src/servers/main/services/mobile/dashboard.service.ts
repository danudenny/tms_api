import { HttpStatus, Injectable, Query, Logger } from '@nestjs/common';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { GetRoleResult } from '../../../../shared/models/get-role-result';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { toInteger } from 'lodash';
import { MobileDeliveryFindAllResponseVm } from '../../models/mobile-delivery.response.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { MobileDashboardFindAllResponseVm } from '../../models/mobile-dashboard.response.vm';
import _ from 'lodash';

@Injectable()
export class DashboardService {
  constructor() {}
  async findalldashboard(
    // payload: DeliveryFilterPayloadVm
    ): Promise<MobileDashboardFindAllResponseVm> {
      // const today = moment().format("YYYY-MM-DD HH:mm:ss");
      const thisweek =  moment().subtract(7,'d').format('YYYY-MM-DD HH:mm:ss');
      const starttoday = "2019-02-02 00:00:00"

      const endtoday = "2019-02-03 00:00:00"
      const [querytodaycod, parameters] = RawQueryService.escapeQueryWithParameters(
      'select sum (total_cod_value) as todayawbcod from awb where awb_date >= :starttoday AND awb_date <=:endtoday',
      {starttoday,endtoday},
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      'select count (is_cod )as is_cod from awb where awb_date >= :starttoday AND awb_date <=:endtoday',
      {starttoday,endtoday},
    );
    // exec raw query
    const data = await RawQueryService.query(querytodaycod, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new MobileDashboardFindAllResponseVm();
    let res = [];

    total.forEach((itm, i) => {
      res.push(Object.assign({}, itm, data[i]));
    });
    result.data = res;
    return result;
  }

  // async permissionRoles(): Promise<GetRoleResult> {
  //   const authMeta = AuthService.getAuthMetadata();
  //   // const user = await this.userRepository.findByUserIdWithRoles());
  //   // check user present
  //   if (!!authMeta) {
  //     // Populate return value
  //     const result = new GetRoleResult();
  //     result.userId = authMeta.userId;
  //     result.username = authMeta.username;
  //     result.email = authMeta.email;
  //     result.displayName = authMeta.displayName;

  //     return result;
  //   } else {
  //     ContextualErrorService.throw(
  //       {
  //         message: 'global.error.USER_NOT_FOUND',
  //       },
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }
}
