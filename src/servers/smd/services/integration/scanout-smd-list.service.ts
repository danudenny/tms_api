import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { SysCounter } from '../../../../shared/orm-entity/sys-counter';
import { Bag } from '../../../../shared/orm-entity/bag';
import { ReceivedBag } from '../../../../shared/orm-entity/received-bag';
import { ReceivedBagDetail } from '../../../../shared/orm-entity/received-bag-detail';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm, ScanOutSmdItemResponseVm, ScanOutSmdSealResponseVm, ScanOutListResponseVm, ScanOutHistoryResponseVm, ScanOutSmdHandoverResponseVm, ScanOutSmdDetailResponseVm, ScanOutSmdDetailBaggingResponseVm, ScanOutDetailMoreResponseVm, ScanOutDetailBaggingMoreResponseVm, ScanOutSmdDetailRepresentativeResponseVm, ScanOutSmdImageResponseVm, ScanOutSmdDetailBagRepresentativeResponseVm, ScanOutDetailBagRepresentativeMoreResponseVm } from '../../models/scanout-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { WebScanInHubSortListResponseVm } from '../../../main/models/web-scanin-list.response.vm';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdVehicle } from '../../../../shared/orm-entity/do_smd_vehicle';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';

@Injectable()
export class ScanoutSmdListService {
  static async findScanOutList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutListResponseVm> {
    // ScanInListResponseVm
    // payload.fieldResolverMap['baggingDateTime'] = 'b.created_time';
    // payload.fieldResolverMap['branchId'] = 'bhin.branch_id';
    const data = await this.getQueryScanoutList(payload);

    const result = new ScanOutListResponseVm();

    result.data = data.data;
    result.paging = MetaService.set(payload.page, payload.limit, data.total);

    return result;
  }

  static async getQueryScanoutList(payload: BaseMetaPayloadVm, isGetTotal = true): Promise<any> {
    payload.fieldResolverMap['do_smd_time'] = 'ds.do_smd_time';
    payload.fieldResolverMap['branch_id_from'] = 'ds.branch_id';
    payload.fieldResolverMap['branch_id_to'] = 'dsd.branch_id_to';
    payload.fieldResolverMap['do_smd_code'] = 'ds.do_smd_code';

    payload.globalSearchFields = [
      {
        field: 'do_smd_time',
      },
      {
        field: 'branch_id_from',
      },
      {
        field: 'branch_id_to',
      },
      {
        field: 'do_smd_code',
      },
    ];

    const repo = new OrionRepositoryService(DoSmd, 'ds');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['ds.do_smd_id', 'do_smd_id'],
      ['ds.do_smd_code', 'do_smd_code'],
      ['ds.do_smd_time', 'do_smd_time'],
      ['e.fullname', 'fullname'],
      ['e.employee_id', 'employee_id'],
      ['dsv.vehicle_number', 'vehicle_number'],
      ['b.branch_name', 'branch_from_name'],
      ['ds.branch_to_name_list', 'branch_to_name'],
      ['ds.total_bag', 'total_bag'],
      ['ds.total_bagging', 'total_bagging'],
      ['ds.total_bag_representative', 'total_bag_representative'],
      ['dss.do_smd_status_title', 'do_smd_status_title'],
    );

    q.innerJoinRaw(
      'do_smd_detail',
      'dsd',
      'dsd.do_smd_id = ds.do_smd_id AND dsd.is_deleted = FALSE',
    );
    // q.innerJoin(e => e.doSmdDetail, 'dsd', j =>
    //   j.andWhere(e => e.isDeleted, w => w.isFalse()),
    // );
    q.innerJoin(e => e.doSmdVehicle, 'dsv', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.doSmdVehicle.employee, 'e', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoinRaw(
      'do_smd_status',
      'dss',
      'ds.do_smd_status_id_last = dss.do_smd_status_id AND dss.is_deleted = FALSE',
    );
    q.groupByRaw('ds.do_smd_id, ds.do_smd_code, ds.do_smd_time, e.fullname, e.employee_id, dsv.vehicle_number, b.branch_name, ds.total_bag, ds.total_bagging, ds.total_bag_representative, dss.do_smd_status_title');
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    const result = {
      data: null,
      total: null,
    };
    result.data = await q.exec();
    if (isGetTotal) {
      result.total = await q.countWithoutTakeAndSkip();
    }
    return result;
  }

  static async findScanOutHistory(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutHistoryResponseVm> {

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
      ['b.branch_name', 'branch_from_name'],
      ['ds.branch_to_name_list', 'branch_to_name'],
      ['dsh.created_time', 'history_date'],
      ['dsh.do_smd_status_id', 'do_smd_status_id'],
      ['dss.do_smd_status_title', 'history_status'],
      ['dsh.seal_number', 'seal_number'],
      ['', 'photo_url'],
      [`CONCAT(u.first_name, ' ', u.last_name )`, 'username'],
      ['e.fullname', 'assigne'],
      ['dsh.reason_notes', 'reason_notes'],
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
    // q.leftJoinRaw(
    //   'do_smd_vehicle_attachment',
    //   'dsva',
    //   'dsva.do_smd_vehicle_id = dsv.do_smd_vehicle_id AND dsva.is_deleted = FALSE',
    // );
    q.leftJoin(e => e.doSmdVehicle.employee, 'e', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.user, 'u', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    // q.leftJoin(e => e.reason, 'r', j =>
    //   j.andWhere(e => e.isDeleted, w => w.isFalse()),
    // );
    q.leftJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderByRaw('dsh.created_time', 'ASC');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanOutHistoryResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  static async findScanOutDetailRepresentative(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDetailRepresentativeResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });
    if (resultDoSmd) {
      const rawQuerySmdDetail = `
        SELECT
          dsd.do_smd_detail_id,
          b.branch_name
        FROM do_smd_detail dsd
        INNER JOIN branch b ON dsd.branch_id_to = b.branch_id AND b.is_deleted = FALSE
        WHERE
          dsd.do_smd_id= ${payload.do_smd_id} AND
          dsd.is_deleted = FALSE;
      `;
      const resultDataDoSmdDetail = await RawQueryService.query(rawQuerySmdDetail);
      if (resultDataDoSmdDetail.length > 0 ) {
        for (let i = 0; i < resultDataDoSmdDetail.length; i++) {
          data.push({
            do_smd_detail_id: resultDataDoSmdDetail[i].do_smd_detail_id,
            branch_name: resultDataDoSmdDetail[i].branch_name,
          });
        }
        result.statusCode = HttpStatus.OK;
        result.message = 'List Representative Success';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Detail Can't Found !`);
      }
    } else {
      throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Can't Found !`);
    }
  }

  static async findScanOutDetail(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDetailResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    // const resultDoSmd = await DoSmd.findOne({
    //   where: {
    //     doSmdId: payload.do_smd_id,
    //     isDeleted: false,
    //   },
    // });
    // if (resultDoSmd) {
    if (payload.bag_type == 1) {
      // Detail Gabung Paket
      // const rawQuerySmdDetail = `
      //   SELECT
      //     do_smd_detail_id
      //   FROM do_smd_detail
      //   WHERE
      //     do_smd_id= ${payload.do_smd_id} AND
      //     is_deleted = FALSE;
      // `;
      // const resultDataDoSmdDetail = await RawQueryService.query(rawQuerySmdDetail);
      const resultDoSmdDetail = await DoSmdDetail.findOne({
          where: {
            doSmdDetailId: payload.do_smd_detail_id,
            isDeleted: false,
          },
        });
      if (resultDoSmdDetail) {
        // for (let i = 0; i < resultDataDoSmdDetail.length; i++) {
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
        // }
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
    // } else {
    //   throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Can't Found !`);
    // }
  }

  static async findScanOutDetailBagging(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDetailBaggingResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    // const resultDoSmd = await DoSmd.findOne({
    //   where: {
    //     doSmdId: payload.do_smd_id,
    //     isDeleted: false,
    //   },
    // });
    // if (resultDoSmd) {
    if (payload.bag_type == 0) {
      // Detail Bagging
      // const rawQuerySmdDetail = `
      //   SELECT
      //     do_smd_detail_id
      //   FROM do_smd_detail
      //   WHERE
      //     do_smd_id= ${payload.do_smd_id} AND
      //     is_deleted = FALSE;
      // `;
      // const resultDataDoSmdDetail = await RawQueryService.query(rawQuerySmdDetail);
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
    // } else {
    //   throw new BadRequestException(`SMD ID: ` + payload.do_smd_id + ` Can't Found !`);
    // }
  }

  static async findScanOutDetailBagRepresentative(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDetailBagRepresentativeResponseVm();
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
        // for (let i = 0; i < resultDataDoSmdDetail.length; i++) {
        const rawQuery = `
          SELECT
            br.bag_representative_id,
            br.bag_representative_code,
            br.total_item
            CONCAT(br.total_weight::numeric(10,2), ' Kg') AS total_weight,
            r.representative_code,
            br.branch_name
          FROM do_smd_detail_item dsdi
          INNER JOIN do_smd_detail dsd ON dsdi.do_smd_detail_id = dsd.do_smd_detail_id AND dsd.is_deleted = FALSE
          INNER JOIN bag_representative br ON dsdi.bag_representative_id = br.bag_representative_id AND br.is_deleted = FALSE
          LEFT JOIN branch b ON dsd.branch_id_to = br.branch_id AND br.is_deleted = FALSE
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
      // }
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
      ['br.branch_name', 'branch_name'],
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
      'br',
      'dsd.branch_id_to = br.branch_id AND br.is_deleted = FALSE',
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

  static async findScanOutImage(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdImageResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    // let paramImageType;
    let paramWhere;

    const resultDoSmdHistory = await DoSmdHistory.findOne({
      where: {
        doSmdHistoryId: payload.do_smd_history_id,
        isDeleted: false,
      },
    });

    if (resultDoSmdHistory ) {
      if (payload.do_smd_status_id == 8000) {
        // paramImageType = 'problem';
        paramWhere = `d.do_smd_vehicle_id = ` + resultDoSmdHistory.doSmdVehicleId + ` AND lower(d.attachment_type) = 'problem'`;
      } else if (payload.do_smd_status_id == 1150) {
        // paramImageType = 'handover';
        paramWhere = `d.do_smd_vehicle_id = ` + resultDoSmdHistory.doSmdVehicleId + ` AND lower(d.attachment_type) in('handover', 'handover_ttd')`;
      } else {
        // paramImageType = 'photo';
        paramWhere = `d.do_smd_detail_id = ` + resultDoSmdHistory.doSmdDetailId + ` AND lower(d.attachment_type) in('signature', 'photo')`;
      }

      const rawQuery = `
        SELECT
          d.do_smd_detail_attachment_id,
          a.url,
          d.attachment_type
        FROM do_smd_detail_attachment d
        INNER JOIN attachment_tms a on d.attachment_tms_id = a.attachment_tms_id and a.is_deleted = false
        WHERE
          ${paramWhere}
          AND d.is_deleted = false
        ;
      `;
      const resultDataAttachment = await RawQueryService.query(rawQuery);
      if (resultDataAttachment.length > 0 ) {
        for (let a = 0; a < resultDataAttachment.length; a++) {
          data.push({
            do_smd_detail_attachment_id: resultDataAttachment[a].do_smd_detail_attachment_id,
            image_url: resultDataAttachment[a].url,
            image_type: resultDataAttachment[a].attachment_type,
          });
        }
      }

      result.statusCode = HttpStatus.OK;
      result.message = 'List Image Success';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`SMD History Id: ` + payload.do_smd_histroy_id + ` Can't Found !`);
    }
  }

}
