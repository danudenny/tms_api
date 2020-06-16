import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import {createQueryBuilder} from 'typeorm';
import {BaggingItem} from '../../../../shared/orm-entity/bagging-item';
import {BagItem} from '../../../../shared/orm-entity/bag-item';
import {BaseMetaPayloadVm} from '../../../../shared/models/base-meta-payload.vm';
import {OrionRepositoryService} from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { ListBaggingResponseVm, SmdScanBaggingResponseVm, ListDetailBaggingResponseVm } from '../../models/smd-bagging-response.vm';
import { SmdScanBaggingPayloadVm } from '../../models/smd-bagging-payload.vm';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';

@Injectable()
export class BaggingSmdService {
  static async listBagging(
    payload: BaseMetaPayloadVm,
  ): Promise<ListBaggingResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'representativeCode',
      },
      {
        field: 'baggingCode',
      },
      {
        field: 'lastName',
      },
      {
        field: 'firstName',
      },
    ];
    payload.fieldResolverMap['baggingCode'] = 't1.bagging_code';
    payload.fieldResolverMap['baggingDate'] = 't1.bagging_date';
    payload.fieldResolverMap['representativeCode'] = 't2.representative_code';
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['branchId'] = 't1.branch_id';
    const repo = new OrionRepositoryService(Bagging, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.bagging_code', 'baggingCode'],
      ['t1.bagging_id', 'baggingId'],
      ['TO_CHAR(t1.bagging_date, \'dd-mm-YYYY HH24:MI:SS\')', 'baggingDate'],
      ['TO_CHAR(t1.bagging_date_real, \'dd-mm-YYYY HH24:MI:SS\')', 'baggingScanDate'],
      ['COUNT(t5.bagging_item_id)', 'totalItem'],
      ['t1.total_weight', 'totalWeight'],
      ['t2.representative_code', 'representativeCode'],
      ['t2.representative_name', 'representativeName'],
      ['CONCAT(t3.first_name, CONCAT(\' \', t3.last_name))', 'user'],
      ['t4.branch_name', 'branchBagging'],
    );
    q.leftJoin(e => e.representative, 't2');
    q.innerJoin(e => e.user, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.baggingItems, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw(`
      t1.bagging_id,
      t1.bagging_code,
      t1.created_time,
      t1.bagging_date,
      t1.bagging_date_real,
      t1.total_weight,
      t2.representative_code,
      t4.branch_name,
      t3.first_name,
      t3.last_name,
      t2.representative_name
    `);

    q.orderBy({ createdTime: 'DESC' });
    const data    = await q.exec();
    const total   = await q.countWithoutTakeAndSkip();
    const result  = new ListBaggingResponseVm();
    result.data   = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async createBagging(
    payload: SmdScanBaggingPayloadVm,
  ): Promise<SmdScanBaggingResponseVm> {
    const result = new SmdScanBaggingResponseVm();
    result.status = 'error';

    if (payload.bagNumber.length != 10 && payload.bagNumber.length != 15) {
      result.message = 'Bag number tidak valid';
      return result;
    }

    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const bagNumber = payload.bagNumber.substring(0, 7);
    const bagSeq = payload.bagNumber.substring(7, 10);
    const weight = payload.bagNumber.substring(10);
    let baggingId = '';
    let baggingCode = '';
    // check status gabung paket
    let qb = createQueryBuilder();
    qb.addSelect('bi.bag_item_id', 'bagItemId');
    qb.addSelect('bi.weight', 'weight');
    qb.addSelect('bh.bag_item_status_id', 'bagItemStatusIdLast');
    qb.addSelect('bi.bag_item_status_id_last', 'bagItemStatusIdLastInBagItem');
    qb.addSelect('b.representative_id_to', 'representativeIdTo');
    qb.addSelect('r.representative_code', 'representativeCode');
    qb.addSelect('r.is_deleted', 'repIsDeleted');
    qb.from('bag', 'b');
    qb.innerJoin('bag_item', 'bi', 'bi.bag_id = b.bag_id AND bi.is_deleted = false');
    qb.leftJoin('bag_item_history', 'bh', 'bi.bag_item_id = bh.bag_item_id AND bh.is_deleted = false');
    qb.leftJoin('representative', 'r', 'r.representative_id = b.representative_id_to');
    qb.where('b.bag_number = :bagNumber', { bagNumber });
    qb.andWhere('bi.bag_seq = :bagSeq', { bagSeq });
    qb.andWhere('b.is_deleted = false');
    qb.orderBy('bh.history_date', 'DESC');
    const dataBagging = await qb.getRawOne();
    if (!dataBagging) {
      result.message = 'Resi gabung paket tidak ditemukan';
      return result;
    } else if (dataBagging.bagItemStatusIdLast) {
      if (dataBagging.bagItemStatusIdLast != BAG_STATUS.IN_BRANCH) {
        result.message = 'Resi Gabung Paket belum di scan masuk';
        return result;
      }
    } else if (!dataBagging.bagItemStatusIdLast && dataBagging.bagItemStatusIdLastInBagItem != BAG_STATUS.IN_BRANCH) {
      result.message = 'Resi Gabung Paket belum di scan masuk';
      return result;
    }

    qb.innerJoin('bagging_item', 'bt', 'bt.bag_item_id = bi.bag_item_id AND bt.is_deleted = false ');
    qb.innerJoin('bagging', 'ba', 'ba.bagging_id = bt.bagging_id AND ba.is_deleted = false');
    const dataExists = await qb.getRawOne();
    if (dataExists) {
      result.message = 'Resi Gabung Paket sudah di scan';
      return result;
    }
    // NOTE: representativeCode ada jika bagging di create awal,
    // jika tidak ada maka
    // bagging yg di-scan scan mengikuti scan-scan sebelumnnya
    let representative = null;
    result.validRepresentativeCode = dataBagging.representativeCode;
    if (payload.representativeCode) {
      qb = createQueryBuilder();
      qb.addSelect('r.representative_id', 'representativeId');
      qb.from('representative', 'r');
      qb.where('r.representative_code = :representativeCode', { representativeCode: payload.representativeCode });
      const representativeExists = await qb.getRawOne();
      if (!representativeExists) {
        result.message = 'Kode tujuan ' + payload.representativeCode + ' tidak ditemukan';
        return result;
      }

      qb.andWhere('r.representative_id = :representativeId', {representativeId: dataBagging.representativeIdTo});
      representative = await qb.getRawOne();
      if (!representative) {
        result.message = 'Kode tujuan ' + payload.representativeCode + ' tidak sama dengan tujuan gabung paket sebelumnya';
        return result;
      }
    } else {
      qb = createQueryBuilder();
      qb.addSelect('b.representative_id_to', 'representativeId');
      qb.from('bag', 'b');
      qb.innerJoin('bag_item', 'bi', 'bi.bag_id = b.bag_id AND bi.is_deleted = false');
      qb.where('b.bag_number = :bagNumber', { bagNumber });
      qb.andWhere('b.is_deleted = false');
      qb.innerJoin('bagging_item', 'bt', 'bt.bag_item_id = bi.bag_item_id AND bt.is_deleted = false ');
      qb.innerJoin('bagging', 'ba', 'ba.bagging_id = bt.bagging_id AND ba.is_deleted = false');
      representative = await qb.getRawOne();
      if (!representative) {
        result.message = 'Gabung paket sebelumnya tidak ditemukan, harap masukkan kode tujuan!';
        return result;
      }
    }

    if (payload.baggingId) {
      const q = createQueryBuilder();
      q.addSelect('b.bagging_id', 'baggingId');
      q.addSelect('b.bagging_code', 'baggingCode');
      q.addSelect('b.total_weight', 'totalWeight');
      q.addSelect('b.totalItem', 'totalItem');
      q.from('bagging', 'b');
      q.andWhere('bagging_id = :baggingId', { baggingId: payload.baggingId });
      const bagging = await q.getRawOne();

      if (!bagging) {
        result.message = 'Data bagging tidak ditemukan';
        return result;
      }
      baggingId = bagging.baggingId;
      baggingCode = bagging.baggingCode;

      const total_weight = (Number(dataBagging.weight) + Number(bagging.totalWeight));
      await Bagging.update(baggingId, {
        totalWeight: total_weight.toString(),
        totalItem: (bagging.totalItem + 1),
      });

    } else {
      const bagging = Bagging.create();
      bagging.userId = authMeta.userId.toString();
      bagging.representativeIdTo = representative.representativeId;
      bagging.branchId = permissionPayload.branchId.toString();
      bagging.totalItem = 1;
      bagging.totalWeight = dataBagging.weight.toString();
      bagging.baggingCode = await this.generateCode();
      bagging.baggingDate = await this.dateMinus1day(moment().toDate());
      bagging.userIdCreated = authMeta.userId.toString();
      bagging.userIdUpdated = authMeta.userId.toString();
      bagging.baggingDateReal = moment().toDate();
      bagging.createdTime = moment().toDate();
      bagging.updatedTime = moment().toDate();
      await Bagging.save(bagging);

      baggingId = bagging.baggingId;
      baggingCode = bagging.baggingCode;
    }
    const baggingItem = BaggingItem.create();
    baggingItem.baggingId = baggingId;
    baggingItem.bagItemId = dataBagging.bagItemId;
    baggingItem.userIdCreated = authMeta.userId.toString();
    baggingItem.userIdUpdated = authMeta.userId.toString();
    baggingItem.createdTime = moment().toDate();
    baggingItem.updatedTime = moment().toDate();
    BaggingItem.save(baggingItem);

    await BagItem.update(dataBagging.bagItemId, {
      baggingIdLast: Number(baggingId),
    });

    result.status = 'success';
    result.baggingId = baggingId;
    result.baggingCode = baggingCode;
    result.message = 'Scan gabung paket berhasil';
    return result;
  }

  static async generateCode() {
    const codeAlike = 'BGG/' + moment().format('YYMM') + '/';
    const qb = createQueryBuilder();
    qb.addSelect('bagging.bagging_code', 'baggingCode');
    qb.where(`bagging_code LIKE '${codeAlike}%'`);
    qb.from('bagging', 'bagging');
    qb.orderBy('bagging_date_real', 'DESC');
    const result = await qb.getRawOne();

    let sequence = 1;
    if (result) {
      sequence = Number(result.baggingCode.substring(result.baggingCode.length - 5)) + 1;
    }
    const code = codeAlike + '0'.repeat(5 - sequence.toString().length) + sequence;

    return code;
  }

  static async getMaxBaggingSeq(representativeIdTo, baggingDate, branchId) {
      const qb = createQueryBuilder();
      qb.addSelect('MAX(b.bagging_seq)', 'baggingSeq');
      qb.from('bagging', 'b');
      qb.where('b.representative_id_to = :representativeIdTo', { representativeIdTo });
      qb.andWhere('b.bagging_date = :baggingDate', { baggingDate });
      qb.andWhere('b.branch_id = :branchId', { branchId });
      qb.andWhere('b.bagging_date = :baggingDate', { baggingDate });
      qb.andWhere('b.is_deleted = false');

      const bagging = await qb.getRawOne();
      let baggingSeq = bagging.baggingSeq;
      if (!bagging) {
        baggingSeq = 0;
      }
      return baggingSeq + 1;
  }

  public static dateMinus1day(date: Date) {
    const maxTime = moment().format('YYYY-MM-DD 08:00:00');
    const minTime = moment().format('YYYY-MM-DD 00:00:00');
    const momentMax = moment(maxTime, 'YYYY-MM-DD HH:mm:ss');
    const momentMin = moment(minTime, 'YYYY-MM-DD HH:mm:ss');
    let momentDate = moment(date);

    if (momentDate.isBefore(momentMax) && momentDate.isSameOrAfter(momentMin)) {
        momentDate = momentDate.subtract(1, 'd');
    }

    return momentDate.format('YYYY-MM-DD HH:mm:ss');
  }

  static async listDetailBagging(
    payload: BaseMetaPayloadVm,
  ): Promise<ListDetailBaggingResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'baggingId',
      },
      {
        field: 'bagItemId',
      },
      {
        field: 'baggingItemId',
      },
    ];
    payload.fieldResolverMap['baggingId'] = 't1.bagging_id';
    const repo = new OrionRepositoryService(BaggingItem, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.bagging_item_id', 'baggingItemId'],
      ['t1.bagging_id', 'baggingId'],
      ['t1.bag_item_id', 'bagItemId'],
      ['CONCAT(t2.bag_number, LPAD(t3.bag_seq::text, 3, \'0\'))', 'bagNumber'],
    );
    q.innerJoin(e => e.bagItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.bagItem.bag, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.orderBy({ createdTime: 'DESC' });
    const data    = await q.exec();
    const total   = await q.countWithoutTakeAndSkip();
    const result  = new ListDetailBaggingResponseVm();
    result.data   = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
