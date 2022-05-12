import { WebAwbScanPriorityResponse } from '../../models/web-awb-scan-priority-response.vm';
import { PriorityServiceApi } from '../../../../shared/services/priority.service.api';
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbService } from '../v1/awb.service';
export class WebAwbScanPriorityService {
  static async scanProirity(awbNumber : string): Promise<WebAwbScanPriorityResponse>{
    //validasi manifest
    const awb = await AwbService.validAwbNumber(awbNumber);
    const result = new WebAwbScanPriorityResponse();
    if(awb){
      const permissonPayload = AuthService.getPermissionTokenPayload();
      let dataPriority = await PriorityServiceApi.checkPriority(awbNumber, permissonPayload.branchId);
      result.awbNumber = awbNumber;
      result.kelurahan = dataPriority.data.kelurahan;
      if(await AwbService.isManifested(awb.awbNumber, awb.awbItemId)){
        result.status = 'ok';
        result.message = 'success';
        result.routeAndPriority = dataPriority.data.zone+dataPriority.data.priority;
      }else{
        result.status = 'error';
        result.message = `Resi ${awbNumber} belum pernah di MANIFESTED`;
        result.routeAndPriority = dataPriority.data.zone;
      }
    }else{
      result.status = 'error';
      result.message = `Resi ${awbNumber} tidak ditemukan`;
    }
    return result;
  }
}