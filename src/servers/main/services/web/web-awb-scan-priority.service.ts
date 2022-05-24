import { WebAwbScanPriorityResponse } from '../../models/web-awb-scan-priority-response.vm';
import { PriorityServiceApi } from '../../../../shared/services/priority.service.api';
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbService } from '../v1/awb.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
export class WebAwbScanPriorityService {
  static async scanPriority(awbNumber: string, isValidated: boolean = false, awbItemId : number  = 0): Promise<WebAwbScanPriorityResponse> {
    //validasi manifest

    const result = new WebAwbScanPriorityResponse();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    if (isValidated == true) {
      const awb = await AwbItemAttr.findOne({
        select :['awbNumber','awbItemId'],
        where :{
          awbNumber : awbNumber,
          isDeleted : false,
        }
      });

      if (awb) {
        const dataPriority = await PriorityServiceApi.checkPriority(awbNumber, permissonPayload.branchId);
        result.awbNumber = awbNumber;
        result.kelurahan = dataPriority.data.kelurahan;
        if (await AwbService.isManifestedNew(awb.awbNumber, awb.awbItemId)) {
          result.status = 'ok';
          result.message = 'success';
          result.routeAndPriority = dataPriority.data.zone + dataPriority.data.priority;
        } else {
          result.status = 'error';
          result.message = `Resi ${awbNumber} belum pernah di MANIFESTED`;
          result.routeAndPriority = dataPriority.data.zone;
        }
      } else {
        result.status = 'error';
        result.message = `Resi ${awbNumber} tidak ditemukan`;
      }
    }else{
      let dataPriority = await PriorityServiceApi.checkPriority(awbNumber, permissonPayload.branchId);
      result.awbNumber = awbNumber;
      result.kelurahan = dataPriority.data.kelurahan;
      if (await AwbService.isManifestedNew(awbNumber, awbItemId)) {
        result.status = 'ok';
        result.message = 'success';
        result.routeAndPriority = dataPriority.data.zone + dataPriority.data.priority;
      } else {
        result.status = 'error';
        result.message = `Resi ${awbNumber} belum pernah di MANIFESTED`;
        result.routeAndPriority = dataPriority.data.zone;
      }
    }
    return result;
  }
}