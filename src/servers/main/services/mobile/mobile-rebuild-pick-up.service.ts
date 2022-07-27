import { MobileRebuildPickUpServiceResponse } from '../../models/mobile-rebuild-pick-up-response.vm';
import { MobileRebuildPickUpServicePayload } from '../../models/mobile-rebuild-pick-up-payload.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { createQueryBuilder } from 'typeorm';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';

export class MobileRebuildPickUpService {
  static async getDeliveryandCodAmount(payload: MobileRebuildPickUpServicePayload): Promise<MobileRebuildPickUpServiceResponse> {
    const authMeta = AuthService.getAuthData();
    const q = createQueryBuilder();
    q.addSelect('a.total_cod_value');
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
}