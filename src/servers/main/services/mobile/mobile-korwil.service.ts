import { createQueryBuilder } from 'typeorm';
import { AuthService } from '../../../../shared/services/auth.service';
import { BranchListKorwilResponseVm } from '../../models/mobile-korwil-response.vm';

export class MobileKorwilService {
  public static async getBranchList()
  : Promise <BranchListKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    // Branch list dari user role korwil
    const qb = createQueryBuilder();
    qb.addSelect('b.branch_id', 'branchId');
    qb.addSelect('b.branch_name', 'branchName');
    qb.from('user_to_branch', 'utb');
    qb.innerJoin('branch',
      'b',
      'b.branch_id = utb.ref_branch_id AND b.is_deleted = false'
    );
    qb.where('utb.is_deleted = false');
    qb.andWhere('utb.ref_user_id = :userId', { userId: authMeta.userId });

    const result = new BranchListKorwilResponseVm();
    result.branchList = await qb.getRawMany();

    return result;
  }
}
