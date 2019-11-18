import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { CityFindAllResponseVm } from '../../models/master/city.vm';

export class CitiesService {

  static async findAllProvinceId(
    payload: BaseMetaPayloadVm,
    provinceId: number,
  ): Promise<CityFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'cityCode',
      },
      {
        field: 'cityName',
      },
    ];
    // mapping field
    payload.fieldResolverMap['cityCode'] = 'city.city_code';

    const q = RepositoryService.city.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['city.city_id', 'cityId'],
      ['city.province_id', 'provinceId'],
      ['city.city_code', 'cityCode'],
      ['city.city_name', 'cityName'],
      ['city.city_type', 'cityType'],
    );

    q.andWhere(e => e.provinceId, w => w.equals(provinceId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderBy({ cityName: 'ASC'});

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new CityFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
