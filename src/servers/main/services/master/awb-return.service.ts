import moment = require('moment');
import { AwbReturn } from '../../../../shared/orm-entity/awb-return';

export class AwbReturnService {
  constructor() {}

  public static async createAwbReturn(
    awbNumber: string,
    awbId: number,
    branchId: number,
    userId: number,
    isMobileReturn: boolean,
  ): Promise<boolean> {
    // check duplicate data
    let awbReturnData = await AwbReturn.findOne({
      where: {
        originAwbNumber: awbNumber,
        isDeleted: false,
      },
    });
    if (!awbReturnData) {
      awbReturnData = AwbReturn.create({
          originAwbId: awbId,
          originAwbNumber: awbNumber,
          branchId,
          branchFromId: branchId,
          userIdCreated: userId,
          userIdUpdated: userId,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
          isMobileReturn,
      });
      await AwbReturn.insert(awbReturnData);
    } else {
      await AwbReturn.update(awbReturnData.awbReturnId, {
          branchId,
          userIdUpdated: userId,
          updatedTime: moment().toDate(),
          isMobileReturn,
      });
    }
    return true;
  }
}
