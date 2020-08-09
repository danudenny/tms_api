import { Injectable } from '@nestjs/common';

import { AwbStatusFindAllResponseVm, AwbStatusNonDeliveFindAllResponseVm } from '../../models/awb-status.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { TransactionStatusResponseVm } from '../../models/master/transaction-status.vm';

@Injectable()
export class TransactionStatusService {
  constructor() {}

  static async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<TransactionStatusResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'statusName',
      },
      {
        field: 'statusTitle',
      },
    ];

    const q = RepositoryService.transactionStatus.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['transaction_status_id', 'transactionStatusId'],
      ['status_category', 'statusCategory'],
      ['status_code', 'statusCode'],
      ['status_title', 'statusTitle'],
      ['status_name', 'statusName'],
      ['status_level', 'statusLevel'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new TransactionStatusResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

}
