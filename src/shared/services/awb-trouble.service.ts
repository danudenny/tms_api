import { AuthService } from './auth.service';
import { CustomCounterCode } from './custom-counter-code.service';
import moment = require('moment');
import { AwbTrouble } from '../orm-entity/awb-trouble';
import { Branch } from '../orm-entity/branch';

export class AwbTroubleService {

  public static async fromScanOut(
    awbNumber: string,
    branchNameLast: string,
    awbStatusIdLast: number,
  ) {
    const authMeta = AuthService.getAuthData();

    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    // get branch name
    const branchLogin = await Branch.findOne({
      select: ['branchName'],
      cache: true,
      where: {
        branchId: permissonPayload.branchId,
      },
    });

    // save data to awb_trouble
    const awbTroubleCode = await CustomCounterCode.awbTrouble(timeNow);
    const troubleDesc = `Scan In Resi ${awbNumber} pada Gerai ${branchLogin.branchName}` +
      `Bermasalah karena Resi belum di scan out / salah scan in pada ${branchNameLast}`;

    // TODO:
    // Employee_Id
    const awbTrouble = AwbTrouble.create({
      awbNumber,
      awbTroubleCode,
      awbTroubleStatusId: 100,
      awbStatusId: awbStatusIdLast,
      employeeIdTrigger: authMeta.employeeId,
      branchIdTrigger: permissonPayload.branchId,
      troubleCategory: 'scan_out',
      troubleDesc,
    });
    return await AwbTrouble.save(awbTrouble);
  }

  public static async fromScanIn() {
    // TODO:
  }

}
