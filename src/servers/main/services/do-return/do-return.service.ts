import { Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { ReturnFindAllResponseVm } from '../../models/do-return.response.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoReturnAwb } from '../../../../shared/orm-entity/do_return_awb';
import { MetaService } from '../../../../shared/services/meta.service';

@Injectable()
export class DoReturnService {
  static async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<ReturnFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['createdTime'] = 'return.created_time';
    payload.fieldResolverMap['branchName'] = 'branch.branch_name';
    payload.fieldResolverMap['branchIdLast'] = 'return.branch_id_last';
    payload.fieldResolverMap['createdTime'] = 'return.created_time';
    const repo = new OrionRepositoryService(DoReturnAwb, 'return');

    // const q = repo.findAllRaw();
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['return.do_return_awb_id', 'doReturnAwbId'],
      ['return.awb_number', 'awbNumber'],
      ['return.do_return_awb_number', 'doReturnAwbNumber'],
      ['return.pod_datetime', 'podDatetime'],
      ['branch.branch_name', 'branchName'],
      ['customer.customer_name', 'customerName'],
      ['awb_status.awb_status_title', 'awbStatus'],
      ['return.branch_id_last', 'branchIdLast'],
      ['return.do_return_admin_to_ct_id', 'doReturnAdminToCtId'],
      ['return.do_return_ct_to_collection_id', 'doReturnCtToCollectionId'],
      ['return.do_return_collection_to_cust_id', 'doReturnCollectionToCustId'],
    );
    q.innerJoin(e => e.branchTo, 'branch', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.customer, 'customer', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbStatusDetail, 'awb_status', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ReturnFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
