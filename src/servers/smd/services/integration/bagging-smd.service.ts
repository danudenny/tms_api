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
import {RawQueryService} from '../../../../shared/services/raw-query.service';

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

    const bagNumber = payload.bagNumber.substring(0, 7);
    const bagSeq = Number(payload.bagNumber.substring(7, 10));
    // const weight = payload.bagNumber.substring(10);
    let baggingId = '';
    let baggingCode = '';

    // cek data gabung paket
    let rawQuery = `
      SELECT
        bi.bag_item_id AS bag_item_id,
        bi.weight as weight,
        bi.bag_item_status_id_last AS bag_item_status_id_last_in_bag_item,
        b.representative_id_to AS representative_id_to,
        r.representative_code AS representative_code
      FROM bag AS b
      INNER JOIN bag_item bi ON bi.bag_id = b.bag_id AND bi.is_deleted = false
      INNER JOIN representative r ON r.representative_id = b.representative_id_to
      WHERE
        b.bag_number = '${bagNumber}' AND
        bi.bag_seq = '${bagSeq}' AND
        b.is_deleted = false
      ORDER BY b.created_time DESC
      LIMIT 1;
    `;
    const dataPackage = await RawQueryService.query(rawQuery);
    if (dataPackage.length == 0) {
      result.message = 'Resi gabung paket tidak ditemukan';
      return result;
    }
    if (dataPackage[0].bag_item_status_id_last_in_bag_item != BAG_STATUS.IN_BRANCH) {
      // handle kesalahan data saat scan masuk surat jalan
      if (dataPackage[0].bag_item_status_id_last_in_bag_item == BAG_STATUS.CREATED) {
        rawQuery = `
          SELECT
            bh.bag_item_status_id AS bag_item_status_id
          FROM bag_item_history AS bh
          WHERE
            bh.bag_item_id = '${dataPackage[0].bag_item_id}'
          LIMIT 1;
        `;
        const history = await RawQueryService.query(rawQuery);
        if (history.length == 0 || (history.length > 0 && history[0].bag_item_status_id != BAG_STATUS.IN_BRANCH)) {
          result.message = 'Resi Gabung Paket belum di scan masuk';
          return result;
        }
      } else {
        result.message = 'Resi Gabung Paket belum di scan masuk';
        return result;
      }
    }

    // cek data bagging sebelumnya
    rawQuery = `
      SELECT
        bt.bagging_id AS bagging_id
      FROM bagging_item AS bt
      INNER JOIN bagging ba ON ba.bagging_id = bt.bagging_id AND ba.is_deleted = false
      WHERE
        bt.bag_item_id = '${dataPackage[0].bag_item_id}' AND
        bt.is_deleted = false
      LIMIT 1;
    `;
    const dataBagging = await RawQueryService.query(rawQuery);

    if (dataBagging.length > 0) {
      result.message = 'Resi ' + payload.bagNumber + ' sudah di scan bagging';
      return result;
    }

    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();
    result.baggingId = baggingId;
    result.baggingCode = baggingCode;

    // NOTE: baggingId untuk mencocokkan bagging yg sedang di scan
    // dengan bagging yg di-scan sebelumnya
    if (payload.baggingId) {
      // check kode tujuan bagging sebelumnya yang pernah di-scan
      rawQuery = `
        SELECT
          r.representative_code AS valid_code
        FROM bagging_item AS bai
        INNER JOIN bag_item AS bi ON bi.bag_item_id = bai.bag_item_id
        INNER JOIN bag AS b ON bi.bag_id = b.bag_id
        LEFT JOIN representative AS r ON r.representative_id = b.representative_id_to
        WHERE
          r.representative_code <> '${dataPackage[0].representative_code}' AND
          bai.bagging_id = '${payload.baggingId}'
        LIMIT 1;
      `;
      const otherCombinePackegeIsExists = await RawQueryService.query(rawQuery);

      result.validRepresentativeCode = otherCombinePackegeIsExists.length > 0 ?
        otherCombinePackegeIsExists[0].valid_code
        : result.validRepresentativeCode;

      if (otherCombinePackegeIsExists.length > 0 && dataPackage[0].representative_id_to) {
        result.validRepresentativeCode = '';
        result.message = 'Tujuan resi ' + payload.bagNumber + ' tidak sama dengan tujuan gabung paket sebelumnya';
        return result;
      }

      // Ambil data bagging dari payload
      rawQuery = `
        SELECT
          ba.bagging_id AS bagging_id,
          ba.bagging_code AS bagging_code,
          ba.total_weight AS total_weight,
          ba.total_item AS total_item
        FROM bagging AS ba
        WHERE
          ba.bagging_id = '${payload.baggingId}' AND
          ba.is_deleted = false
        LIMIT 1;
      `;
      const bagging = await RawQueryService.query(rawQuery);
      if (bagging.length == 0) {
        result.message = 'Data bagging tidak ditemukan';
        return result;
      }

      baggingId = result.baggingId = bagging[0].bagging_id;
      baggingCode = result.baggingCode = bagging[0].bagging_code;

      const total_weight = (Number(dataPackage[0].weight) + Number(bagging[0].total_weight));
      await Bagging.update(baggingId, {
        totalWeight: total_weight.toString(),
        totalItem: (bagging[0].total_item + 1),
      });

    }

    // NOTE: representativeCode digunakan untul validasi kode tujuan gabung paket
    let representative = null;
    result.validRepresentativeCode = dataPackage[0].representative_code;
    if (payload.representativeCode) {
      payload.representativeCode = payload.representativeCode.toUpperCase();
      rawQuery = `
        SELECT
          r.representative_id AS representative_id
        FROM representative AS r
        WHERE
          r.representative_code = '${payload.representativeCode}' AND
          r.representative_id = '${dataPackage[0].representative_id_to}'
        LIMIT 1;
      `;
      representative = await RawQueryService.query(rawQuery);
      if (representative.length == 0) {
        result.message = 'Kode tujuan ' + payload.representativeCode +
          ' tidak valid untuk gabung paket ' + payload.bagNumber;
        return result;
      }
    } else {
      representative = [
        {
          representative_id: dataPackage[0].representative_id_to,
        },
      ];
    }

    if (!payload.baggingId) {
      const baggingDate = await this.dateMinus1day(moment().toDate());
      const maxBagSeq = await this.getMaxBaggingSeq(dataPackage[0].representative_id_to, baggingDate, permissionPayload.branchId);

      const createBagging = Bagging.create();
      createBagging.userId = authMeta.userId.toString();
      createBagging.representativeIdTo = representative[0].representative_id;
      createBagging.branchId = permissionPayload.branchId.toString();
      createBagging.totalItem = 1;
      createBagging.totalWeight = dataPackage[0].weight.toString();
      createBagging.baggingCode = await this.generateCode();
      createBagging.baggingDate = baggingDate;
      createBagging.userIdCreated = authMeta.userId.toString();
      createBagging.userIdUpdated = authMeta.userId.toString();
      createBagging.baggingDateReal = moment().toDate();
      createBagging.baggingSeq = maxBagSeq;
      createBagging.createdTime = moment().toDate();
      createBagging.updatedTime = moment().toDate();
      await Bagging.save(createBagging);

      baggingId = createBagging.baggingId;
      baggingCode = createBagging.baggingCode;
    }
    const baggingItem = BaggingItem.create();
    baggingItem.baggingId = baggingId;
    baggingItem.bagItemId = dataPackage[0].bag_item_id;
    baggingItem.userIdCreated = authMeta.userId.toString();
    baggingItem.userIdUpdated = authMeta.userId.toString();
    baggingItem.createdTime = moment().toDate();
    baggingItem.updatedTime = moment().toDate();
    BaggingItem.save(baggingItem);

    await BagItem.update(dataPackage[0].bag_item_id, {
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
    const rawQuery = `
      SELECT
        bagging.bagging_code AS bagging_code
      FROM bagging
      WHERE
        bagging_code LIKE '${codeAlike}%'
      ORDER BY bagging_date_real DESC
      LIMIT 1;
    `;
    const result = await RawQueryService.query(rawQuery);

    let sequence = 1;
    if (result.length > 0) {
      sequence = Number(result[0].bagging_code.substring(result[0].bagging_code.length - 5)) + 1;
    }
    const code = codeAlike + '0'.repeat(5 - sequence.toString().length) + sequence;
    return code;
  }

  static async getMaxBaggingSeq(representativeIdTo, baggingDate, branchId) {
    const rawQuery = `
      SELECT
        MAX(b.bagging_seq) AS bagging_seq
      FROM bagging AS b
      WHERE
        b.representative_id_to = '${representativeIdTo}' AND
        b.bagging_date = '${baggingDate}' AND
        b.branch_id = '${branchId}' AND
        b.is_deleted = false
      LIMIT 1;
    `;
    const bagging = await RawQueryService.query(rawQuery);

    let baggingSeq = bagging[0].bagging_seq;
    if (bagging == 0) {
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
