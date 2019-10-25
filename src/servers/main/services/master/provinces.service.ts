import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { ProvinceFindAllResponseVm } from '../../models/master/province.vm';

export class ProvincesService {

  static async findAllCountryId(
    payload: BaseMetaPayloadVm,
    countryId: number,
  ): Promise<ProvinceFindAllResponseVm> {
    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'province_code',
    //   },
    //   {
    //     field: 'province_name',
    //   },
    // ];
    // mapping field
    payload.fieldResolverMap['provinceCode'] = 'province.province_code';

    const q = RepositoryService.province.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['province.province_id', 'provinceId'],
      ['province.province_code', 'provinceCode'],
      ['province.province_name', 'provinceName'],
    );

    q.andWhere(e => e.countryId, w => w.equals(countryId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderBy({ provinceName: 'ASC'});

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ProvinceFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
