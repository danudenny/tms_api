// #region import
import { BadRequestException } from '@nestjs/common';
import { createQueryBuilder } from 'typeorm';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfigService } from 'src/shared/services/config.service';
import { SmdAwbSortPayloadVm, SmdAwbSortResponseVm } from '../../models/smd-awb-sort.vm';
import { Awb } from 'src/shared/orm-entity/awb';
// #endregion
export class SmdAwbFilterService {
  constructor() {}

  static async sortAwbHub(
    payload: SmdAwbSortPayloadVm,
  ): Promise<SmdAwbSortResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new SmdAwbSortResponseVm();

    const awb = await Awb.findOne({
      select: ['awbId', 'awbNumber', 'toId'],
      where: {
        awbNumber: payload.awbNumber,
        isDeleted: false,
      },
    });

    if (awb) {
      if (awb.toId) {
        const qb = createQueryBuilder();
        qb.addSelect('d.district_name', 'districtName');
        qb.addSelect('c.city_code', 'cityCode');
        qb.addSelect('c.city_name', 'cityName');
        qb.addSelect('a.attachment_path', 'attachmentPath');
        qb.from('district', 'd');
        qb.innerJoin(
          'city',
          'c',
          'd.city_id = c.city_id AND c.is_deleted = false',
        );
        qb.leftJoin(
          'attachment',
          'a',
          'a.attachment_id = c.city_sound_url AND a.is_deleted = false',
        );
        qb.where(
          'd.district_id = :districtId AND d.is_deleted = false',
          {
            districtId: awb.toId,
          },
        );
        qb.limit(1);
        const data = await qb.getRawOne();
        if (data) {
          // NOTE: sample sound path
          // https://sicepattesting.s3.amazonaws.com/
          // city/sound/PSwjOTU_NCwkLCM5MSo5IzcSNCIzOD0oPjkPf2B_YH1mfGF8YBJif2R8YRISLD4pJSM3bRIsMiw7LD5jPT1j
          if (data.attachmentPath) {
            result.urlSound = `${ConfigService.get(
              'cloudStorage.cloudUrl',
            )}/${data.attachmentPath}`;
          }

          result.city = {
            key: data.cityCode,
            value: data.cityName,
          };
        } else {
          throw new BadRequestException(
            `Data resi ${payload.awbNumber}, tujuan tidak ditemukan!`,
          );
        }
      } else {
        throw new BadRequestException(
          `Data resi ${payload.awbNumber}, tidak memiliki tujuan!`,
        );
      }
      result.awbNumber = payload.awbNumber;
      return result;
    } else {
      throw new BadRequestException(
        `Data resi ${payload.awbNumber}, tidak ditemukan!`,
      );
    }
  }
}
