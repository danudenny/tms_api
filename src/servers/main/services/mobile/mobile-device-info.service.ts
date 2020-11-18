import { HttpStatus } from '@nestjs/common';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { MobileDeviceInfo } from '../../../../shared/orm-entity/mobile-device-info';
import { MobileDeviceInfoPayloadVm } from '../../models/mobile-device-info-payload.vm';
import {
  MobileDeviceInfoResponseVm,
  MobileDeviceInfoDetailResponseVm,
} from '../../models/mobile-device-info.response.vm';

export class MobileDeviceInfoService {
  constructor() {}

  static async saveInfo(
    payload: MobileDeviceInfoPayloadVm,
  ): Promise<MobileDeviceInfoResponseVm> {
    const authMeta = AuthService.getAuthData();
    const mobileDeviceInfoResp = new MobileDeviceInfoResponseVm();
    if (!!authMeta) {
      const mobileDeviceInfoData = await MobileDeviceInfo.findOne({
        where: {
          userId: authMeta.userId,
          isDeleted: false,
        },
        order: {
          mobileDeviceInfoId: 'DESC',
        },
      });
      const mobileDeviceinfoDto = await this.setDetailInfo(
        payload,
        authMeta.userId,
      );
      let result;
      if (null != mobileDeviceInfoData) {
        result = await MobileDeviceInfo.update(
          {
            mobileDeviceInfoId: mobileDeviceInfoData.mobileDeviceInfoId,
          },
          {
            ...mobileDeviceinfoDto,
          },
        );
        mobileDeviceInfoResp.message = 'sukses merubah data';
      } else {
        result = await MobileDeviceInfo.save(mobileDeviceinfoDto);
        mobileDeviceInfoResp.message = 'sukses menyimpan data';
      }

      mobileDeviceInfoResp.isSucces = true;
      mobileDeviceInfoResp.userId = authMeta.userId;
      mobileDeviceInfoResp.mobileDeviceInfoId = result.mobileDeviceInfoId;
    } else {
      RequestErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return mobileDeviceInfoResp;
  }

  private static async setDetailInfo(
    payload: MobileDeviceInfoPayloadVm,
    userId: number,
  ): Promise<MobileDeviceInfo> {
    const result = new MobileDeviceInfo();
    result.imei = payload.imei;
    result.manufacture = payload.manufacture;
    result.brand = payload.brand;
    result.product = payload.product;
    result.model = payload.model;
    result.token = payload.token;
    result.version = payload.version;
    result.dateTime = moment().toDate();
    result.isDeleted = false;
    result.userId = userId;
    return result;
  }
  // private static async setDetailInfoResponse(
  //   payload: MobileDeviceInfoPayloadVm,
  // ): Promise<MobileDeviceInfoDetailResponseVm> {
  //   const result = new MobileDeviceInfoDetailResponseVm();
  //   result.imei = payload.imei;
  //   result.manufacture = payload.manufacture;
  //   result.brand = payload.brand;
  //   result.product = payload.product;
  //   result.model = payload.model;
  //   result.token = payload.token;
  //   result.version = payload.version;
  //   return result;
  // }
}
