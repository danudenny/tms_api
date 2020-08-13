import { Injectable, PayloadTooLargeException, HttpStatus, BadRequestException } from '@nestjs/common';
import moment = require('moment');
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { ScanOutSmdVendorListResponseVm, ScanOutSmdDetailVendorResponseVm, ScanOutSmdDetailBaggingVendorResponseVm, ScanOutSmdDetailBagRepresentativeVendorResponseVm, ScanOutVendorHistoryResponseVm } from '../../models/scanout-smd-vendor.response.vm';
import {AuthService} from '../../../../shared/services/auth.service';
import {ScanOutSmdDetailResponseVm, ScanOutSmdDetailBaggingResponseVm, ScanOutSmdDetailBagRepresentativeResponseVm, ScanOutDetailMoreResponseVm, ScanOutDetailBaggingMoreResponseVm, ScanOutDetailBagRepresentativeMoreResponseVm} from '../../models/scanout-smd.response.vm';
import {DoSmdDetail} from '../../../../shared/orm-entity/do_smd_detail';
import {RawQueryService} from '../../../../shared/services/raw-query.service';
import {DoSmdDetailItem} from '../../../../shared/orm-entity/do_smd_detail_item';
import {QueryBuilderService} from '../../../../shared/services/query-builder.service';
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';

@Injectable()
export class ScanoutSmdVendorListService {
  static async scanOutVendorList(payload: BaseMetaPayloadVm): Promise<ScanOutSmdVendorListResponseVm> {

    // mapping search field and operator default ilike
    payload.fieldResolverMap['vendor_id'] = 't2.vendor_id';
    payload.fieldResolverMap['vendor_name'] = 't2.vendor_name';
    payload.fieldResolverMap['vendor_code'] = 't2.vendor_code';
    payload.fieldResolverMap['do_smd_id'] = 't1.do_smd_id';
    payload.fieldResolverMap['branch_id'] = 't4.branch_id';
    payload.fieldResolverMap['do_smd_code'] = 't1.do_smd_code';
    payload.fieldResolverMap['do_smd_time'] = 't1.do_smd_time';
    payload.fieldResolverMap['total_bag'] = 't1.total_bag';
    payload.fieldResolverMap['total_bagging'] = 't1.total_bagging';
    payload.fieldResolverMap['do_smd_detail_id'] = 't3.do_smd_detail_id';
    payload.fieldResolverMap['branch_name'] = 't4.branch_name';
    payload.fieldResolverMap['total_bag_representative'] = 't1.total_bag_representative';

    payload.globalSearchFields = [
      {
        field: 'vendorName',
      },
      {
        field: 'branchName',
      },
      {
        field: 'vendorCode',
      },
      {
        field: 'doSmdCode',
      },
    ];

    const repo = new OrionRepositoryService(DoSmd, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.vendor_id', 'vendor_id'],
      ['t1.vendor_name', 'vendor_name'],
      ['t2.vendor_code', 'vendor_code'],
      ['t3.do_smd_detail_id', 'do_smd_detail_id'],
      ['t4.branch_name', 'branch_name'],
      ['t4.branch_id', 'branch_id'],
      ['t1.do_smd_id', 'do_smd_id'],
      ['t1.do_smd_code', 'do_smd_code'],
      ['t1.do_smd_time', 'do_smd_time'],
      ['t1.total_bag', 'total_bag'],
      ['t1.total_bagging', 'total_bagging'],
      ['t1.total_bag_representative', 'total_bag_representative'],
    );

    q.leftJoin(e => e.vendor, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.doSmdDetails, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branch, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhereRaw('t1.is_deleted = false');
    q.andWhere(e => e.isVendor, w => w.isTrue());

    q.orderBy({ createdTime: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanOutSmdVendorListResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findScanOutDetail(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDetailVendorResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    if (payload.bag_type == 1) {

      const resultDoSmdDetail = await DoSmdDetail.findOne({
          where: {
            doSmdDetailId: payload.do_smd_detail_id,
            isDeleted: false,
          },
        });
      if (resultDoSmdDetail) {
        const rawQuery = `
          SELECT
            b.bag_id,
            CONCAT(b.bag_number, LPAD(CONCAT('', bi.bag_seq), 3, '0')) AS bag_number,
            CONCAT(bi.weight::numeric(10,2), ' Kg') AS weight,
            r.representative_code,
            br.branch_name
          FROM do_smd_detail_item dsdi
          INNER JOIN do_smd_detail dsd ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE
          INNER JOIN bag b ON dsdi.bag_id = b.bag_id AND b.is_deleted = FALSE
          INNER JOIN bag_item bi ON dsdi.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE
          LEFT JOIN representative r ON b.representative_id_to = r.representative_id AND r.is_deleted = FALSE
          LEFT JOIN branch br ON dsd.branch_id_to = br.branch_id AND br.is_deleted = FALSE
          WHERE
            dsdi.do_smd_detail_id = ${payload.do_smd_detail_id} AND
            dsdi.bag_type = 1 AND
            dsdi.is_deleted = FALSE
          LIMIT 5;
        `;
        const resultDataBag = await RawQueryService.query(rawQuery);
        if (resultDataBag.length > 0 ) {
          for (let a = 0; a < resultDataBag.length; a++) {
            data.push({
              do_smd_detail_id: payload.do_smd_detail_id,
              bag_number: resultDataBag[a].bag_number,
              weight: resultDataBag[a].weight,
              representative_code: resultDataBag[a].representative_code,
              branch_name: resultDataBag[a].branch_name,
            });
          }
        }
        result.statusCode = HttpStatus.OK;
        result.message = 'List Bag Success';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Detail Can't Found !`);
      }
    } else {
      throw new BadRequestException(`This API For Detail Bag / Gab.Paket Only`);
    }
  }

  static async findScanOutDetailBagging(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDetailBaggingVendorResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    if (payload.bag_type == 0) {
      const resultDoSmdDetail = await DoSmdDetail.findOne({
        where: {
          doSmdDetailId: payload.do_smd_detail_id,
          isDeleted: false,
        },
      });
      if (resultDoSmdDetail ) {
        // for (let i = 0; i < resultDataDoSmdDetail.length; i++) {
        const rawQuery = `
          SELECT
            d.bagging_id,
            bg.bagging_code,
            bg.total_item,
            CONCAT(bg.total_weight::numeric(10,2), ' Kg') AS total_weight,
            r.representative_code,
            br.branch_name
          FROM(
            SELECT
              dsdi.bagging_id,
              dsd.branch_id_to
            FROM do_smd_detail_item dsdi
            INNER JOIN do_smd_detail dsd ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE
            WHERE
              dsdi.do_smd_detail_id = ${payload.do_smd_detail_id} AND
              dsdi.bag_type = 0 AND
              dsdi.is_deleted = FALSE
            GROUP BY
              dsdi.bagging_id,
              dsd.branch_id_to
          )d
          INNER JOIN bagging bg ON bg.bagging_id = d.bagging_id AND bg.is_deleted = FALSE
          LEFT JOIN branch br ON d.branch_id_to = br.branch_id AND br.is_deleted = FALSE
          LEFT JOIN representative r ON bg.representative_id_to = r.representative_id  AND r.is_deleted = FALSE
          LIMIT 5;
        `;
        const resultDataBagging = await RawQueryService.query(rawQuery);
        if (resultDataBagging.length > 0 ) {
          for (let a = 0; a < resultDataBagging.length; a++) {
            data.push({
              do_smd_detail_id: payload.do_smd_detail_id,
              bagging_number: resultDataBagging[a].bagging_code,
              total_bag: resultDataBagging[a].total_item,
              weight: resultDataBagging[a].total_weight,
              representative_code: resultDataBagging[a].representative_code,
              branch_name: resultDataBagging[a].branch_name,
            });
          }
        }
      // }
        result.statusCode = HttpStatus.OK;
        result.message = 'List Bagging Success';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Detail Can't Found !`);
      }
    } else {
      throw new BadRequestException(`This API For Detail Bagging Only`);
    }
  }

  static async findScanOutDetailBagRepresentative(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDetailBagRepresentativeVendorResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    if (payload.bag_type == 2) {

      const resultDoSmdDetail = await DoSmdDetail.findOne({
        where: {
          doSmdDetailId: payload.do_smd_detail_id,
          isDeleted: false,
        },
      });
      if (resultDoSmdDetail ) {
          const rawQuery = `
          SELECT
            br.bag_representative_id,
            br.bag_representative_code,
            br.total_item,
            CONCAT(br.total_weight::numeric(10,2), ' Kg') AS total_weight,
            r.representative_code,
            b.branch_name
          FROM do_smd_detail_item dsdi
          INNER JOIN do_smd_detail dsd ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE
          INNER JOIN bag_representative br ON dsdi.bag_representative_id = br.bag_representative_id AND br.is_deleted = FALSE
          LEFT JOIN branch b ON dsd.branch_id_to = b.branch_id AND b.is_deleted = FALSE
          LEFT JOIN representative r ON br.representative_id_to = r.representative_id  AND r.is_deleted = FALSE
          WHERE
            dsdi.do_smd_detail_id = ${payload.do_smd_detail_id} AND
            dsdi.bag_type = 2 AND
            dsdi.is_deleted = FALSE
          LIMIT 5;
        `;
          const resultDataBagRepresentative = await RawQueryService.query(rawQuery);
          if (resultDataBagRepresentative.length > 0 ) {
          for (let a = 0; a < resultDataBagRepresentative.length; a++) {
            data.push({
              do_smd_detail_id: payload.do_smd_detail_id,
              bag_representative_code: resultDataBagRepresentative[a].bag_representative_code,
              total_awb: resultDataBagRepresentative[a].total_item,
              weight: resultDataBagRepresentative[a].total_weight,
              representative_code: resultDataBagRepresentative[a].representative_code,
              branch_name: resultDataBagRepresentative[a].branch_name,
            });
          }
        }
          result.statusCode = HttpStatus.OK;
          result.message = 'List Bag Representative Success';
          result.data = data;
          return result;
      } else {
        throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Detail Can't Found !`);
      }
    } else {
      throw new BadRequestException(`This API For Detail Bag Representative Only`);
    }
  }

  static async findScanOutDetailMore(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutDetailMoreResponseVm> {

    payload.fieldResolverMap['do_smd_detail_id'] = 'dsdi.do_smd_detail_id';

    payload.globalSearchFields = [
      {
        field: 'do_smd_detail_id',
      },
    ];
    const repo = new OrionRepositoryService(DoSmdDetailItem, 'dsdi');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['dsdi.do_smd_detail_id', 'do_smd_detail_id'],
      ['b.bag_id', 'bag_id'],
      [`CONCAT(b.bag_number, LPAD(CONCAT('', bi.bag_seq), 3, '0'))`, 'bag_number'],
      [`CONCAT(bi.weight::numeric(10,2), ' Kg')`, 'weight'],
      ['r.representative_code', 'representative_code'],
      ['br.branch_name', 'branch_name'],
    );

    q.innerJoinRaw(
      'do_smd_detail',
      'dsd',
      'dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE',
    );
    q.innerJoinRaw(
      'bag',
      'b',
      'dsdi.bag_id = b.bag_id AND b.is_deleted = FALSE',
    );
    q.innerJoinRaw(
      'bag_item',
      'bi',
      'dsdi.bag_item_id = bi.bag_item_id AND bi.is_deleted = FALSE',
    );
    q.leftJoinRaw(
      'representative',
      'r',
      'b.representative_id_to = r.representative_id AND r.is_deleted = FALSE',
    );
    q.leftJoinRaw(
      'branch',
      'br',
      'dsd.branch_id_to = br.branch_id AND br.is_deleted = FALSE',
    );
    q.andWhereRaw(`dsdi.bag_type = 1`);
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new ScanOutDetailMoreResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findScanOutDetailBaggingMore(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutDetailBaggingMoreResponseVm> {

    payload.fieldResolverMap['do_smd_detail_id'] = 'dsdi.do_smd_detail_id';
    payload.fieldFilterManualMap['do_smd_detail_id'] = true;
    const q = payload.buildQueryBuilder();

    q.select('d.bagging_id', 'bagging_id')
      .addSelect('bg.bagging_code', 'bagging_number')
      .addSelect('bg.total_item', 'total_bag')
      .addSelect(`CONCAT(bg.total_weight::numeric(10,2), ' Kg')`, 'weight')
      .addSelect('r.representative_code', 'representative_code')
      .addSelect('br.branch_name', 'branch_name')
      .from(subQuery => {
        subQuery
          .select('dsdi.bagging_id')
          .addSelect('dsd.branch_id')
          .from('do_smd_detail_item', 'dsdi')
          .innerJoin(
            'do_smd_detail',
            'dsd',
            'dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE',
          );

        payload.applyFiltersToQueryBuilder(subQuery, ['do_smd_detail_id']);

        subQuery
          .andWhere('dsdi.bag_type = 0')
          .andWhere('dsdi.is_deleted = false')
          .groupBy('dsdi.bagging_id')
          .addGroupBy('dsd.branch_id');

        return subQuery;
      }, 'd')
      .innerJoin(
        'bagging',
        'bg',
        'bg.bagging_id = d.bagging_id AND bg.is_deleted = FALSE',
      )
      .leftJoin(
        'branch',
        'br',
        'd.branch_id = br.branch_id AND br.is_deleted = FALSE',
      )
      .leftJoin(
        'representative',
        'r',
        'bg.representative_id_to = r.representative_id  AND r.is_deleted = FALSE',
      );

    const total = await QueryBuilderService.count(q, '1');
    payload.applyRawPaginationToQueryBuilder(q);
    const data = await q.getRawMany();

    const result = new ScanOutDetailBaggingMoreResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findScanOutDetailBagRepresentativeMore(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutDetailBagRepresentativeMoreResponseVm> {

    payload.fieldResolverMap['do_smd_detail_id'] = 'dsdi.do_smd_detail_id';

    payload.globalSearchFields = [
      {
        field: 'do_smd_detail_id',
      },
    ];
    const repo = new OrionRepositoryService(DoSmdDetailItem, 'dsdi');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['dsdi.do_smd_detail_id', 'do_smd_detail_id'],
      ['br.bag_representative_id', 'bag_representative_id'],
      [`br.bag_representative_code`, 'bag_representative_code'],
      [`br.total_item`, 'total_awb'],
      [`CONCAT(br.total_weight::numeric(10,2), ' Kg')`, 'weight'],
      ['r.representative_code', 'representative_code'],
      ['b.branch_name', 'branch_name'],
      ['dsd.branch_id_to', 'branch_id'],
    );

    q.innerJoinRaw(
      'do_smd_detail',
      'dsd',
      'dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE',
    );
    q.innerJoinRaw(
      'bag_representative',
      'br',
      'dsdi.bag_representative_id = br.bag_representative_id AND br.is_deleted = FALSE',
    );
    q.leftJoinRaw(
      'representative',
      'r',
      'br.representative_id_to = r.representative_id AND r.is_deleted = FALSE',
    );
    q.leftJoinRaw(
      'branch',
      'b',
      'dsd.branch_id_to = b.branch_id AND b.is_deleted = FALSE',
    );
    q.andWhereRaw(`dsdi.bag_type = 2`);
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new ScanOutDetailBagRepresentativeMoreResponseVm();
    result.data = data;

    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findScanOutVendorHistory(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutVendorHistoryResponseVm> {

    payload.fieldResolverMap['do_smd_id'] = 'ds.do_smd_id';

    payload.globalSearchFields = [
      {
        field: 'do_smd_id',
      },
    ];

    const repo = new OrionRepositoryService(DoSmdHistory, 'dsh');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['dsh.do_smd_history_id', 'do_smd_history_id'],
      ['ds.do_smd_id', 'do_smd_id'],
      ['ds.do_smd_code', 'do_smd_code'],
      ['ds.vendor_name', 'vendor_name'],
      ['b.branch_name', 'branch_from_name'],
      ['dsh.created_time', 'history_date'],
      ['dsh.do_smd_status_id', 'do_smd_status_id'],
      ['dss.do_smd_status_title', 'history_status'],
      [`CONCAT(u.first_name, ' ', u.last_name )`, 'username'],
    );

    q.innerJoin(e => e.doSmd, 'ds', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doSmdStatus, 'dss', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doSmdVehicle, 'dsv', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.user, 'u', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderByRaw('dsh.created_time', 'ASC');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanOutVendorHistoryResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
