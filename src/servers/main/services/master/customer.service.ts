import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { CustomerFindAllResponseVm } from '../../models/customer.response.vm';

@Injectable()
export class CustomerService {
  constructor() {}
  async findCustName(
    payload: BaseMetaPayloadVm,
  ): Promise<CustomerFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'customerCode',
      },
      {
        field: 'customerName',
      },
    ];

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('customer.customer_id', 'customerId');
    qb.addSelect('customer.customer_code', 'customerCode');
    qb.addSelect('customer.customer_name', 'customerName');
    qb.from('customer', 'customer');

    const total = await qb.getCount();

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new CustomerFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
