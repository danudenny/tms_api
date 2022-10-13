import { BadRequestException, HttpStatus } from '@nestjs/common';
import moment = require('moment');
import { getManager } from 'typeorm';

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
import { DeleteBaggingRequest, DeleteBagRepresentativeRequest, DeleteBagRequest, DeleteDoSmdRequest } from '../../models/sanity/sanity.request';
import { DeleteBaggingResponse, DeleteBagRepresentativeResponse, DeleteBagResponse, DeleteDoSmdResponse } from '../../models/sanity/sanity.response';

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

  public async deleteDoSmd(payload: DeleteDoSmdRequest): Promise<DeleteDoSmdResponse> {
    const authMeta = AuthService.getAuthData();
    const q = new OrionRepositoryService(DoSmd, 'ds').createQueryBuilder();
    const objDoSmd = await q
      .select('ds.do_smd_id as doSmdId, ds.do_smd_detail_id_last as doSmdDetailIdLast')
      .andWhere( `ds.do_smd_id = ${payload.doSmdId}`)
      .andWhere('is_deleted = FALSE')
      .execute();

    if (!objDoSmd) {
      throw new BadRequestException('DoSmdId tidak ditemukan.');
    }

    const now = moment().toDate();
    await getManager().transaction(async manager => {
      await manager.update(DoSmd,
        {
          doSmdId : objDoSmd.doSmdId,
        },
        {
        isDeleted: true,
        updatedTime: now,
        userIdUpdated : authMeta.userId,
        },
      );

      await manager.update(DoSmdDetail,
        {
          doSmdId : objDoSmd.doSmdId,
        },
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated : authMeta.userId,
        },
      );

      await manager.update(DoSmdDetailItem,
        {
          doSmdDetailId : objDoSmd.doSmdDetailIdLast,
        },
        {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated : authMeta.userId,
        },
      );

    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted DoSmd',
      data: {
        doSmdId: payload.doSmdId,
      },
    };

  }

  public async deleteBagging(payload: DeleteBaggingRequest): Promise<DeleteBaggingResponse> {
    const authMeta = AuthService.getAuthData();
    const q = new OrionRepositoryService(Bagging, 'b').createQueryBuilder();
    const objBagging = await q
      .select('b.bagging_id' , 'baggingId')
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
        userIdUpdated : String(authMeta.userId),
      });

      await manager.update(BaggingItem, `bagging_id IN (${baggingIds.join(',')})`, {
        isDeleted: true,
        updatedTime: now,
        userIdUpdated : String(authMeta.userId),
      });

    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted Bagging',
      data: {
        baggingId: payload.baggingId,
      },
    };

  }

  public async deleteBagRepresentative(payload: DeleteBagRepresentativeRequest): Promise<DeleteBagRepresentativeResponse> {
    const authMeta = AuthService.getAuthData();
    const q = new OrionRepositoryService(BagRepresentative, 'br').createQueryBuilder();
    const objBagRepresentative = await q
      .select('br.bag_representative_id' , 'bagRepresentativeId')
      .andWhere('bag_representative_id IN (:...bagRepresentativeId)', {
        baggingId: payload.bagRepresentativeId,
      })
      .andWhere('is_deleted = FALSE')
      .execute();

    const baggingIds = objBagRepresentative.map(bagRep => bagRep.bagRepresentativeId);
    const now = moment().toDate();

    await getManager().transaction(async manager => {
      await manager.update(BagRepresentative, `bag_representative_id IN (${baggingIds.join(',')})`, {
        isDeleted: true,
        updatedTime: now,
        userIdUpdated : authMeta.userId,
      });

      await manager.update(BagRepresentativeItem, `bag_representative_id IN (${baggingIds.join(',')})`, {
        isDeleted: true,
        updatedTime: now,
        userIdUpdated : authMeta.userId,
      });

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
