import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { DistrictFindAllResponseVm } from '../../models/master/district.vm';

export class DistrictsService {

  static async findAllCityId(
    payload: BaseMetaPayloadVm,
    cityId: number,
  ): Promise<DistrictFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'districtCode',
      },
      {
        field: 'districtName',
      },
    ];
    // mapping field
    payload.fieldResolverMap['districtCode'] = 'district.district_code';

    const q = RepositoryService.district.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['district.district_id', 'districtId'],
      ['district.city_id', 'cityId'],
      ['district.zone_id', 'zoneId'],
      ['district.branch_id_delivery', 'branchIdDelivery'],
      ['district.branch_id_pickup', 'branchIdPickup'],
      ['district.district_code', 'districtCode'],
      ['district.district_name', 'districtName'],
    );

    q.andWhere(e => e.cityId, w => w.equals(cityId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderBy({ districtName: 'ASC'});

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new DistrictFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
