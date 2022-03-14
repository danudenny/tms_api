import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ScanOutSortationBagDetailMoreResponseVm,
  ScanOutSortationBagDetailResponseVm,
  ScanOutSortationHistoryResponseVm,
  ScanOutSortationListResponseVm,
  ScanOutSortationRouteDetailResponseVm,
} from '../../../models/sortation/web/sortation-scanout-list.response.vm';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import {
  ScanOutSortationBagDetailPayloadVm,
  ScanOutSortationRouteDetailPayloadVm,
} from '../../../models/sortation/web/sortation-scanout-list.payload.vm';
import { SelectQueryBuilder } from 'typeorm';
import { DoSortationDetailItem } from 'src/shared/orm-entity/do-sortation-detail-item';

@Injectable()
export class SortationScanOutListService {
  static async getScanOutSortationList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutSortationListResponseVm> {
    const q = RepositoryService.doSortation.createQueryBuilder();

    // SELECT CLAUSE
    const selectColumns = [
      'do_sortation.do_sortation_id AS "doSortationId"',
      'do_sortation.do_sortation_code AS "doSortationCode"',
      'do_sortation.do_sortation_time AS "doSortationTime"',
      'e.fullname AS "fullName"',
      'e.employee_id AS "employeeId"',
      'dsv.vehicle_number AS "vehicleNumber"',
      'br.branch_name AS "branchFromName"',
      'do_sortation.branch_name_to_list AS "branchToName"',
      'do_sortation.total_bag AS "totalBag"',
      'do_sortation.total_bag_sortir AS "totalbagSortation"',
      'dss.do_sortation_status_title AS "doSortationStatusTitle"',
      'e.nickname AS "nickName"',
      'e.nik AS "nik"',
      'do_sortation.arrival_date_time AS "arrivalDateTime"',
      'do_sortation.departure_date_time AS "departureDateTime"',
    ];
    q.select(selectColumns)
      .innerJoin('do_sortation.branchFrom', 'br', 'br.is_deleted = FALSE')
      .innerJoin(
        'do_sortation.doSortationStatus',
        'dss',
        'dss.is_deleted = FALSE',
      )
      .leftJoin(
        'do_sortation.doSortationVehicle',
        'dsv',
        'dsv.is_deleted = FALSE',
      )
      .leftJoin('dsv.employee', 'e', 'e.is_deleted = FALSE');

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
          where = `do_sortation.${field} ${filter.sqlOperator} :${
            filter.field
          }`;
        }
        const whereParams = { [filter.field]: filter.value };
        q.andWhere(where, whereParams);
      });
    }
    q.andWhere('do_sortation.is_deleted = FALSE');

    // ORDER & PAGINATION
    const sortMap = {
      createdTime: 'do_sortation.created_time',
      doSortationTime: 'do_sortation.do_sortation_time',
      departureDateTime: 'do_sortation.departure_date_time',
      arrivalDateTime: 'do_sortation.arrival_date_time',
      totalBag: 'do_sortation.total_bag',
      totalBagSortation: 'do_sortation.total_bag_sortir',
      doSortationStatusTitle: 'dss.do_sortation_status_title',
      vehicleNumber: 'dsv.vehicle_number',
      nickName: 'e.nickname',
    };
    const orderBy: string = sortMap[payload.sortBy] || sortMap.doSortationTime;
    const orderDir: 'ASC' | 'DESC' = payload.sortDir === 'asc' ? 'ASC' : 'DESC';
    const limit = payload.limit || 10;
    const page = payload.page || 1;
    q.orderBy(orderBy, orderDir)
      .limit(limit)
      .offset((page - 1) * limit);

    const [scanOutSortations, count] = await Promise.all([
      q.getRawMany(),
      q.getCount(),
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
    const q = this.getDoSortationDetailItemQuery(id, page, limit, isSortir);
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
    const idFilter = payload.filters ? payload.filters.find(
      filter => filter.field === 'doSortationDetailId',
    ) : null;
    if (!idFilter) {
      throw new BadRequestException('doSortationDetailId filter not found');
    }
    const isSortirFilter = payload.filters ? payload.filters.find(
      filter => filter.field === 'isSortir',
    ) : undefined;
    const id: string = idFilter.value;
    const isSortir: boolean = isSortirFilter ? isSortirFilter.value : undefined;
    const page: number = payload.page || 1;
    const limit: number = payload.limit || 10;
    const q = this.getDoSortationDetailItemQuery(id, page, limit, isSortir);
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

    q.orderBy('do_sortation_detail_item.created_time', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    return q;
  }

  static async getHistory(payload: BaseMetaPayloadVm): Promise<ScanOutSortationHistoryResponseVm> {
    const idFilter = payload.filters ? payload.filters.find(
      filter => filter.field === 'doSortationId',
    ) : null;
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
      `CONCAT(u.first_name, ' ', u.last_name ) AS "username"`,
      'e.fullname AS "assigne"',
    ];

    q.select(selectColumns)
      .innerJoin('do_sortation_history.doSortation', 'ds', 'ds.is_deleted = FALSE')
      .innerJoin('do_sortation_history.branchFrom', 'bf', 'bf.is_deleted = FALSE')
      .leftJoin('do_sortation_history.branchTo', 'bt', 'bt.is_deleted = FALSE')
      .innerJoin('do_sortation_history.doSortationStatus', 'dss', 'dss.is_deleted = FALSE')
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
      historyDate: 'do_sortation.creatd_time',
      historyStatus: 'dss.do_sortation_status_title',
      branchFromName: 'bf.branch_name',
      branchToName: 'bt.branch_name',
      username: 'u.first_name',
      assigne: 'e.fullname',
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
}
