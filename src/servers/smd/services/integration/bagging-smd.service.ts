import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import {createQueryBuilder} from 'typeorm';
import {SmdScanBaggingPayloadVm} from '../../../main/models/smd-bagging-payload.vm';
import {SmdScanBaggingResponseVm} from '../../../main/models/smd-bagging-response.vm';

@Injectable()
export class BaggingSmdService {
  static async createBagging(
    payload: SmdScanBaggingPayloadVm,
  ): Promise<SmdScanBaggingResponseVm> {
    const result = new SmdScanBaggingResponseVm();
    result.status = 'error';

    if (payload.bagNumber.length != 15) {
      result.message = 'Bag number tidak valid';
      return result;
    }

    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const bagNumber = payload.bagNumber.substring(0, 7);
    const bagSeq = payload.bagNumber.substring(7, 10);
    const weight = payload.bagNumber.substring(10);
    let baggingId = '';

    // check status gabung paket
    const qb = createQueryBuilder();
    qb.addSelect('bi.bag_item_id', 'bagItemId');
    qb.from('bag', 'b');
    qb.innerJoin('bag_item', 'bi', 'bi.bag_id = b.bag_id AND bi.is_deleted = false');
    qb.innerJoin('bagging_item', 'bt', 'bt.bag_item_id = bi.bag_item_id AND bt.is_deleted = false ');
    qb.innerJoin('bagging', 'ba', 'ba.bagging_id = bt.bagging_id AND ba.is_deleted = false AND ba.branch_id = :branchId',
      { branchId: permissionPayload.branchId },
    );
    qb.where('b.bag_number = :bagNumber', { bagNumber });
    qb.andWhere('bi.bag_seq = :bagSeq', { bagSeq });
    qb.andWhere('b.is_deleted = false');
    const dataBagging = await qb.getRawOne();

    if (dataBagging) {
      result.message = 'Resi Gabung Paket sudah di scan';
      return result;
    }

    if (payload.baggingId) {
      const q = createQueryBuilder();
      q.addSelect('b.bagging_id', 'baggingId');
      q.from('bagging', 'b');
      q.andWhere('bagging_id = :baggingId', { baggingId: payload.baggingId });
      const bagging = await q.getRawOne();

      if (!bagging) {
        result.message = 'Data bagging tidak ditemukan';
        return result;
      }
      baggingId = bagging.baggingId;
    } else {
      const bagging = Bagging.create();
      bagging.userId = authMeta.userId.toString();
      bagging.representativeIdTo = payload.representativeCode;
      bagging.branchId = permissionPayload.branchId.toString();
      bagging.totalItem = 1;
      bagging.baggingCode = await this.generateCode();
      bagging.baggingDate = await this.dateMinus1day(moment().toDate());
      bagging.userIdCreated = authMeta.userId.toString();
      bagging.userIdUpdated = authMeta.userId.toString();
      bagging.baggingDateReal = moment().toDate();
      bagging.createdTime = moment().toDate();
      bagging.updatedTime = moment().toDate();
      await Bagging.save(bagging);

      baggingId = bagging.baggingId;
    }

    result.baggingId = baggingId;
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
    const maxTime = moment().format('YYYY-MM-DD 00:00:00');
    const minTime = moment().format('YYYY-MM-DD 08:00:00');
    const momentMax = moment(maxTime, 'YYYY-MM-DD HH:mm:ss');
    const momentMin = moment(minTime, 'YYYY-MM-DD HH:mm:ss');
    let momentDate = moment(date);

    if (momentDate.isBefore(momentMax) && momentDate.isSameOrAfter(momentMin)) {
        momentDate = momentDate.subtract(1, 'd');
    }

    return momentDate.format('YYYY-MM-DD HH:mm:ss');
  }
}
