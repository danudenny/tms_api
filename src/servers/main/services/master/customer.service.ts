import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { CustomerFindAllResponseVm } from '../../models/customer.response.vm';

@Injectable()
export class CustomerService {
  async findAllByRequest(
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

    const q = RepositoryService.customer.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['customer.customer_id', 'customerId'],
      ['customer.customer_code', 'customerCode'],
      ['customer.customer_name', 'customerName'],
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new CustomerFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
