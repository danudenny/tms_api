import { Injectable, Logger } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { CustomerPayloadVm } from '../../models/customer.vm';
import { CustomerFindAllResponseVm } from '../../models/customer.response.vm';
@Injectable()
export class CustomerService {

  constructor() {}
  async findCustName(
    payload: CustomerPayloadVm,
    ): Promise<CustomerFindAllResponseVm> {
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'customer_name' : payload.sortBy;
    const sortDir = isEmpty(payload.sortDir) ? 'ASC' : payload.sortDir;

    // FIXME: change to ORM
    const [query, parameters] = RawQueryService.escapeQueryWithParameters(
      `SELECT
        customer_id as "customerId",
        customer_code as "customerCode",
        customer_name as "customerName"
      FROM customer
      WHERE customer_name ILIKE '%${search}%' OR customer_code ILIKE '%${search}%'
      ORDER BY ${sortBy} ${sortDir} LIMIT :take OFFSET :offset`,
      { take, offset },
    );

    const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
      `SELECT COUNT (*) FROM customer WHERE customer_name ILIKE '%${search}%' OR customer_code ILIKE '%${search}%'`, {},
    );
    // exec raw query
    const data = await RawQueryService.query(query, parameters);
    const total = await RawQueryService.query(querycount, parameterscount);
    const result = new CustomerFindAllResponseVm();

    result.data = data;
    result.paging = MetaService.set(page, take, toInteger(total[0].count));
    return result;
    }
}
