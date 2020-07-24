import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { PackageTypeResponseVm } from '../../models/master/package-type.vm';

@Injectable()
export class PackageTypeService {
  constructor() {}

  static async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<PackageTypeResponseVm> {

    const q = RepositoryService.packageType.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['package_type_id', 'packageTypeId'],
      ['package_type_code', 'packageTypeCode'],
      ['package_type_name', 'packageTypeName'],
      ['min_weight', 'minWeight'],
      ['weight_rounding_const', 'weightRoundingConst'],
      ['weight_rounding_up_global', 'weightRoundingUpGlobal'],
      ['weight_rounding_up_detail', 'weightRoundingUpDetail'],
      ['divider_volume', 'dividerVolume'],
      ['lead_time_min_days', 'leadTimeMinDays'],
      ['lead_time_max_days', 'leadTimeMaxDays'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new PackageTypeResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

}
