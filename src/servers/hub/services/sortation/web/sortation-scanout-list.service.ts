import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ScanOutSortationBagDetailMoreResponseVm,
  ScanOutSortationBagDetailResponseVm,
  ScanOutSortationHistoryResponseVm,
  ScanOutSortationListResponseVm,
  ScanOutSortationMonitoringResponseVm,
  ScanOutSortationRouteDetailResponseVm,
  ScanOutSortationImageResponseVm,
} from '../../../models/sortation/web/sortation-scanout-list.response.vm';
import {
  BaseMetaPayloadFilterVm,
  BaseMetaPayloadFilterVmOperator,
  BaseMetaPayloadVm,
} from '../../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import {
  ScanOutSortationBagDetailPayloadVm,
  ScanOutSortationImagePayloadVm,
  ScanOutSortationRouteDetailPayloadVm,
} from '../../../models/sortation/web/sortation-scanout-list.payload.vm';
import { createQueryBuilder, In } from 'typeorm';
import { DoSortationDetailItem } from '../../../../../shared/orm-entity/do-sortation-detail-item';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { OrionRepositoryQueryService } from '../../../../../shared/services/orion-repository-query.service';
import { DoSortationHistory } from '../../../../../shared/orm-entity/do-sortation-history';
import { DO_SORTATION_STATUS } from '../../../../../shared/constants/do-sortation-status.constant';
import { DoSortationAttachment } from '../../../../../shared/orm-entity/do-sortation-attachment';
import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { DoSortationVehicle } from '../../../../../shared/orm-entity/do-sortation-vehicle';
import { AuthService } from '../../../../../shared/services/auth.service';
import { ScanOutSortationHandoverResponseVm } from '../../../models/sortation/web/sortation-scanout-response.vm';
import moment = require('moment');
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';

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
      branchToName: 'ds.branch_name_to_list',
      branchFromName: 'bf.branch_name',
      doSortationStatusTitle: 'dss.do_sortation_status_title',
      vehicleNumber: 'dsv.vehicle_number',
      nickName: 'e.nickname',
      fullName: 'e.fullname',
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
      ['ds.total_bag_sortir', 'totalBagSortation'],
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
    q.andWhere(e => e.isDeleted, w => w.isFalse());

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

  public static async getScanOutSortationBagDetail(
    payload: ScanOutSortationBagDetailPayloadVm,
  ): Promise<ScanOutSortationBagDetailResponseVm> {
    const queryPayload = new BaseMetaPayloadVm();
    queryPayload.page = 1;
    queryPayload.limit = 5;
    if (payload.isSortir !== undefined) {
      let isSortir: boolean | string = payload.isSortir;
      // prevents query error by boolean value
      if (typeof isSortir === 'boolean') {
        isSortir = isSortir ? 'true' : 'false';
      }
      queryPayload.filters.push(createFilter('isSortir', isSortir, 'eq'));
    }
    queryPayload.sortBy = 'createdTime';
    queryPayload.sortDir = 'desc';

    const q = this.getScanOutSortationBagDetailQuery(
      queryPayload,
      payload.doSortationDetailId,
    );
    const result = await q.exec();

    return {
      statusCode: HttpStatus.OK,
      message: 'Sukses ambil daftar bag',
      data: result,
    } as ScanOutSortationBagDetailResponseVm;
  }

  public static async getScanOutSortationBagDetailMore(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanOutSortationBagDetailResponseVm> {
    const idFilter = payload.filters
      ? payload.filters.find(filter => filter.field === 'doSortationDetailId')
      : null;
    if (!idFilter) {
      throw new BadRequestException('doSortationDetailId filter not found');
    }
    payload.filters = payload.filters.filter(
      f => f.field !== 'doSortationDetailId',
    );
    const q = this.getScanOutSortationBagDetailQuery(payload, idFilter.value);
    const [result, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);
    const response = new ScanOutSortationBagDetailMoreResponseVm();
    response.statusCode = HttpStatus.OK;
    response.message = 'Sukses ambil daftar bag';
    response.data = result;
    response.buildPagingWithPayload(payload, count);

    return response;
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

    payload.filters = payload.filters.filter(f => f.field !== 'doSortationId');
    payload.sortBy = payload.sortBy || 'createdTime';
    payload.fieldResolverMap = {
      createdTime: 'dsh.created_time',
      historyDate: 'dsh.created_time',
      historyStatus: 'dss.do_sortation_status_title',
      branchFromName: 'bf.branch_name',
      branchToName: 'bt.branch_name',
      branchIdFrom: 'bf.branch_id',
      branchIdTo: 'bt.branch_id',
      username: 'u.first_name',
      assigne: 'e.fullname',
      notes: 'dsh.reason_note',
      reasonNotes: 'dsh.reason_note',
      doSortationId: 'ds.do_sortation_id',
    };
    const repo = new OrionRepositoryService(DoSortationHistory, 'dsh');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    // SELECT CLAUSE
    const selectColumns = [
      ['dsh.do_sortation_history_id', 'doSortationHistoryId'],
      ['dsh.do_sortation_id', 'doSortationId'],
      ['dsh.reason_note', 'reasonNotes'],
      ['dsh.created_time', 'historyDate'],
      ['ds.do_sortation_code', 'doSortationCode'],
      ['bf.branch_name', 'branchFromName'],
      ['bt.branch_name', 'branchToName'],
      ['dsh.do_sortation_status_id', 'doSortationStatusId'],
      ['dss.do_sortation_status_title', 'historyStatus'],
      [`CONCAT(u.first_name, ' ', u.last_name)`, 'username'],
      ['e.fullname', 'assigne'],
    ];

    q.selectRaw(...selectColumns)
      .innerJoin(e => e.doSortation, 'ds', j =>
        j
          .andWhere(e => e.doSortationId, w => w.equals(idFilter.value))
          .andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.branchFrom, 'bf', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .leftJoin(e => e.branchTo, 'bt', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.doSortationStatus, 'dss', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.doSortation.user, 'u', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .leftJoin(e => e.doSortationVehicle, 'dsv', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .leftJoin(e => e.doSortationVehicle.employee, 'e', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const [scanOutHistories, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
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

  private static getScanOutSortationBagDetailQuery(
    payload: BaseMetaPayloadVm,
    doSortationDetailId: string,
  ): OrionRepositoryQueryService<DoSortationDetailItem, any> {
    payload.fieldResolverMap = {
      createdTime: 'dsdi.created_time',
      bagNumber: 'b.bag_number',
      weight: 'bi.weight',
      branchToName: 'br.branch_name',
      branchCode: 'br.branch_code',
      isSortir: 'dsdi.is_sortir',
      representativeCode: 'rp.representative_code',
    };
    payload.sortBy = payload.sortBy || 'createdTime';
    const repo = new OrionRepositoryService(DoSortationDetailItem, 'dsdi');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumns = [
      ['dsdi.do_sortation_detail_item_id', 'doSortationDetailItemId'],
      ['dsdi.do_sortation_detail_id', 'doSortationDetailId'],
      [
        `SUBSTR(CONCAT(b.bag_number, LPAD(bi.bag_seq::text, 3, \'0\')), 1, 10)`,
        'bagNumber',
      ],
      ['bi.weight', 'weight'],
      ['br.branch_code', 'branchCode'],
      ['br.branch_name', 'branchToName'],
      ['rp.representative_code', 'representativeCode'],
    ];

    q.selectRaw(...selectColumns)
      .innerJoin(e => e.bagItem, 'bi', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.bagItem.bag, 'b', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.doSortationDetail, 'dsd', j =>
        j
          .andWhere(
            e => e.doSortationDetailId,
            w => w.equals(doSortationDetailId),
          )
          .andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.doSortationDetail.branchTo, 'br', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .innerJoin(e => e.doSortationDetail.branchTo.representative, 'rp', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    return q;
  }

  public static async getScanOutImages(
    payload: ScanOutSortationImagePayloadVm,
  ): Promise<ScanOutSortationImageResponseVm> {
    const scanoutHistory = await DoSortationHistory.findOne(
      {
        doSortationHistoryId: payload.doSortationHistoryId,
        isDeleted: false,
      },
      { select: ['doSortationVehicleId', 'doSortationDetailId'] },
    );

    if (!scanoutHistory) {
      throw new BadRequestException(
        `Sortation Scanout History Id ${
          payload.doSortationHistoryId
        } not found!`,
      );
    }

    const repo = new OrionRepositoryService(DoSortationAttachment, 'dsa');
    const q = repo.findAllRaw();

    const selectColumns = [
      ['dsa.do_sortation_attachment_id', 'doSortationDetailAttachmentId'],
      ['at.url', 'imageUrl'],
      ['dsa.attachment_type', 'imageType'],
    ];
    q.selectRaw(...selectColumns).innerJoin(e => e.attachmentTms, 'at', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    if (payload.doSortationStatusId == DO_SORTATION_STATUS.PROBLEM) {
      // problem
      q.andWhere(
        e => e.doSortationVehicleId,
        w => w.equals(scanoutHistory.doSortationVehicleId),
      ).andWhereRaw(`LOWER(dsa.attachment_type) = 'problem`);
    } else if (
      payload.doSortationStatusId == DO_SORTATION_STATUS.BACKUP_PROCESS
    ) {
      // handover
      q.andWhere(
        e => e.doSortationVehicleId,
        w => w.equals(scanoutHistory.doSortationVehicleId),
      ).andWhereRaw(
        `LOWER(dsa.attachment_type) IN ('handover', 'handover_ttd')`,
      );
    } else {
      // photo
      q.andWhere(
        e => e.doSortationDetailId,
        w => w.equals(scanoutHistory.doSortationDetailId),
      ).andWhereRaw(`LOWER(dsa.attachment_type) IN ('signature', 'photo')`);
    }
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const attachments = await q.exec();

    const result = new ScanOutSortationImageResponseVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil daftar gambar';
    result.data = attachments;
    return result;
  }

  public static async sortationHandover(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSortationHandoverResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const resultDOSortation = await DoSortation.findOne({
      where: {
        doSortationId: payload.doSortationId,
        doSortationStatusIdLast: 8000,
        isDeleted: false,
      },
    });
    if (resultDOSortation) {
      const rawQuery = `
          SELECT
            do_sortation_vehicle_id,
            employee_driver_id
          FROM
            do_sortation_vehicle dsv
          INNER JOIN do_sortation ds ON ds.do_sortation_id = dsv.do_sortation_id AND ds.is_deleted = FALSE AND ds.do_sortation_status_id_last = 8000
          WHERE
            dsv.do_sortation_vehicle_id = '${
              resultDOSortation.doSortationVehicleIdLast
            }'
            AND dsv.is_active = TRUE
            AND dsv.is_deleted = FALSE; `;
      const resultDataDoSortationVehicle = await RawQueryService.query(
        rawQuery,
      );
      if (resultDataDoSortationVehicle.length > 0) {
        if (
          resultDataDoSortationVehicle[0].employee_driver_id !=
          payload.employeeIdDriver
        ) {
          const resultAllDriverVehicle = await this.findAllActiveVehicleInDriver(
            resultDataDoSortationVehicle[0].employee_driver_id,
          );
          const arrSmd = [];
          const vehicleId = [];
          for (const item of resultAllDriverVehicle) {
            vehicleId.push(item.do_sortation_vehicle_id);
          }
          const dataDoSortation = await DoSortation.find({
            where: {
              doSortationVehicleIdLast: In(vehicleId),
              doSortationStatusIdLast: 8000,
              isDeleted: false,
            },
          });

          const dataSortationVehicle = await DoSortationVehicle.findOne({
            where : {doSortationVehicleId : resultDOSortation.doSortationVehicleIdLast},
          });
          const vehicleSeqRunning = dataSortationVehicle.vehicleSeq + 1;

          for (const item of dataDoSortation) {
            /* Set Active False yang lama */
            await DoSortationVehicle.update(
              { doSortationVehicleId : item.doSortationVehicleIdLast },
              {
                isActive: false,
                userIdUpdated: authMeta.userId,
                updatedTime: moment().toDate(),
              },
            );

            /* Create Vehicle Dulu dan jangan update ke do_sortation*/
            const paramDoSortationVehicleId = await this.createDoSortationVehicle(
              item.doSortationId,
              payload.vehicleNumber,
              payload.employeeIdDriver,
              vehicleSeqRunning,
              permissonPayload.branchId,
              authMeta.userId,
            );

            const paramDoSortationHistoryId = await this.createDoSortationHistory(
              item.doSortationId,
              null,
              paramDoSortationVehicleId,
              item.doSortationTime,
              permissonPayload.branchId,
              1150,
              authMeta.userId,
            );

            item.doSortationStatusIdLast = 1150;
            item.userIdUpdated = authMeta.userId;
            item.updatedTime = moment().toDate();

            await DoSortationDetail.update(
              { doSortationId: item.doSortationId },
              {
                doSortationStatusIdLast: 1150,
                userIdUpdated: authMeta.userId,
                updatedTime: moment().toDate(),
              },
            );

            data.push({
              doSortationId: item.doSortationId,
              doSortationCode: item.doSortationCode,
              doSortationVehicleId: paramDoSortationVehicleId,
            });
          }

          result.statusCode = HttpStatus.OK;
          result.message = 'Nomor Sortation ' + arrSmd.join(',') + ' berhasil handover';
          result.data = data;
          return result;

        } else {
          throw new BadRequestException(
            `Tidak bisa handover ke driver yang sama.`,
          );
        }
      } else {
        throw new BadRequestException(
          `Alasan masalah tidak ditemukan di nomor Sortation: ` +
            resultDOSortation.doSortationCode,
        );
      }
    } else {
      throw new BadRequestException(
        `ID Sortation ` + payload.doSortationId + ` tidak ditemukan!`,
      );
    }
  }

  static async findAllActiveVehicleInDriver(
    employee_id_driver: number,
  ): Promise<any[]> {
    const rawQuery = `
        SELECT
          do_sortation_vehicle_id,
          employee_driver_id
        FROM
          do_sortation_vehicle dsv
        INNER JOIN do_sortation ds ON ds.do_sortation_id = dsv.do_sortation_id AND ds.is_deleted = FALSE AND ds.do_sortation_status_id_last = 8000
        WHERE
          dsv.employee_driver_id = ${employee_id_driver}
          AND dsv.is_active = TRUE
          AND dsv.is_deleted = FALSE; `;
    const resultDataDoSortationVehicle = await RawQueryService.query(rawQuery);
    return resultDataDoSortationVehicle;
  }

  private static async createDoSortationVehicle(
    paramDoSortationId: string,
    paramVehicleNumber: string,
    paramEmployeeId: number,
    paramVehicleSeq: number,
    paramBranchId: number,
    userId: number,
  ) {
    const dataDoSortationVehicle = DoSortationVehicle.create({
      doSortationId: paramDoSortationId,
      vehicleNumber: paramVehicleNumber,
      employeeDriverId: paramEmployeeId,
      branchIdCreated: paramBranchId,
      vehicleSeq : paramVehicleSeq,
      userIdCreated: userId,
      userIdUpdated: userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
    });
    const insertDoSortationVehicle = await DoSortationVehicle.insert(
      dataDoSortationVehicle,
    );
    console.log(insertDoSortationVehicle.identifiers[0]);
    return insertDoSortationVehicle.identifiers.length
      ? insertDoSortationVehicle.identifiers[0].doSortationVehicleId
      : null;
  }

  private static async createDoSortationHistory(
    paramDoSortationId: string,
    paramDoSortationDetailId: string,
    paramDoSortationVehicleId: string,
    paramDoSortationDepartureScheduleDate: Date,
    paramBranchId: number,
    paramDoSortationStatusId: number,
    userId: number,
  ) {
    const dataDoSortationHistory = DoSortationHistory.create({
      doSortationId: paramDoSortationId,
      doSortationDetailId: paramDoSortationDetailId,
      doSortationVehicleId: paramDoSortationVehicleId,
      doSortationTime: paramDoSortationDepartureScheduleDate,
      userIdCreated: userId,
      userIdUpdated: userId,
      doSortationStatusId: paramDoSortationStatusId,
      branchIdFrom: paramBranchId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
    });
    const insertDoSortationHistory = await DoSortationHistory.insert(
      dataDoSortationHistory,
    );
    return insertDoSortationHistory.identifiers.length
      ? insertDoSortationHistory.identifiers[0].doSortationHistoryId
      : null;
  }
}

const createFilter = (
  field: string,
  value: any,
  operator: BaseMetaPayloadFilterVmOperator,
  isOR: boolean = false,
) => {
  const filter = new BaseMetaPayloadFilterVm();
  filter.field = field;
  filter.value = value;
  filter.operator = operator;
  filter.isOR = isOR;
  return filter;
};
