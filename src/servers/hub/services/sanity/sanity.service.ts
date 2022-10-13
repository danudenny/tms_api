import { BadRequestException, HttpStatus } from '@nestjs/common';
import _ from 'lodash';
import moment = require('moment');
import { getManager } from 'typeorm';

import { BagService } from '../../../../servers/main/services/v1/bag.service';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { BagRepresentativeItem } from '../../../../shared/orm-entity/bag-representative-item';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { SanityService } from '../../interfaces/sanity.service';
import {
  DeleteBaggingRequest,
  DeleteBagRepresentativeRequest,
  DeleteBagsRequest,
  DeleteDoSmdRequest,
} from '../../models/sanity/sanity.request';
import {
  DeleteBaggingResponse,
  DeleteBagRepresentativeResponse,
  DeleteBagsResponse,
  DeleteDoSmdResponse,
} from '../../models/sanity/sanity.response';

export default class DefaultSanityService implements SanityService {
  // Delete bag(s) by bag_number(s) and all bag_items in the corresponding bags
  public async deleteBags(
    payload: DeleteBagsRequest,
  ): Promise<DeleteBagsResponse> {
    const auth = AuthService.getAuthMetadata();
    let bags = await Promise.all(
      payload.bag_numbers.map(bagNumber => BagService.validBagNumber(bagNumber)),
    );
    bags = _.uniq(_.compact(bags));
    if (!bags.length) {
      return {
        statusCode: HttpStatus.NO_CONTENT,
        message: 'Bag number(s) not found or have been deleted',
        data: {
          bagNumbers: payload.bag_numbers,
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
        bagNumbers: payload.bag_numbers,
      },
    };
  }

  public async deleteDoSmd(
    payload: DeleteDoSmdRequest,
  ): Promise<DeleteDoSmdResponse> {
    const authMeta = AuthService.getAuthData();

    const repo = new OrionRepositoryService(DoSmd, 'ds');
    const q = repo.findAllRaw();
    const selectColumn = [
      ['ds.do_smd_id', 'doSmdId'],
      ['ds.do_smd_detail_id_last', 'doSmdDetailIdLast'],
    ];
    q.selectRaw(...selectColumn);
    q.andWhere(e => e.doSmdCode, w => w.in(payload.doSmdCode));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const [objSmd, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    if (count == 0) {
      throw new BadRequestException('DoSmdCode tidak ditemukan atau sudah didelete.');
    }

    const doSmdIds = objSmd.map(objSmds => objSmds.doSmdId);
    const doSmdDetailIdLastS = objSmd.map(objSmds => objSmds.doSmdDetailIdLast);
    const now = moment().toDate();
    await getManager().transaction(async manager => {
      await manager.update(
        DoSmd,
        doSmdIds,
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        },
      );

      await manager.update(
        DoSmdDetail,
        doSmdIds,
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        },
      );

      await manager.update(
        DoSmdDetailItem,
        doSmdDetailIdLastS,
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        },
      );
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted DoSmd',
      data: {
        doSmdCode: payload.doSmdCode,
      },
    };
  }

  public async deleteBagging(
    payload: DeleteBaggingRequest,
  ): Promise<DeleteBaggingResponse> {
    const authMeta = AuthService.getAuthData();
    const q = new OrionRepositoryService(Bagging, 'b').createQueryBuilder();
    const objBagging = await q
      .select('b.bagging_id', 'baggingId')
      .andWhere('bagging_id IN (:...baggingId)', {
        baggingId: payload.baggingId,
      })
      .andWhere('is_deleted = FALSE')
      .execute();

    const baggingIds = objBagging.map(bagging => bagging.baggingId);
    const now = moment().toDate();

    await getManager().transaction(async manager => {
      await manager.update(Bagging, `bagging_id IN (${baggingIds.join(',')})`, {
        isDeleted: true,
        updatedTime: now,
        userIdUpdated: String(authMeta.userId),
      });

      await manager.update(
        BaggingItem,
        `bagging_id IN (${baggingIds.join(',')})`,
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: String(authMeta.userId),
        },
      );
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted Bagging',
      data: {
        baggingId: payload.baggingId,
      },
    };
  }

  public async deleteBagRepresentative(
    payload: DeleteBagRepresentativeRequest,
  ): Promise<DeleteBagRepresentativeResponse> {
    const authMeta = AuthService.getAuthData();
    const q = new OrionRepositoryService(
      BagRepresentative,
      'br',
    ).createQueryBuilder();
    const objBagRepresentative = await q
      .select('br.bag_representative_id', 'bagRepresentativeId')
      .andWhere('bag_representative_id IN (:...bagRepresentativeId)', {
        baggingId: payload.bagRepresentativeId,
      })
      .andWhere('is_deleted = FALSE')
      .execute();

    const baggingIds = objBagRepresentative.map(
      bagRep => bagRep.bagRepresentativeId,
    );
    const now = moment().toDate();

    await getManager().transaction(async manager => {
      await manager.update(
        BagRepresentative,
        `bag_representative_id IN (${baggingIds.join(',')})`,
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        },
      );

      await manager.update(
        BagRepresentativeItem,
        `bag_representative_id IN (${baggingIds.join(',')})`,
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        },
      );
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted Bagging',
      data: {
        bagRepresentativeId: payload.bagRepresentativeId,
      },
    };
  }
}
