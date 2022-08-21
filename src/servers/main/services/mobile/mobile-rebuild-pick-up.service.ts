import { MobileRebuildPickUpServiceResponse } from '../../models/mobile-rebuild-pick-up-response.vm';
import { MobileRebuildPickUpServicePayload } from '../../models/mobile-rebuild-pick-up-payload.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { createQueryBuilder } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import axios from 'axios';
import { ConfigService } from '../../../../shared/services/config.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { HttpStatus } from '@nestjs/common';

export class MobileRebuildPickUpService {
  public static get rebuildPickupServiceURL() {
    return ConfigService.get('rebuildPickupService.baseUrl');
  }

  static async getDeliveryandCodAmount(payload: MobileRebuildPickUpServicePayload): Promise<MobileRebuildPickUpServiceResponse> {
    const authMeta = AuthService.getAuthData();
    const q = createQueryBuilder();
    q.addSelect('c.total_cod_value');
    q.from('do_pod_deliver', 'a');
    q.innerJoin('do_pod_deliver_detail', 'b', 'a.do_pod_deliver_id = b.do_pod_deliver_id');
    q.innerJoin('awb', 'c', 'b.awb_id = c.awb_id');
    q.andWhere(`a.user_id_driver = ${authMeta.userId}`);
    q.andWhere(`b.awb_status_id_last = ${AWB_STATUS.DLV}`)
    q.andWhere(`a.do_pod_deliver_date >='${payload.dateStart}'`);
    q.andWhere(`a.do_pod_deliver_date <= '${payload.dateEnd}'`);
    const data = await q.getRawMany();
    const result = new MobileRebuildPickUpServiceResponse();
    let hitungData = 0;
    let totalCod = 0;

    for (let i = 0; i < data.length; i++) {
      hitungData = hitungData + 1;
      totalCod = totalCod + parseInt(data[i].total_cod_value)
    }

    result.codAmount = totalCod
    result.delivery = hitungData
    return result;
  }

  static async getPickupAmount(date_start: string, date_end: string) {
    let url = `${this.rebuildPickupServiceURL}work-order/count-pickup`;
    const authMeta = AuthService.getAuthData();
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'employeid': authMeta.employeeId
      },
      params :{
        date_start : date_start,
        date_end : date_end,
      }
    };

    try {
      //TODO: Implement service priority here
      const request = await axios.get(url, options);
      return request;
    } catch (err) {
      RequestErrorService.throwObj(
        {
          message: 'Error while hit service priority',
          error: err
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}