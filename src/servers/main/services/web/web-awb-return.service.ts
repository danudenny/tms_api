import { WebAwbReturnGetAwbPayloadVm, WebAwbReturnGetAwbResponseVm } from '../../models/web-awb-return.vm';
import { AwbService } from '../v1/awb.service';
import { CustomerAddress } from '../../../../shared/orm-entity/customer-address';
import { map } from 'lodash';

export class WebAwbReturnService {
  static async getAwb(
    payload: WebAwbReturnGetAwbPayloadVm,
  ): Promise<WebAwbReturnGetAwbResponseVm> {
    const address = [];
    const result = new WebAwbReturnGetAwbResponseVm();
    const awb = await AwbService.getDataPickupRequest(payload.awbNumber);
    if (awb) {
      if (awb.workOrderId) {
        address.push(awb.consigneAddress);
      } else {
        // find customer address
        const customerAddress = await CustomerAddress.find({
          where: {
            customerAccountId: awb.customerAccountId,
            isDeleted: false,
          },
        });
        if (customerAddress) {
          customerAddress.map(x => address.push(x.address));
        }
      }

      result.awbId = awb.awbId;
      result.awbNumber = awb.awbNumber;
      result.consigneName = awb.consigneName;
      result.consigneAddress = address;
      result.consigneZipCode = awb.consigneZipCode;
      result.customerAccountId = awb.customerAccountId;
      result.provinceId = awb.provinceId;
      result.cityId = awb.cityId;
      result.districtId = awb.districtId;
    }
    return result;
  }

  static async createAwbReturn(payload) {
    // TODO: create table awb
    // create table awb item
    // create table awb history;
    // create table awb return;
    return null;
  }
}
