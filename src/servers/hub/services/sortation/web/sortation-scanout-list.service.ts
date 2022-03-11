import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ScanOutSortationListResponseVm,
  ScanOutSortationRouteDetailResponseVm,
} from '../../../models/sortation/web/sortation-scanout-list.response.vm';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import { ScanOutSortationRouteDetailPayloadVm } from 'src/servers/hub/models/sortation/web/sortation-scanout-list.payload.vm';

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
    q.orderBy(orderBy, orderDir)
      .limit(payload.limit)
      .offset((payload.page - 1) * payload.limit);

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
      'do_sortation_detail.do_sortation_detail_id AS doSortationDetailId',
      'br.branch_name AS branchToName',
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
}
