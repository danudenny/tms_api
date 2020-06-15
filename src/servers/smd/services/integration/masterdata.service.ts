import { Injectable } from '@nestjs/common';
import { MappingDoSmdResponseVm } from '../../models/mapping-do-smd.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

import moment = require('moment');
import {DoSmd} from '../../../../shared/orm-entity/do_smd';
import {OrionRepositoryService} from '../../../../shared/services/orion-repository.service';

@Injectable()
export class MasterDataService {

  static async mappingDoSMD(payload: BaseMetaPayloadVm): Promise<MappingDoSmdResponseVm> {
    // mapping field
    payload.fieldResolverMap['doSmdId'] = 't1.do_smd_id';
    payload.fieldResolverMap['doSmdCode'] = 't1.do_smd_code';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doSmdCode',
      },
    ];
    const repo = new OrionRepositoryService(DoSmd, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_smd_id', 'doSmdId'],
      ['t1.do_smd_code', 'doSmdCode'],
    );
    q.innerJoin(e => e.doSmdDetails, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(`
      t1.do_smd_id
    `);
    q.orderBy({ doSmdCode: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new MappingDoSmdResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
