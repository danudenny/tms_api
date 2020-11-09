import { EntityRepository, Repository } from 'typeorm';

import { OrionRepositoryService } from '../services/orion-repository.service';
import { DoPodDetailBag } from '../orm-entity/do-pod-detail-bag';

@EntityRepository(DoPodDetailBag)
export class DoPodDetailBagRepository extends Repository<DoPodDetailBag> {

  static async getDataById(doPodDetailBagId: string) {
    const doPodRepository = new OrionRepositoryService(DoPodDetailBag);
    const q = doPodRepository.findOne();
    // Manage relation (default inner join)

    q.where(e => e.doPodId, w => w.equals(doPodDetailBagId));
    q.andWhere(e => e.isDeleted, w => w.equals(false));
    q.take(1);
    return await q.exec();
  }

  static async getDataByBagItemIdAndBagStatus(bagItemId: number, bagStatusIds: any) {
    const doPodRepository = new OrionRepositoryService(DoPodDetailBag);
    const q = doPodRepository.findOne();
    q.select({
      doPodDetailBagId: true,
      doPodId: true,
      doPod: {
        doPodId: true,
        totalScanInBag: true,
        totalScanOutBag: true,
      },
      bagItemId: true,
      createdTime: true,
    });
    q.where(e => e.bagItem.bagItemStatusIdLast, w => w.in(bagStatusIds));
    q.andWhere(e => e.bagItemId, w => w.equals(bagItemId));
    q.andWhere(e => e.isDeleted, w => w.equals(false));
    q.orderBy({ createdTime: 'DESC' });
    q.take(1);
    return await q.exec();
  }
}
