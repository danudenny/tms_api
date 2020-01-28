import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { DoReturnStatusFindAllResponseVm } from '../../models/master/do-return-status.vm';

export class DoReturnStatusService {

  static async findAllList(
    payload: BaseMetaPayloadVm,
  ): Promise<DoReturnStatusFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doReturnMasterCode',
      },
      {
        field: 'doReturnMasterDesc',
      },
    ];
    // mapping field
    payload.fieldResolverMap['doReturnMasterCode'] = 'do_return_master_code';

    const q = RepositoryService.doReturnMaster.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['do_return_master.do_return_master_id', 'doReturnMasterId'],
      ['do_return_master.do_return_master_code', 'doReturnMasterCode'],
      ['do_return_master.do_return_master_desc', 'doReturnMasterDesc'],
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new DoReturnStatusFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
