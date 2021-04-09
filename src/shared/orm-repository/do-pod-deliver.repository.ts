import { EntityRepository, Repository } from 'typeorm';

import { OrionRepositoryService } from '../services/orion-repository.service';
import { DoPodDeliver } from '../orm-entity/do-pod-deliver';
import { RedisService } from '../services/redis.service';
import { BadRequestException } from '@nestjs/common';

@EntityRepository(DoPodDeliver)
export class DoPodDeliverRepository extends Repository<DoPodDeliver> {
  static async getDataById(doPodDeliverId: string) {
    const doPodRepository = new OrionRepositoryService(DoPodDeliver);
    const q = doPodRepository.findOne();
    // Manage relation (default inner join)
    q.leftJoin(e => e.branch);
    q.leftJoin(e => e.userDriver);
    q.leftJoin(e => e.userDriver.employee);

    q.select({
      doPodDeliverId: true,
      doPodDeliverCode: true,
      totalAwb: true,
      description: true,
      isPartner: true,
      partnerId: true,
      branch: {
        branchId: true,
        branchCode: true,
        branchName: true,
      },
      userDriver: {
        userId: true,
        userIdCreated: true,
        employeeId: true,
        username: true,
        employee: {
          employeeId: true,
          employeeName: true,
        },
      },
      userCreated: {
        userId: true,
        userIdCreated: true,
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
    q.take(1);
    return await q.exec();
  }

  static async byIdCache(doPodDeliverId: string): Promise<DoPodDeliver> {
    // Add Locking setnx redis
    const holdRedis = await RedisService.lockingWithExpire(
      `hold:doPodDeliverId:${doPodDeliverId}`,
      'locking',
      60,
    );
    if (holdRedis) {
      const doPodDeliver = await DoPodDeliver.findOne(
        { doPodDeliverId },
        { cache: true },
      );
      return doPodDeliver;
    } else {
      throw new BadRequestException('Surat Jalan sedang di proses!');
    }
  }
}
