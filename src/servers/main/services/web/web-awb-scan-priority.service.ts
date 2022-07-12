import { WebAwbScanPriorityResponse } from '../../models/web-awb-scan-priority-response.vm';
import { PriorityServiceApi } from '../../../../shared/services/priority.service.api';
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbService } from '../v1/awb.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { ConfigService } from '../../../../shared/services/config.service';
export class WebAwbScanPriorityService {

  public static get getPackageType() {
    return ConfigService.get('priorityService.packageType');
  }

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
        if (await AwbService.isManifested(awb.awbNumber, awb.awbItemId)) {
          result.status = 'ok';
          result.message = 'success';
          if(this.getPackageType.include(dataPriority.data.packageTypeCode)){
            result.routeAndPriority = dataPriority.data.packageTypeCode+dataPriority.data.zone + dataPriority.data.priority;
          }else{
            result.routeAndPriority = dataPriority.data.zone + dataPriority.data.priority;
          }
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
      if (await AwbService.isManifested(awbNumber, awbItemId)) {
        result.status = 'ok';
        result.message = 'success';
        if(this.getPackageType.include(dataPriority.data.packageTypeCode)){
          result.routeAndPriority = dataPriority.data.packageTypeCode+dataPriority.data.zone + dataPriority.data.priority;
        }else{
          result.routeAndPriority = dataPriority.data.zone + dataPriority.data.priority;
        }
      } else {
        result.status = 'error';
        result.message = `Resi ${awbNumber} belum pernah di MANIFESTED`;
        result.routeAndPriority = dataPriority.data.zone;
      }
    }
    return result;
  }
}