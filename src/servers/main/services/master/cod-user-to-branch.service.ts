import { CodUserBranchAddPayloadVm, CodUserBranchAddResponseVm } from '../../models/master/cod-user-to-branch.vm';
import { BadRequestException } from '@nestjs/common';
import { CodUserToBranch } from '../../../../shared/orm-entity/cod-user-to-branch';

export class CodUserToBranchService {
  static async userBranchAdd(
    payload: CodUserBranchAddPayloadVm,
  ): Promise<CodUserBranchAddResponseVm> {
    if (payload.branchIds.length) {
      let totalSuccess = 0;
      for (const branchId of payload.branchIds) {
        // find double data
        const checkData = await CodUserToBranch.findOne({
          userId: payload.userId,
          branchId,
          isDeleted: false,
        });

        if (!checkData) {
          // insert data
          await CodUserToBranch.insert({
            userId: payload.userId,
            branchId,
          });
          totalSuccess += 1;
        }
      } // end of loop
      // response
      const result = new CodUserBranchAddResponseVm();
      result.status = 'ok';
      result.message = 'success';
      result.totalBranch = totalSuccess;
      return result;
    } else {
      throw new BadRequestException(
        'Gerai tidak boleh kosong, pilih salah satu!',
      );
    }
  }

}
