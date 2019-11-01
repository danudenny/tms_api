import { AuthService } from '../../../../shared/services/auth.service';
import {
    AwbDeliverManualResponseVm, WebAwbDeliverGetPayloadVm, WebAwbDeliverGetResponseVm,
} from '../../models/web-awb-deliver.vm';
import { AwbService } from '../v1/awb.service';

export class WebAwbDeliverService {
  constructor() {
  }

  static async getAwbDeliver(
    payload: WebAwbDeliverGetPayloadVm,
  ): Promise<WebAwbDeliverGetResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebAwbDeliverGetResponseVm();
    const data: AwbDeliverManualResponseVm[] = [];

    for (const awbNumber of payload.awbNumber) {
      const awbManual = new AwbDeliverManualResponseVm();
      const awb = await AwbService.getDataDeliver(awbNumber, authMeta.userId);
      if (awb) {
        // TODO: check to table do pod deliver
        awbManual.awb = awb;
        awbManual.status = 'ok';
        awbManual.message = 'success';
      } else {
        awbManual.status = 'error';
        awbManual.message = `Resi ${awbNumber} tidak ditemukan`;
      }

      // const awbDeliver = new AwbDeliverManualVm();
      data.push(awbManual);
    } // end of loop

    result.data = data;
    return result;
  }
}
