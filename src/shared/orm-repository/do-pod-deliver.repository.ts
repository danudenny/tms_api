import { EntityRepository, Repository } from 'typeorm';

import { OrionRepositoryService } from '../services/orion-repository.service';
import { DoPodDeliver } from '../orm-entity/do-pod-deliver';

@EntityRepository(DoPodDeliver)
export class DoPodDeliverRepository extends Repository<DoPodDeliver> {

  static async getDataById(doPodDeliverId: string) {
    const doPodRepository = new OrionRepositoryService(DoPodDeliver);
    const q = doPodRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branch);
    q.leftJoin(e => e.userDriver);

    q.select({
      doPodDeliverId: true,
      doPodDeliverCode: true,
      totalAwb: true,
      description: true,
      branch: {
        branchId: true,
        branchCode: true,
        branchName: true,
      },
      userDriver: {
        userId: true,
        employeeId: true,
        username: true,
        employee: {
          employeeId: true,
          employeeName: true,
        },
      },
    });
    q.where(e => e.doPodDeliverId, w => w.equals(doPodDeliverId));
    q.andWhere(e => e.isDeleted, w => w.equals(false));
    return await q.exec();
  }
}
