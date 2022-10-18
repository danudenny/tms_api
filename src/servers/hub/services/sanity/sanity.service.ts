import { BadRequestException, HttpStatus } from '@nestjs/common';
import _ = require('lodash');
import moment = require('moment');
import { getManager } from 'typeorm';

import { BagService } from '../../../../servers/main/services/v1/bag.service';
import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagRepresentative } from '../../../../shared/orm-entity/bag-representative';
import { BagRepresentativeItem } from '../../../../shared/orm-entity/bag-representative-item';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { BranchSortirLogSummary } from '../../../../shared/orm-entity/branch-sortir-log-summary';
import { DoSortation } from '../../../../shared/orm-entity/do-sortation';
import { DoSortationDetail } from '../../../../shared/orm-entity/do-sortation-detail';
import { DoSortationDetailItem } from '../../../../shared/orm-entity/do-sortation-detail-item';
import { DoSortationVehicle } from '../../../../shared/orm-entity/do-sortation-vehicle';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { HubSummaryAwb } from '../../../../shared/orm-entity/hub-summary-awb';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { SanityService } from '../../interfaces/sanity.service';
import {
  DeleteAwbsRequest,
  DeleteBaggingRequest,
  DeleteBagRepresentativeRequest,
  DeleteBagsRequest,
  DeleteDoSmdRequest,
  DeleteDoSortationsRequest,
} from '../../models/sanity/sanity.request';
import {
  DeleteAwbsResponse,
  DeleteBaggingResponse,
  DeleteBagRepresentativeResponse,
  DeleteBagsResponse,
  DeleteDoSmdResponse,
  DeleteDoSortationsResponse,
} from '../../models/sanity/sanity.response';

export default class DefaultSanityService implements SanityService {
  // Delete bag(s) by bag_number(s) and all bag_items in the corresponding bags
  public async deleteBags(
    payload: DeleteBagsRequest,
  ): Promise<DeleteBagsResponse> {
    const auth = AuthService.getAuthMetadata();
    let bags = await Promise.all(
      payload.bag_numbers.map(bagNumber =>
        BagService.validBagNumber(bagNumber),
      ),
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
      await Promise.all([
        manager.update(Bag, bagIds, {
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: auth.userId,
        }),
        manager
          .createQueryBuilder()
          .update(BagItem)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('bag_id IN (:...ids)', { ids: bagIds })
          .execute(),
        manager
          .createQueryBuilder()
          .update(HubSummaryAwb)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .orWhere('bag_id_do IN (:...ids)', { ids: bagIds })
          .orWhere('bag_id_in IN (:...ids)', { ids: bagIds })
          .execute(),
      ]);
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted bag(s)',
      data: {
        bagNumbers: payload.bag_numbers,
      },
    };
  }

  // Delete awbs, and all corresponding awb_items and awb_item_attrs
  public async deleteAwbs(
    payload: DeleteAwbsRequest,
  ): Promise<DeleteAwbsResponse> {
    const auth = AuthService.getAuthData();
    const now = moment().toDate();
    if (!payload.awb_numbers.length) {
      throw new BadRequestException('awb_numbers is empty!');
    }
    await getManager().transaction(async manager => {
      await Promise.all([
        manager
          .createQueryBuilder()
          .update(Awb)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('awb_number IN (:...awbs)', { awbs: payload.awb_numbers })
          .execute(),
        manager
          .createQueryBuilder()
          .update(AwbItem)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('awb_number IN (:...awbs)', { awbs: payload.awb_numbers })
          .execute(),
        manager
          .createQueryBuilder()
          .update(AwbItemAttr)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdLast: auth.userId,
          })
          .where('awb_number IN (:...awbs)', { awbs: payload.awb_numbers })
          .execute(),
        manager
          .createQueryBuilder()
          .update(BranchSortirLogSummary)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('awb_number IN (:...awbs)', { awbs: payload.awb_numbers })
          .execute(),
        manager
          .createQueryBuilder()
          .update(HubSummaryAwb)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('awb_number IN (:...awbs)', { awbs: payload.awb_numbers })
          .execute(),
      ]);
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted AWB(s)',
      data: {
        awbNumbers: payload.awb_numbers,
      },
    };
  }

  // Delete do_sortations and their corresponding do_sortation_vehicles,
  // do_sortation_details do_sortation_detail_items
  public async deleteDoSortations(
    payload: DeleteDoSortationsRequest,
  ): Promise<DeleteDoSortationsResponse> {
    const auth = AuthService.getAuthData();
    const now = moment().toDate();
    const q = new OrionRepositoryService(DoSortation, 'ds').findAllRaw();
    const selectColumns = [
      ['ds.do_sortation_id', 'dsId'],
      ['dsv.do_sortation_vehicle_id', 'dsvId'],
      ['dsd.do_sortation_detail_id', 'dsdId'],
      ['dsdi.do_sortation_detail_item_id', 'dsdiId'],
    ];

    const bags = await q
      .selectRaw(...selectColumns)
      .leftJoinRaw('ds.doSortationVehicle', 'dsv', 'dsv.is_deleted = FALSE')
      .leftJoinRaw('ds.doSortationDetails', 'dsd', 'dsd.is_deleted = FALSE')
      .leftJoinRaw(
        'dsd.doSortationDetailItems',
        'dsdi',
        'dsdi.is_deleted = FALSE',
      )
      .andWhereRaw('ds.do_sortation_code IN (:...codes)', {
        codes: payload.do_sortation_codes,
      })
      .andWhereRaw('ds.is_deleted = FALSE');
    const dsIds = _.uniq(_.compact(bags.map(bag => bag.dsId)));
    const dsvIds = _.uniq(_.compact(bags.map(bag => bag.dsvId)));
    const dsdIds = _.uniq(_.compact(bags.map(bag => bag.dsdId)));
    const dsdiIds = _.uniq(_.compact(bags.map(bag => bag.dsdiId)));
    await getManager().transaction(async manager => {
      if (dsIds.length) {
        await manager
          .createQueryBuilder()
          .update(DoSortation)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('do_sortation_id IN (:...dsIds)', { dsIds })
          .execute();
      }
      if (dsvIds.length) {
        await manager
          .createQueryBuilder()
          .update(DoSortationVehicle)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('do_sortation_vehicle_id IN (:...dsvIds)', { dsvIds })
          .execute();
      }
      if (dsdIds.length) {
        await manager
          .createQueryBuilder()
          .update(DoSortationDetail)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('do_sortation_detail_id IN (:...dsdIds)', { dsdIds })
          .execute();
      }
      if (dsdiIds.length) {
        await manager
          .createQueryBuilder()
          .update(DoSortationDetailItem)
          .set({
            isDeleted: true,
            updatedTime: now,
            userIdUpdated: auth.userId,
          })
          .where('do_sortation_detail_item_id IN (:...dsdiIds)', { dsdiIds })
          .execute();
      }
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted sortation scanout(s)',
      data: {
        doSortationCodes: payload.do_sortation_codes,
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
      throw new BadRequestException(
        'DoSmdCode tidak ditemukan atau sudah didelete.',
      );
    }

    const doSmdIds = objSmd.map(objSmds => objSmds.doSmdId);
    const doSmdDetailIdLastS = objSmd.map(objSmds => objSmds.doSmdDetailIdLast);
    const now = moment().toDate();
    await getManager().transaction(async manager => {
      await manager.update(DoSmd, doSmdIds, {
        isDeleted: true,
        updatedTime: now,
        userIdUpdated: authMeta.userId,
      });

      await manager
        .createQueryBuilder()
        .update(DoSmdDetail)
        .set({
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        })
        .where('do_smd_id IN (:...ids)', { ids: doSmdIds })
        .execute();

      await manager
        .createQueryBuilder()
        .update(DoSmdDetailItem)
        .set({
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        })
        .where('do_smd_detail_id IN (:...ids)', { ids: doSmdDetailIdLastS })
        .execute();
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
      .andWhere('bagging_code IN (:...baggingCode)', {
        baggingCode: payload.baggingCode,
      })
      .andWhere('is_deleted = FALSE')
      .execute();

    if (objBagging.length == 0) {
      throw new BadRequestException('Bagging tidak ditemukan atau sudah di delete.');
    }

    const baggingIds = objBagging.map(bagging => bagging.baggingId);
    const now = moment().toDate();

    await getManager().transaction(async manager => {

      await manager
        .createQueryBuilder()
        .update(Bagging)
        .set({
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: String(authMeta.userId),
        })
        .where('bagging_id IN (:...ids)', { ids: baggingIds })
        .execute();

      await manager
        .createQueryBuilder()
        .update(BaggingItem)
        .set({
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: String(authMeta.userId),
        })
        .where('bagging_id IN (:...ids)', { ids: baggingIds })
        .execute();

    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted Bagging',
      data: {
        baggingCode: payload.baggingCode,
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
      .andWhere('bag_representative_code IN (:...bagRepresentativeCode)', {
        bagRepresentativeCode: payload.bagRepresentativeCode,
      })
      .andWhere('is_deleted = FALSE')
      .execute();

    if (objBagRepresentative.length == 0) {
      throw new BadRequestException('Bag Representative tidak ditemukan atau sudah di delete.');
    }

    const baggingIds = objBagRepresentative.map(
      bagRep => bagRep.bagRepresentativeId,
    );
    const now = moment().toDate();

    await getManager().transaction(async manager => {

      await manager
        .createQueryBuilder()
        .update(BagRepresentative)
        .set({
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        })
        .where('bag_representative_id IN (:...ids)', { ids: baggingIds })
        .execute();

      await manager
        .createQueryBuilder()
        .update(BagRepresentativeItem)
        .set({
          isDeleted: true,
          updatedTime: now,
          userIdUpdated: authMeta.userId,
        })
        .where('bag_representative_id IN (:...ids)', { ids: baggingIds })
        .execute();

    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully deleted Bag Representative',
      data: {
        bagRepresentativeCode: payload.bagRepresentativeCode,
      },
    };
  }
}
