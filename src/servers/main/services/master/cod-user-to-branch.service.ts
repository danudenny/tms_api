import { CodUserBranchAddPayloadVm, CodUserBranchAddResponseVm, CodUserBranchListtResponseVm, CodUserBranchRemoveResponseVm, CodUserBranchRemovePayloadVm } from '../../models/master/cod-user-to-branch.vm';
import { BadRequestException } from '@nestjs/common';
import { CodUserToBranch } from '../../../../shared/orm-entity/cod-user-to-branch';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { AuthService } from '../../../../shared/services/auth.service';
import moment = require('moment');

export class CodUserToBranchService {
  constructor() {}

  static async add(
    payload: CodUserBranchAddPayloadVm,
  ): Promise<CodUserBranchAddResponseVm> {
    const authMeta = AuthService.getAuthData();
    const timestamp = moment().toDate();

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
            userIdCreated: authMeta.userId,
            userIdUpdated: authMeta.userId,
            createdTime: timestamp,
            updatedTime: timestamp,
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

  static async remove(
    payload: CodUserBranchRemovePayloadVm,
  ): Promise<CodUserBranchRemoveResponseVm> {
    if (payload.codUserToBranchIds.length) {
      for (const codUserToBranchId of payload.codUserToBranchIds) {
        const checkData = await CodUserToBranch.findOne({
          codUserToBranchId,
          isDeleted: false,
        });
        if (checkData) {
          // hard delete
          await CodUserToBranch.delete({
            codUserToBranchId,
          });
        }
      }
      const result = new CodUserBranchRemoveResponseVm();
      result.status = 'ok';
      result.message = 'success';
      return result;
    } else {
      throw new BadRequestException(
        'tidak boleh kosong, pilih salah satu!',
      );
    }
  }

  static async findAll(
    payload: BaseMetaPayloadVm,
  ): Promise<CodUserBranchListtResponseVm> {
    // mapping search field and operator default ilike
    // payload.globalSearchFields = [
    //   {
    //     field: 'statusName',
    //   },
    //   {
    //     field: 'statusTitle',
    //   },
    // ];
    // mapping field
    payload.fieldResolverMap['userId'] = 't1.user_id';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';

    const repo = new OrionRepositoryService(CodUserToBranch, 't1');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.cod_user_to_branch_id', 'codUserToBranchId'],
      ['t1.user_id', 'userId'],
      ['t1.branch_id', 'branchId'],
      ['t2.username', 'username'],
      ['t2.first_name', 'firstName'],
      ['t3.branch_code', 'branchCode'],
      ['t3.branch_name', 'branchName'],
    );
    q.innerJoin(e => e.user, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new CodUserBranchListtResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);
    return result;
  }
}
