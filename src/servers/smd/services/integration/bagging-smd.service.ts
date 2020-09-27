import { Injectable, Param, PayloadTooLargeException, BadRequestException } from '@nestjs/common';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { createQueryBuilder } from 'typeorm';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { ListBaggingResponseVm, SmdScanBaggingResponseVm, ListDetailBaggingResponseVm, SmdScanBaggingMoreResponseVm, SmdScanBaggingDataMoreResponseVm, SmdBaggingDetailResponseVm, CreateBaggingHeaderResponseVm } from '../../models/smd-bagging-response.vm';
import { SmdScanBaggingPayloadVm, SmdScanBaggingMorePayloadVm, InputManualDataPayloadVm, SmdBaggingDetailPayloadVm, BaggingCreateHeaderPayloadVm } from '../../models/smd-bagging-payload.vm';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { RedisService } from '../../../../shared/services/redis.service';

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
    payload.fieldResolverMap['baggingScanDate'] = 't1.bagging_date_real';
    payload.fieldResolverMap['branchBagging'] = 't4.branch_name';
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
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new ListBaggingResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async createBaggingMore(
    payload: SmdScanBaggingMorePayloadVm,
  ): Promise<SmdScanBaggingMoreResponseVm> {
    const result = new SmdScanBaggingMoreResponseVm();
    const p = new SmdScanBaggingPayloadVm();
    let totalSuccess = 0;
    let totalError = 0;
    p.baggingId = payload.baggingId;
    p.representativeCode = payload.representativeCode;
    result.data = [];
    const uniqueBag = [];

    if (typeof(payload.bagNumber) != 'object') {
      payload.bagNumber = [payload.bagNumber];
    }

    // TODO:
    // 1. get response createBagging of each bagNumber
    // 2. check and/or update baggingId and representativeCode every time insert/create bagging
    // 3. populate total
    for (const bagNumber of payload.bagNumber) {
      p.bagNumber = bagNumber;

      // handle duplikat
      const number = bagNumber.substring(0, 10);
      if (uniqueBag.includes(number)) {
        result.data.push({
          status: 'error',
          message: `Scan gabung paket ${bagNumber} duplikat!`,
          bagNumber,
        } as SmdScanBaggingDataMoreResponseVm);
        continue;
      }
      uniqueBag.push(number);

      const res = await this.createBagging(p);

      p.baggingId = p.baggingId ? p.baggingId : res.baggingId;
      p.representativeCode = p.representativeCode ? p.representativeCode : res.validRepresentativeCode;
      p.inputManualPrevData = res.inputManualPrevData;
      result.data.push({
        ...res,
        bagNumber,
      });

      if (res.status == 'success') {
        totalSuccess++;
      } else {
        totalError++;
      }
    }

    result.totalData = payload.bagNumber.length;
    result.totalError = totalError;
    result.totalSuccess = totalSuccess;
    return result;
  }

  static async createBagging(
    payload: SmdScanBaggingPayloadVm,
  ): Promise<SmdScanBaggingResponseVm> {
    const result = new SmdScanBaggingResponseVm();
    result.status = 'error';

    if (payload.bagNumber.length == 15 && payload.bagNumber.match(/^[A-Z0-9]{7}[0-9]{8}$/)) {
    } else if (payload.bagNumber.length == 10 && payload.bagNumber.match(/^[A-Z0-9]{7}[0-9]{3}$/)) {
    } else {
      result.message = 'Bag number tidak valid';
      return result;
    }

    const bagNumber = payload.bagNumber.substring(0, 7);
    const bagSeq = Number(payload.bagNumber.substring(7, 10));
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();
    // const weight = payload.bagNumber.substring(10);
    let baggingId = '';
    let baggingCode = '';
    let baggingData = new InputManualDataPayloadVm();

    // cek data gabung paket
    let rawQuery = `
      SELECT
        bi.bag_item_id AS bag_item_id,
        bi.weight as weight,
        bi.bag_item_status_id_last AS bag_item_status_id_last_in_bag_item,
        b.representative_id_to,
        r.representative_code,
        bai.bagging_item_id,
        ba.bagging_id,
        ba.bagging_code,
        ba.total_weight,
        ba.total_item,
        ba.branch_id,
        bih.bag_item_status_id
      FROM bag AS b
      INNER JOIN bag_item bi ON bi.bag_id = b.bag_id AND bi.is_deleted = false
      INNER JOIN representative r ON r.representative_id = b.representative_id_to AND r.is_deleted = FALSE
      LEFT JOIN bagging_item bai ON bi.bag_item_id = bai.bag_item_id AND bai.is_deleted = false
      LEFT JOIN bagging ba ON ba.bagging_id = bai.bagging_id AND ba.is_deleted = false
      LEFT JOIN bag_item_history bih ON bih.bag_item_id = bi.bag_item_id AND bih.is_deleted = false
        AND bih.bag_item_status_id = '${BAG_STATUS.DO_HUB}'
      WHERE
        b.bag_number = upper('${bagNumber}') AND
        bi.bag_seq = '${bagSeq}' AND
        b.is_deleted = false
      ORDER BY case when ba.branch_id = '${permissionPayload.branchId}' then 1 else 2 end, b.created_time DESC
      LIMIT 1;
      `;

    const dataPackage = await RawQueryService.query(rawQuery);
    if (dataPackage.length == 0) {
      result.message = 'Gabung paket tidak ditemukan';
      return result;
    }
    if ((dataPackage[0].bagging_item_id) && (dataPackage[0].branch_id == permissionPayload.branchId)) {
      // Ceking Double Scan Bagging / Branch
      result.status = 'failed';
      result.message = 'Resi ' + payload.bagNumber + ' sudah di scan bagging';
      return result;
    }
    // else if (dataPackage[0].bagging_item_id) {
    //   result.status = 'failed';
    //   result.message = 'Resi ' + payload.bagNumber + ' sudah di scan bagging';
    //   return result;
    // }
    if (!dataPackage[0].bag_item_status_id) {
      // handle kesalahan data saat scan masuk surat jalan
      result.message = 'Resi Gabung Paket belum di scan masuk';
      return result;
    }

    result.baggingId = baggingId;
    result.baggingCode = baggingCode;
    result.weight = dataPackage[0].weight;

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
        LEFT JOIN representative AS r ON r.representative_id = b.representative_id_to AND r.is_deleted = FALSE
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

      let representative_id_to = '';
      if (!payload.inputManualPrevData) { // if there is no data from previous input manual
        // Ambil data bagging dari payload
        rawQuery = `
          SELECT
            ba.bagging_id AS bagging_id,
            ba.bagging_code AS bagging_code,
            ba.total_weight AS total_weight,
            ba.total_item AS total_item,
            ba.representative_id_to
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
        baggingData.bagging_id = bagging[0].bagging_id;
        baggingData.bagging_code = bagging[0].bagging_code;
        baggingData.total_weight = Number(bagging[0].total_weight);
        baggingData.total_item = Number(bagging[0].total_item);
        representative_id_to = bagging[0].representative_id_to;
      } else {
        // NOTE: Handdle input manual prev data (Only For Input Manual)
        // inputManualPrevData is just for BE needs
        baggingData = payload.inputManualPrevData;
      }
      baggingId = result.baggingId = baggingData.bagging_id;
      baggingCode = result.baggingCode = baggingData.bagging_code;
      baggingData.total_weight = Number(dataPackage[0].weight) + Number(baggingData.total_weight);
      baggingData.total_item = Number(baggingData.total_item) + 1;

      // handle jika representative id bagging berbeda dengan representative di bag
      // update representative id bagging jika berbeda
      if (dataPackage[0].representative_id_to == representative_id_to || !dataPackage[0].representative_id_to) {
        await Bagging.update(baggingId, {
          totalWeight: baggingData.total_weight.toString(),
          totalItem: baggingData.total_item,
        }, {transaction: false});
      } else {
        await Bagging.update(baggingId, {
          totalWeight: baggingData.total_weight.toString(),
          totalItem: baggingData.total_item,
          representativeIdTo: dataPackage[0].representative_id_to,
        }, {transaction: false});
      }
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
      const paramBaggingCode = await CustomCounterCode.baggingCodeRandomCounter(moment().toDate());
      // Redlock for race condition
      const redlock = await RedisService.redlock(`redlock:bagging:${paramBaggingCode}`, 10);
      if (redlock) {
        const createBagging = Bagging.create();
        createBagging.userId = authMeta.userId.toString();
        createBagging.representativeIdTo = representative[0].representative_id;
        createBagging.branchId = permissionPayload.branchId.toString();
        createBagging.totalItem = 1;
        createBagging.totalWeight = dataPackage[0].weight.toString();
        createBagging.baggingCode = paramBaggingCode;
        createBagging.baggingDate = baggingDate;
        createBagging.userIdCreated = authMeta.userId.toString();
        createBagging.userIdUpdated = authMeta.userId.toString();
        createBagging.baggingDateReal = moment().toDate();
        createBagging.baggingSeq = maxBagSeq;
        createBagging.createdTime = moment().toDate();
        createBagging.updatedTime = moment().toDate();
        await Bagging.save(createBagging, {transaction: false});

        baggingId = createBagging.baggingId;
        baggingCode = createBagging.baggingCode;

        baggingData.bagging_id = createBagging.baggingId;
        baggingData.bagging_code = createBagging.baggingCode;
        baggingData.total_weight = Number(createBagging.totalWeight);
        baggingData.total_item = Number(createBagging.totalItem);

      } else {
        result.message = 'Data Bagging Sedang di proses, Silahkan Coba Beberapa Saat';
        return result;
      }
    }
    const baggingItem = BaggingItem.create();
    baggingItem.baggingId = baggingId;
    baggingItem.bagItemId = dataPackage[0].bag_item_id;
    baggingItem.userIdCreated = authMeta.userId.toString();
    baggingItem.userIdUpdated = authMeta.userId.toString();
    baggingItem.createdTime = moment().toDate();
    baggingItem.updatedTime = moment().toDate();
    BaggingItem.save(baggingItem, {transaction: false});

    await BagItem.update(dataPackage[0].bag_item_id, {
      baggingIdLast: Number(baggingId),
    }, {transaction: false});

    result.status = 'success';
    result.baggingId = baggingId;
    result.baggingCode = baggingCode;
    result.inputManualPrevData = baggingData;
    result.message = 'Scan gabung paket berhasil';
    result.bagNumber = payload.bagNumber;
    return result;
  }

  static async generateCode() {
    const codeAlike = 'BGX/' + moment().format('YYMM') + '/';
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
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new ListDetailBaggingResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async detailBaggingScanned(
    payload: SmdBaggingDetailPayloadVm,
    ): Promise<SmdBaggingDetailResponseVm> {
    const result = new SmdBaggingDetailResponseVm();

    const qb = createQueryBuilder();
    qb.addSelect( 'CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, \'0\'))', 'bagNumber');
    qb.addSelect( 'bi.weight', 'weight');
    qb.addSelect( 'bai.bagging_id', 'baggingId');
    qb.addSelect( 'ba.bagging_code', 'baggingCode');
    qb.addSelect( 'r.representative_code', 'representativeCode');
    qb.from('bagging_item', 'bai');
    qb.innerJoin('bag_item', 'bi', 'bai.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE');
    qb.innerJoin('bag', 'b', 'b.bag_id = bi.bag_id AND b.is_deleted = FALSE');
    qb.innerJoin('bagging', 'ba', 'ba.bagging_id = bai.bagging_id AND ba.is_deleted = FALSE');
    qb.innerJoin('representative', 'r', 'r.representative_id = b.representative_id_to AND r.is_deleted = FALSE');
    qb.andWhere(`bai.bagging_id = '${payload.baggingId}'`);
    qb.andWhere(`bai.is_deleted = FALSE`);
    result.data = await qb.getRawMany();

    return result;
  }

  static async createHeaderBagging(
    payload: BaggingCreateHeaderPayloadVm,
  ): Promise<CreateBaggingHeaderResponseVm> {
    const result = new CreateBaggingHeaderResponseVm();

    const bagNumber = payload.bagNumber.substring(0, 7);
    const bagSeq = Number(payload.bagNumber.substring(7, 10));
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();

    const rawQuery = `
      SELECT
        r.representative_code,
        b.representative_id_to
      FROM bag AS b
      INNER JOIN bag_item bi ON bi.bag_id = b.bag_id AND bi.is_deleted = FALSE
      INNER JOIN representative r ON r.representative_id = b.representative_id_to AND r.is_deleted = FALSE
      WHERE
        b.bag_number = upper('${bagNumber}') AND
        bi.bag_seq = '${bagSeq}' AND
        b.is_deleted = false
      LIMIT 1;
      `;

    const dataBag = await RawQueryService.query(rawQuery);
    if (dataBag.length == 0) {
      throw new BadRequestException('Gabung paket tidak ditemukan');
    }

    const baggingDate = await this.dateMinus1day(moment().toDate());
    const maxBagSeq = await this.getMaxBaggingSeq(dataBag[0].representative_id_to, baggingDate, permissionPayload.branchId);
    const paramBaggingCode = await CustomCounterCode.baggingCodeRandomCounter(moment().toDate());

    const createBagging = Bagging.create();
    createBagging.userId = authMeta.userId.toString();
    createBagging.representativeIdTo = dataBag[0].representative_id_to;
    createBagging.branchId = permissionPayload.branchId.toString();
    createBagging.totalItem = 0;
    createBagging.totalWeight = '0';
    createBagging.baggingCode = paramBaggingCode;
    createBagging.baggingDate = baggingDate;
    createBagging.userIdCreated = authMeta.userId.toString();
    createBagging.userIdUpdated = authMeta.userId.toString();
    createBagging.baggingDateReal = moment().toDate();
    createBagging.baggingSeq = maxBagSeq;
    createBagging.createdTime = moment().toDate();
    createBagging.updatedTime = moment().toDate();
    await Bagging.insert(createBagging);

    result.baggingId = createBagging.baggingId;
    result.baggingCode = createBagging.baggingCode;
    result.representativeCode = dataBag[0].representative_code;
    return result;
  }
}
