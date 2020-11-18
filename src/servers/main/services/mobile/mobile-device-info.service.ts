import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { MobileDeviceInfo } from '../../../../shared/orm-entity/mobile-device-info';
import { MobileDeviceInfoPayloadVm } from '../../models/mobile-device-info-payload.vm';
import {
  MobileDeviceInfoDetailResponseVm,
  MobileDeviceInfoResponseVm,
} from '../../models/mobile-device-info.response.vm';

export class MobileDeviceInfoService {
  constructor() {}

  static async getInfoById(userId: number,
    ): Promise<any> {
      const authMeta = AuthService.getAuthData();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const listData = [];
      const mobileDeviceInfoDatas = await MobileDeviceInfo.find({
        where: {
          userId,
          isDeleted: false,
        },
        order: {
          mobileDeviceInfoId: 'DESC',
        },
      });

      if (null != mobileDeviceInfoDatas && mobileDeviceInfoDatas.length > 0) {
        for (const mobileDeviceInfoData of mobileDeviceInfoDatas) {
          listData.push(await this.getDetailInfo(mobileDeviceInfoData));
        }
      }
      return listData;
  }

  static async saveInfo(
    payload: MobileDeviceInfoPayloadVm,
  ): Promise<MobileDeviceInfoResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const mobileDeviceInfoResp = new MobileDeviceInfoResponseVm();

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
      permissonPayload.branchId,
    );
    let data;
    if (null != mobileDeviceInfoData) {
      data = await MobileDeviceInfo.update(
        {
          userId: mobileDeviceInfoData.userId,
        },
        {
          ...mobileDeviceinfoDto,
        },
      );
      mobileDeviceInfoResp.message = 'successfully update data';
    } else {
      data = await MobileDeviceInfo.save(mobileDeviceinfoDto);
      mobileDeviceInfoResp.message = 'successfully saved data';
    }

    mobileDeviceInfoResp.isSucces = true;
    mobileDeviceInfoResp.userId = authMeta.userId;
    mobileDeviceInfoResp.mobileDeviceInfoId = data.mobileDeviceInfoId;

    return mobileDeviceInfoResp;
  }

  private static async getDetailInfo(
    payload: MobileDeviceInfo,
  ): Promise<MobileDeviceInfoDetailResponseVm> {
    const mobileDeviceInfoDetailResp = new MobileDeviceInfoDetailResponseVm();
    mobileDeviceInfoDetailResp.imei = payload.imei;
    mobileDeviceInfoDetailResp.manufacture = payload.manufacture;
    mobileDeviceInfoDetailResp.brand = payload.brand;
    mobileDeviceInfoDetailResp.product = payload.product;
    mobileDeviceInfoDetailResp.model = payload.model;
    mobileDeviceInfoDetailResp.token = payload.token;
    mobileDeviceInfoDetailResp.version = payload.version;
    mobileDeviceInfoDetailResp.dateTime = payload.dateTime;
    mobileDeviceInfoDetailResp.userId = payload.userId;
    mobileDeviceInfoDetailResp.branchId = payload.branchId;
    return mobileDeviceInfoDetailResp;
  }

  private static async setDetailInfo(
    payload: MobileDeviceInfoPayloadVm,
    userId: number,
    branchId: number,
  ): Promise<MobileDeviceInfo> {
    const mobileDeviceInfo = new MobileDeviceInfo();
    mobileDeviceInfo.imei = payload.imei;
    mobileDeviceInfo.manufacture = payload.manufacture;
    mobileDeviceInfo.brand = payload.brand;
    mobileDeviceInfo.product = payload.product;
    mobileDeviceInfo.model = payload.model;
    mobileDeviceInfo.token = payload.token;
    mobileDeviceInfo.version = payload.version;
    mobileDeviceInfo.dateTime = moment().toDate();
    mobileDeviceInfo.isDeleted = false;
    mobileDeviceInfo.userId = userId;
    mobileDeviceInfo.branchId = branchId;
    return mobileDeviceInfo;
  }
}
