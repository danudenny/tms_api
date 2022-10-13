import { HttpStatus } from '@nestjs/common';
import moment = require('moment');
import { getManager } from 'typeorm';

import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { SanityService } from '../../interfaces/sanity.service';
import { DeleteBagRequest } from '../../models/sanity/sanity.request';
import { DeleteBagResponse } from '../../models/sanity/sanity.response';

export default class DefaultSanityService implements SanityService {
  public async deleteBag(
    payload: DeleteBagRequest,
  ): Promise<DeleteBagResponse> {
    const q = new OrionRepositoryService(Bag, 'b').createQueryBuilder();
    const bags = await q
      .select('b.bag_id', 'id')
      .andWhere('bag_number IN (:...bagNumbers)', {
        bagNumbers: payload.bagNumbers,
      })
      .andWhere('is_deleted = FALSE')
      .execute();
    const bagIds = bags.map(bag => bag.id);
    const now = moment().toDate();
    await getManager().transaction(async manager => {
      await manager.update(Bag, `bag_id IN (${bagIds.join(',')})`, {
        isDeleted: true,
        updatedTime: now,
      });
      await manager.update(BagItem, `bag_id IN (${bagIds.join(',')})`, {
        isDeleted: true,
        updatedTime: now,
      });
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted bag',
      data: {
        bagNumbers: payload.bagNumbers,
      },
    };
  }
}
