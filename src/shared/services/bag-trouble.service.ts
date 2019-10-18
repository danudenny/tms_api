import { AuthService } from './auth.service';
import { BagTrouble } from '../orm-entity/bag-trouble';
import { CustomCounterCode } from './custom-counter-code.service';

import moment = require('moment');

export class BagTroubleService {

  static async create(bagNumber: string, bagStatusId: number) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    // NOTE: add to bag trouble
    const bagTroubleCode = await CustomCounterCode.bagTrouble(timeNow);
    const bagTrouble = BagTrouble.create({
      bagNumber,
      bagTroubleCode,
      bagStatusId,
      bagTroubleStatus: 100,
      employeeId: authMeta.employeeId,
      branchId: permissonPayload.branchId,
    });
    await BagTrouble.save(bagTrouble);
  }

}
