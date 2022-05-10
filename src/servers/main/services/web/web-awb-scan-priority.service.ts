import { WebAwbScanPriorityResponse } from '../../models/web-awb-scan-priority-response.vm';
import { PriorityServiceApi } from '../../../../shared/services/priority.service.api';
import { AuthService } from '../../../../shared/services/auth.service';
export class WebAwbScanPriorityService {
  static async scanProirity(awbNumber : string): Promise<WebAwbScanPriorityResponse>{
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    let dataPriority = await PriorityServiceApi.checkPriority(awbNumber, permissonPayload.branchId);
    const result = new WebAwbScanPriorityResponse();
    result.awbNumber = awbNumber;
    result.routeAndPriority = dataPriority.data.priority;
    result.kelurahan = dataPriority.data.kelurahan;
    return result;
  }
}