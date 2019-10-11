import { EntityRepository, Repository } from 'typeorm';

import { DoPod } from '../orm-entity/do-pod';
import { OrionRepositoryService } from '../services/orion-repository.service';

@EntityRepository(DoPod)
export class DoPodRepository extends Repository<DoPod> {

  static async getDataById(doPodId: string) {
    const doPodRepository = new OrionRepositoryService(DoPod);
    const q = doPodRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branch);
    q.leftJoin(e => e.branchTo);
    q.leftJoin(e => e.userDriver);

    q.select({
      doPodId: true,
      doPodCode: true,
      doPodMethod: true,
      doPodType: true,
      description: true,
      vehicleNumber: true,
      userIdDriver: true,
      userIdCreated: true,
      totalScanOutAwb: true,
      totalScanOutBag: true,
      transactionStatus: {
        transactionStatusId: true,
        statusCategory: true,
        statusTitle: true,
      },
      branch: {
        branchId: true,
        branchCode: true,
        branchName: true,
      },
      branchTo: {
        branchId: true,
        branchCode: true,
        branchName: true,
      },
      userDriver: {
        userId: true,
        username: true,
        employee: {
          employeeId: true,
          employeeName: true,
        },
      },
      userCreated: {
        userId: true,
        username: true,
        employee: {
          employeeId: true,
          employeeName: true,
        },
      },
    });
    q.where(e => e.doPodId, w => w.equals(doPodId));
    q.andWhere(e => e.isDeleted, w => w.equals(false));
    return await q.exec();
  }
}
