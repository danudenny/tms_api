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
      select: ['awbId', 'awbNumber', 'consigneeZip', 'toId', 'consigneeDistrict'],
      where: {
        awbNumber: payload.awbNumber,
        isDeleted: false,
      },
    });

    if (awb) {
      switch (payload.type) {
        case 'subDistrict':
          // key: kode pos
          // value: nama gerai
          // suara gerai
          if (awb.consigneeZip) {
            const qb = createQueryBuilder();
            qb.addSelect('sd.sub_district_id', 'subDistrictId');
            qb.addSelect('sd.sub_district_name', 'subDistrictName');
            qb.addSelect('b.branch_code', 'branchCode');
            qb.addSelect('b.branch_name', 'branchName');
            qb.addSelect('a.attachment_path', 'attachmentPath');
            qb.from('sub_district', 'sd');
            qb.innerJoin(
              'branch_sub_district',
              'bsd',
              'bsd.sub_district_id = sd.sub_district_id AND bsd.is_deleted = false',
            );
            qb.innerJoin(
              'branch',
              'b',
              'b.branch_id = bsd.branch_id AND b.is_deleted = false',
            );
            qb.leftJoin(
              'attachment',
              'a',
              'a.attachment_id = b.branch_sound_url AND a.is_deleted = false',
            );
            qb.where(
              'sd.zip_code = :zipCode AND sd.is_deleted = false AND sd.is_active = true',
              {
                zipCode: awb.consigneeZip,
              },
            );
            qb.orderBy('a.attachment_path');
            qb.limit(1);
            const data = await qb.getRawOne();
            if (data) {
              // NOTE: sample sound path
              // https://sicepattesting.s3.amazonaws.com/
              // branch/sound/PSwjOTU_NCwkLCM5MSo5IzcSNCIzOD0oPjkPf2B_YH1mfGF8YBJif2R8YRISLD4pJSM3bRIsMiw7LD5jPT1j
              if (data.attachmentPath) {
                result.urlSound = `${ConfigService.get(
                  'cloudStorage.cloudUrl',
                )}/${data.attachmentPath}`;
              }

              result.subDistrict = {
                key: awb.consigneeZip,
                value: data.branchName,
              };
            } else {
              throw new BadRequestException(
                `Data resi ${payload.awbNumber}, kode pos ${awb.consigneeZip} belum memiliki gerai!`,
              );
            }
          } else {
            // TODO: check toId
            throw new BadRequestException(
              `Data resi ${payload.awbNumber}, tidak memiliki kode pos!`,
            );
          }
          break;
        case 'city':
          // TODO:
          // key: kode kota
          // value: nama kota
          // suara kota
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
          break;
        default:
          throw new BadRequestException('Params Type, tidak valid!');
      } // end of switch
      result.awbNumber = payload.awbNumber;
      result.type = payload.type;
      return result;
    } else {
      throw new BadRequestException(
        `Data resi ${payload.awbNumber}, tidak ditemukan!`,
      );
    }
  }
}
