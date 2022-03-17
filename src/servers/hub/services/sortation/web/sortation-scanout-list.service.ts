import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ScanOutSortationBagDetailMoreResponseVm,
  ScanOutSortationBagDetailResponseVm,
  ScanOutSortationHistoryResponseVm,
  ScanOutSortationListResponseVm,
  ScanOutSortationMonitoringResponseVm,
  ScanOutSortationRouteDetailResponseVm,
} from '../../../models/sortation/web/sortation-scanout-list.response.vm';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import {
  ScanOutSortationBagDetailPayloadVm,
  ScanOutSortationRouteDetailPayloadVm,
} from '../../../models/sortation/web/sortation-scanout-list.payload.vm';
import { createQueryBuilder, SelectQueryBuilder } from 'typeorm';
import { DoSortationDetailItem } from '../../../../../shared/orm-entity/do-sortation-detail-item';
import { OrionRepositoryService } from 'src/shared/services/orion-repository.service';
import { DoSortation } from 'src/shared/orm-entity/do-sortation';

@Injectable()
export class SortationScanOutListService {
  public static async getScanOutSortationList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutSortationListResponseVm> {
    payload.fieldResolverMap = {
      createdTime: 'ds.created_time',
      doSortationTime: 'ds.do_sortation_time',
      doSortationCode: 'ds.do_sortation_code',
      departureDateTime: 'ds.departure_date_time',
      arrivalDateTime: 'ds.arrival_date_time',
      totalBag: 'ds.total_bag',
      totalBagSortation: 'ds.total_bag_sortir',
      branchIdFrom: 'ds.branch_id_from',
      branchIdTo: 'ds.branch_id_to',
      doSortationStatusTitle: 'dss.do_sortation_status_title',
      vehicleNumber: 'dsv.vehicle_number',
      nickName: 'e.nickname',
    };
    payload.sortBy = payload.sortBy || 'createdTime';
    const searchFields = ['doSortationCode'];
    payload.globalSearchFields = searchFields.map(field => ({ field }));

    // handle 'ANY' operator in WHERE clause separately for VARCHAR[] column type
    const isBranchIdTo = field =>
      ['branchIdTo', 'branch_id_to', 'branchToName'].includes(field);
    const branchIdToFilter = payload.filters.filter(f => isBranchIdTo(f.field));
    payload.filters = payload.filters.filter(f => !isBranchIdTo(f.field));

    const repo = new OrionRepositoryService(DoSortation, 'ds');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumns = [
      ['ds.do_sortation_id', 'doSortationId'],
      ['ds.do_sortation_code', 'doSortationCode'],
      ['ds.do_sortation_time', 'doSortationTime'],
      ['e.fullname', 'fullName'],
      ['e.employee_id', 'employeeId'],
      ['dsv.vehicle_number', 'vehicleNumber'],
      ['bf.branch_name', 'branchFromName'],
      ['ds.branch_name_to_list', 'branchToName'],
      ['ds.total_bag', 'totalBag'],
      ['ds.total_bag_sortir', 'totalbagSortation'],
      ['dss.do_sortation_status_title', 'doSortationStatusTitle'],
      ['e.nickname', 'nickName'],
      ['e.nik', 'nik'],
      ['ds.arrival_date_time', 'arrivalDateTime'],
      ['ds.departure_date_time', 'departureDateTime'],
    ];
    q.selectRaw(...selectColumns)
      .innerJoin(e => e.branchFrom, 'bf', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.doSortationStatus, 'dss', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .leftJoin(e => e.doSortationVehicle, 'dsv', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .leftJoin(e => e.doSortationVehicle.employee, 'e', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

    if (branchIdToFilter.length > 0) {
      q.andWhereRaw(
        `'${branchIdToFilter[0].value}' = ANY(ds.branch_id_to_list)`,
      );
    }

    const [scanOutSortations, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new ScanOutSortationListResponseVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil daftar sortation berangkat';
    result.data = scanOutSortations;

    result.buildPagingWithPayload(payload, count);

    return result;
  }
  static async getScanOutSortationRouteDetail(
    payload: ScanOutSortationRouteDetailPayloadVm,
  ): Promise<ScanOutSortationRouteDetailResponseVm> {
    const q = RepositoryService.doSortationDetail.createQueryBuilder();

    const selectColumns = [
      'do_sortation_detail.do_sortation_detail_id AS "doSortationDetailId"',
      'br.branch_name AS "branchToName"',
    ];

    q.select(selectColumns)
      .innerJoin('do_sortation_detail.branchTo', 'br', 'br.is_deleted = FALSE')
      .andWhere('do_sortation_detail.do_sortation_id = :doSortationId', {
        doSortationId: payload.doSortationId,
      })
      .andWhere('do_sortation_detail.is_deleted = FALSE');

    const result = await q.getRawMany();

    return {
      statusCode: HttpStatus.OK,
      message: 'Sukses ambil daftar rute sortation',
      data: result,
    } as ScanOutSortationRouteDetailResponseVm;
  }

  static async getScanOutSortationBagDetail(
    payload: ScanOutSortationBagDetailPayloadVm,
  ): Promise<ScanOutSortationBagDetailResponseVm> {
    const id: string = payload.doSortationDetailId;
    const isSortir: boolean = payload.isSortir;
    const page: number = 1;
    const limit: number = 5;
    const q = this.getDoSortationDetailItemQuery(
      id,
      page,
      limit,
      'createdTime',
      'desc',
      isSortir,
    );
    const result = await q.getRawMany();
    return {
      statusCode: HttpStatus.OK,
      message: 'Sukses ambil daftar bag',
      data: result,
    } as ScanOutSortationBagDetailResponseVm;
  }

  static async getScanOutSortationBagDetailMore(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutSortationBagDetailResponseVm> {
    const idFilter = payload.filters
      ? payload.filters.find(filter => filter.field === 'doSortationDetailId')
      : null;
    if (!idFilter) {
      throw new BadRequestException('doSortationDetailId filter not found');
    }
    const isSortirFilter = payload.filters
      ? payload.filters.find(filter => filter.field === 'isSortir')
      : undefined;
    const id: string = idFilter.value;
    const isSortir: boolean = isSortirFilter ? isSortirFilter.value : undefined;
    const page: number = payload.page || 1;
    const limit: number = payload.limit || 10;
    const q = this.getDoSortationDetailItemQuery(
      id,
      page,
      limit,
      payload.sortBy,
      payload.sortDir,
      isSortir,
    );
    const [result, count] = await Promise.all([q.getRawMany(), q.getCount()]);
    const response = new ScanOutSortationBagDetailMoreResponseVm();
    response.statusCode = HttpStatus.OK;
    response.message = 'Sukses ambil daftar bag';
    response.data = result;
    response.buildPagingWithPayload(payload, count);
    return {
      statusCode: HttpStatus.OK,
      message: 'Sukses ambil daftar bag',
      data: result,
    } as ScanOutSortationBagDetailMoreResponseVm;
  }

  private static getDoSortationDetailItemQuery(
    doSortationDetailId: string,
    page: number = 1,
    limit: number = 5,
    sortBy: string = '',
    sortDir: string = '',
    isSortir?: boolean,
  ): SelectQueryBuilder<DoSortationDetailItem> {
    const q = RepositoryService.doSortationDetailItem.createQueryBuilder();

    const selectColumns = [
      'do_sortation_detail_item.do_sortation_detail_item_id AS "doSortationDetailItemId"',
      'do_sortation_detail_item.do_sortation_detail_id AS "doSortationDetailId"',
      'b.bag_number AS "bagNumber"',
      'bi.weight AS "weight"',
      'br.branch_code AS "branchCode"',
      'br.branch_name AS "branchToName"',
    ];

    q.select(selectColumns)
      .innerJoin(
        'do_sortation_detail_item.bagItem',
        'bi',
        'bi.is_deleted = FALSE',
      )
      .innerJoin('bi.bag', 'b', 'b.is_deleted = FALSE')
      .innerJoin(
        'do_sortation_detail_item.doSortationDetail',
        'dsd',
        'dsd.is_deleted = FALSE AND dsd.do_sortation_detail_id = :dsdId',
        { dsdId: doSortationDetailId },
      )
      .innerJoin('dsd.branchTo', 'br', 'br.is_deleted = FALSE')
      .andWhere('do_sortation_detail_item.is_deleted = FALSE');

    if (isSortir !== undefined) {
      q.andWhere('do_sortation_detail_item.is_sortir = :isSortir', {
        isSortir,
      });
    }
    const sortMap = {
      createdTime: 'do_sortation_detail_item.created_time',
      bagNumber: 'b.bag_number',
      weight: 'bi.weight',
      totalBagSortation: 'do_sortation.total_bag_sortir',
    };
    const orderBy: string = sortMap[sortBy] || sortMap.createdTime;
    const orderDir: 'ASC' | 'DESC' = sortDir === 'asc' ? 'ASC' : 'DESC';
    q.orderBy(orderBy, orderDir)
      .limit(limit)
      .offset((page - 1) * limit);

    return q;
  }

  static async getHistory(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutSortationHistoryResponseVm> {
    const idFilter = payload.filters
      ? payload.filters.find(filter => filter.field === 'doSortationId')
      : null;
    if (!idFilter) {
      throw new BadRequestException('doSortationId filter not found');
    }

    const q = RepositoryService.doSortationHistory.createQueryBuilder();

    // SELECT CLAUSE
    const selectColumns = [
      'do_sortation_history.do_sortation_history_id AS "doSortationHistoryId"',
      'do_sortation_history.do_sortation_id AS "doSortationId"',
      'do_sortation_history.reason_note AS "reasonNotes"',
      'do_sortation_history.created_time AS "historyDate"',
      'ds.do_sortation_code AS "doSortationCode"',
      'bf.branch_name AS "branchFromName"',
      'bt.branch_name AS "branchToName"',
      'dss.do_sortation_status_title AS "historyStatus"',
      `CONCAT(u.first_name, ' ', u.last_name) AS "username"`,
      'e.fullname AS "assigne"',
    ];

    q.select(selectColumns)
      .innerJoin(
        'do_sortation_history.doSortation',
        'ds',
        'ds.is_deleted = FALSE',
      )
      .innerJoin(
        'do_sortation_history.branchFrom',
        'bf',
        'bf.is_deleted = FALSE',
      )
      .leftJoin('do_sortation_history.branchTo', 'bt', 'bt.is_deleted = FALSE')
      .innerJoin(
        'do_sortation_history.doSortationStatus',
        'dss',
        'dss.is_deleted = FALSE',
      )
      .innerJoin('ds.user', 'u', 'u.is_deleted = FALSE')
      .leftJoin('ds.doSortationVehicle', 'dsv', 'dsv.is_deleted = FALSE')
      .leftJoin('dsv.employee', 'e', 'e.is_deleted = FALSE');

    // WHERE CLAUSE
    let where;
    if (payload.filters) {
      payload.filters.forEach(filter => {
        const field = ['endDate', 'startDate'].includes(filter.field)
          ? 'created_time'
          : filter.field;
        where = `do_sortation_history.${field} ${filter.sqlOperator} :${
          filter.field
        }`;
        const whereParams = { [filter.field]: filter.value };
        q.andWhere(where, whereParams);
      });
    }
    q.andWhere('do_sortation_history.is_deleted = FALSE');

    // ORDER & PAGINATION
    const sortMap = {
      createdTime: 'do_sortation_history.created_time',
      historyDate: 'do_sortation_history.created_time',
      historyStatus: 'dss.do_sortation_status_title',
      branchFromName: 'bf.branch_name',
      branchToName: 'bt.branch_name',
      username: 'u.first_name',
      assigne: 'e.fullname',
      notes: 'do_sortation_history.reason_note',
    };
    const orderBy: string = sortMap[payload.sortBy] || sortMap.createdTime;
    const orderDir: 'ASC' | 'DESC' = payload.sortDir === 'asc' ? 'ASC' : 'DESC';
    const limit = payload.limit || 10;
    const page = payload.page || 1;
    q.orderBy(orderBy, orderDir)
      .limit(limit)
      .offset((page - 1) * limit);

    const [scanOutHistories, count] = await Promise.all([
      q.getRawMany(),
      q.getCount(),
    ]);

    const result = new ScanOutSortationHistoryResponseVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil daftar riwayat sortation';
    result.data = scanOutHistories;
    result.buildPagingWithPayload(payload, count);

    return result;
  }

  static async getMonitoringList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutSortationMonitoringResponseVm> {
    const q = createQueryBuilder();

    // SELECT CLAUSE
    const selectColumns = [
      'ds.do_sortation_id AS "doSortationId"',
      'ds.do_sortation_code AS "doSortationCode"',
      'ds.do_sortation_time AS "doSortationTime"',
      'br.branch_name AS "branchFromName"',
      'ds.branch_name_to_list AS "branchToName"',
      'dsv.vehicle_number AS "vehicleNumber"',
      'v.vehicle_name AS "vehicleName"',
      'ds.trip AS "trip"',
      `CONCAT('T' || trips.max_trip) AS "sortationTrip"`,
      'weights.t AS "totalWeight"',
      'COALESCE(ds.total_bag, 0) + COALESCE(ds.total_bag_sortir, 0) AS "totalColly"',
      `v.vehicle_capacity AS vehicleCapacity`,
      // 'percentage_load', = totalWeight/ totalColly
      'e.fullname AS "employeeDriverName"',
      'ds.arrival_date_time AS "arrivalDateTime"',
      'ds.departure_date_time AS "departureDateTime"',
      // 'ds.transit_date_time AS "transitDateTime"', ?????
    ];
    q.select(selectColumns)
      .from('do_sortation', 'ds')
      .innerJoin(
        'branch',
        'br',
        'ds.branch_id_from = br.branch_id AND br.is_deleted = FALSE',
      )
      .innerJoin(
        'do_sortation_status',
        'dss',
        'ds.do_sortation_status_id_last = dss.do_sortation_status_id AND dss.is_deleted = FALSE',
      )
      .leftJoin(
        `(
        SELECT
          do_sortation_id,
          MAX(check_point) AS max_trip
        FROM
          do_sortation_detail
        WHERE is_deleted = FALSE
        GROUP BY do_sortation_id
        )`,
        'trips',
        'ds.do_sortation_id = trips.do_sortation_id',
      )
      .leftJoin(
        `(
        SELECT
          do_sortation_id,
          SUM(dsdi.total_weight) AS t
        FROM
          do_sortation_detail
          INNER JOIN (
            SELECT
              do_sortation_detail_id,
              SUM(bi.weight) AS total_weight
            FROM do_sortation_detail_item
            LEFT JOIN bag_item bi
              ON do_sortation_detail_item.bag_item_id = bi.bag_item_id
              AND bi.is_deleted = FALSE
            WHERE do_sortation_detail_item.is_deleted = FALSE
            GROUP BY do_sortation_detail_id
          ) dsdi ON dsdi.do_sortation_detail_id = do_sortation_detail.do_sortation_detail_id
        WHERE do_sortation_detail.is_deleted = FALSE
        GROUP BY do_sortation_id
        )`,
        'weights',
        'ds.do_sortation_id = weights.do_sortation_id',
      )
      .leftJoin(
        'do_sortation_vehicle',
        'dsv',
        'ds.do_sortation_id = dsv.do_sortation_id AND dsv.is_deleted = FALSE',
      )
      .leftJoin(
        'vehicle',
        'v',
        'dsv.vehicle_id = v.vehicle_id AND v.is_deleted = FALSE',
      )
      .leftJoin(
        'employee',
        'e',
        'dsv.employee_driver_id = e.employee_id AND e.is_deleted = FALSE',
      );

    // WHERE CLAUSE
    let where;
    if (payload.filters) {
      payload.filters.forEach(filter => {
        const field = ['endDate', 'startDate'].includes(filter.field)
          ? 'do_sortation_time'
          : filter.field;
        if (field == 'branchIdTo') {
          // handles where clause for column type varchar[]
          where = `'${filter.value}' = ANY(do_sortation.branch_id_to_list)`;
        } else {
          where = `ds.${field} ${filter.sqlOperator} :${filter.field}`;
        }
        const whereParams = { [filter.field]: filter.value };
        q.andWhere(where, whereParams);
      });
    }
    q.andWhere('ds.is_deleted = FALSE');

    // ORDER & PAGINATION
    const sortMap = {
      createdTime: 'ds.created_time',
      doSortationTime: 'ds.do_sortation_time',
      departureDateTime: 'ds.departure_date_time',
      arrivalDateTime: 'ds.arrival_date_time',
      totalBag: 'ds.total_bag',
      totalBagSortation: 'ds.total_bag_sortir',
      doSortationStatusTitle: 'dss.do_sortation_status_title',
      vehicleNumber: 'dsv.vehicle_number',
      vehicleName: 'v.vehicle_name',
      employeeDriverNameName: 'e.fullname',
    };
    const orderBy: string = sortMap[payload.sortBy] || sortMap.doSortationTime;
    const orderDir: 'ASC' | 'DESC' = payload.sortDir === 'asc' ? 'ASC' : 'DESC';
    const limit = payload.limit || 10;
    const page = payload.page || 1;
    q.orderBy(orderBy, orderDir)
      .limit(limit)
      .offset((page - 1) * limit);

    const [scanOutMonitoring, count] = await Promise.all([
      q.getRawMany(),
      q.getCount(),
    ]);

    const result = new ScanOutSortationMonitoringResponseVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil daftar sortation berangkat';
    result.data = scanOutMonitoring;

    result.buildPagingWithPayload(payload, count);

    return result;
  }
}
