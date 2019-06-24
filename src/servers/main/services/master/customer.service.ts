import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { CustomerPayloadVm } from '../../models/customer.vm';
import { CustomerFindAllResponseVm } from '../../models/customer.response.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';

@Injectable()
export class CustomerService {

  constructor() {}
  async findCustName(
    payload: CustomerPayloadVm,
  ): Promise<CustomerFindAllResponseVm> {
    // params
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'customer_name' : payload.sortBy;
    const sortDir = payload.sortDir === 'asc' ? 'asc' : 'desc';

    // NOTE: query with ORM
    const queryPayload = new BaseQueryPayloadVm();
    // add pagination
    queryPayload.take = take;
    queryPayload.skip = offset;
    // add sorting data
    queryPayload.sort = [
      {
        field: sortBy,
        dir: sortDir,
      },
    ];
    // add filter
    queryPayload.filter = [
      [
        {
          field: 'customer_code',
          operator: 'like',
          value: search,
        },
      ],
      [
        {
          field: 'customer_name',
          operator: 'like',
          value: search,
        },
      ],
    ];

    // add select field
    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('customer.customer_id', 'customerId');
    qb.addSelect('customer.customer_code', 'customerCode');
    qb.addSelect('customer.customer_name', 'customerName');
    qb.from('customer', 'customer');

    // exec raw query
    const data = await qb.execute();
    const total = await qb.getCount();
    const result = new CustomerFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
