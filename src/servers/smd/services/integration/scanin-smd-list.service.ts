import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { ScanInSmdListResponseVm } from '../../models/scanin-smd-list.response.vm';

@Injectable()
export class ScaninSmdListService {
  static async findScanInList(
    payload: BaseMetaPayloadVm,
  ): Promise<ScanInSmdListResponseVm> {
    // ScanInListResponseVm
    // payload.fieldResolverMap['baggingDateTime'] = 'b.created_time';
    // payload.fieldResolverMap['branchId'] = 'bhin.branch_id';

    payload.fieldResolverMap['departure_schedule_date_time'] = 'dsd.departure_schedule_date_time';
    payload.fieldResolverMap['branch_id_from'] = 'dsd.branch_id_from';
    payload.fieldResolverMap['branch_id_to'] = 'dsd.branch_id_to';

    payload.globalSearchFields = [
      {
        field: 'departure_schedule_date_time',
      },
      {
        field: 'branch_id_from',
      },
      {
        field: 'branch_id_to',
      },
    ];

    const repo = new OrionRepositoryService(DoSmdDetail, 'dsd');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(
      ['dsd.do_smd_detail_id', 'do_smd_detail_id'],
      ['ds.do_smd_code', 'do_smd_code'],
      ['dsd.departure_schedule_date_time', 'departure_schedule_date_time'],
      ['dsd.arrival_time', 'arrival_time'],
      ['e.fullname', 'fullname'],
      ['dsv.vehicle_number', 'vehicle_number'],
      ['bf.branch_name', 'branch_from_name'],
      ['bt.branch_name', 'branch_to_name'],
      ['ds.total_bag', 'total_bag'],
      ['ds.total_bagging', 'total_bagging'],
    );

    q.innerJoinRaw(
      'do_smd',
      'ds',
      'dsd.do_smd_id = ds.do_smd_id and ds.is_deleted = false',
    );
    q.innerJoinRaw(
      'do_smd_vehicle',
      'dsv',
      'ds.vehicle_id_last = dsv.do_smd_vehicle_id  and dsv.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'bf',
      'dsd.branch_id_from = bf.branch_id and bf.is_deleted = false',
    );
    q.leftJoinRaw(
      'branch',
      'bt',
      'dsd.branch_id_to  = bt.branch_id  and bt.is_deleted = false',
    );
    q.leftJoinRaw(
      'employee',
      'e',
      'dsv.employee_id_driver = e.employee_id and e.is_deleted = false',
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ScanInSmdListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

}
