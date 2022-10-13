import { HttpStatus } from '@nestjs/common';
import _ = require('lodash');
import moment = require('moment');
import { getManager } from 'typeorm';

import { BagService } from '../../../../servers/main/services/v1/bag.service';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { AuthService } from '../../../../shared/services/auth.service';
import { SanityService } from '../../interfaces/sanity.service';
import { DeleteBagRequest } from '../../models/sanity/sanity.request';
import { DeleteBagResponse } from '../../models/sanity/sanity.response';

export default class DefaultSanityService implements SanityService {
  // Delete bag(s) by bag_number(s) and all bag_items in the corresponding bags
  public async deleteBag(
    payload: DeleteBagRequest,
  ): Promise<DeleteBagResponse> {
    const auth = AuthService.getAuthMetadata();
    let bags = await Promise.all(
      payload.bagNumbers.map(bagNumber => BagService.validBagNumber(bagNumber)),
    );
    bags = _.uniq(_.compact(bags));
    if (!bags.length) {
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Bag number(s) not found or have been deleted',
        data: {
          bagNumbers: payload.bagNumbers,
        },
      };
    }
    const bagIds = bags.map(bag => bag.bagId);
    const now = moment().toDate();
    await getManager().transaction(async manager => {
      await manager.update(Bag, bagIds, {
        isDeleted: true,
        updatedTime: now,
        userIdUpdated: auth.userId,
      });
      await manager
        .createQueryBuilder()
        .update(BagItem)
        .set({
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: auth.userId,
        })
        .where('bag_id IN (:...ids)', { ids: bagIds })
        .execute();
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
