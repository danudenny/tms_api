import { Injectable } from '@nestjs/common';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { BranchPayloadVm } from '../../models/branch.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { GabunganPayloadVm } from '../../models/gabungan-payload.vm';
import { GabunganFindAllResponseVm } from '../../models/gabungan.response.vm';
import { DeliveryFilterPayloadVm } from '../../models/mobile-dashboard.vm';
import { RedeliveryFindAllResponseVm } from '../../models/redelivery.response.vm';

@Injectable()
export class RedeliveryService {
  constructor() {}
  async findAllHistoryDelivery(
    payload: DeliveryFilterPayloadVm
    ): Promise<RedeliveryFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const offset = (page - 1) * take;
    const start = moment(payload.filters.startDeliveryDateTime).toDate();
    const end = moment(payload.filters.endDeliveryDateTime).toDate();

    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `select t1.history_date_time,t1.employee_id_driver,t3.username,t1.reason_id,t2.reason_code
      from do_pod_history t1 inner join reason t2 on t1.reason_id = t2.reason_id inner join users t3 on t1.employee_id_driver = t3.user_id where t1.history_date_time >= :start AND t1.history_date_time <= :end LIMIT :take OFFSET :offset`,
      { take, start,end ,offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `select count (*) from do_pod_history where history_date_time >= :start AND history_date_time <= :end `,
      {start,end},
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new RedeliveryFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
    }
}
