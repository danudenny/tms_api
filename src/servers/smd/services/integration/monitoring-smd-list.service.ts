import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { SysCounter } from '../../../../shared/orm-entity/sys-counter';
import { Bag } from '../../../../shared/orm-entity/bag';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { ReceivedBag } from '../../../../shared/orm-entity/received-bag';
import { ReceivedBagDetail } from '../../../../shared/orm-entity/received-bag-detail';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { ScanInSmdBagResponseVm, ScanInSmdBaggingResponseVm, ScanInListResponseVm, ScanInDetailListResponseVm } from '../../models/scanin-smd.response.vm';
import { MonitoringResponseVm } from '../../models/smd-monitoring-response.vm';
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
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';

@Injectable()
export class MonitoringSmdServices {
  static async monitoringSmdList(
    payload: BaseMetaPayloadVm,
  ): Promise<MonitoringResponseVm> {

    payload.fieldResolverMap['do_smd_time'] = 'ds.do_smd_time';
    payload.fieldResolverMap['do_smd_code'] = 'ds.do_smd_code';
    payload.fieldResolverMap['branch_id'] = 'ds.branch_id';
    payload.fieldFilterManualMap['do_smd_time'] = true;
    payload.globalSearchFields = [
      {
        field: 'do_smd_code',
      },
      {
        field: 'branch_id',
      },
    ];
    // payload.fieldFilterManualMap['do_smd_code'] = true;
    const q = payload.buildQueryBuilder();

    q.select('ds.do_smd_code', 'do_smd_code')
      .addSelect('ds.do_smd_time', 'do_smd_time')
      .addSelect('ds.branch_id', 'branch_id')
      .addSelect('ds.route', 'route')
      .addSelect('ds.vehicle_number', 'vehicle_number')
      .addSelect('ds.vehicle_name', 'vehicle_name')
      .addSelect(`ds.trip`, 'trip')
      .addSelect('ds.total_weight', 'total_weight')
      .addSelect('ds.vehicle_capacity', 'vehicle_capacity')
      .addSelect(`((total_weight / vehicle_capacity::integer) * 100)`, 'percentage_load')
      .from(subQuery => {
        subQuery
          .select('ds.do_smd_code')
          .addSelect(`ds.do_smd_time`, 'do_smd_time')
          .addSelect(`bf.branch_id`, 'branch_id')
          .addSelect(`bf.branch_name || ' - ' || ds.branch_to_name_list`, 'route')
          .addSelect(`dsv.vehicle_number`, 'vehicle_number')
          .addSelect(`v.vehicle_name`, 'vehicle_name')
          .addSelect(`ds.trip`, 'trip')
          .addSelect(`(
                      select
                        sum(bi.weight)
                      from do_smd_detail dsd
                      inner join do_smd_detail_item dsdi on dsd.do_smd_detail_id = dsdi.do_smd_detail_id and dsdi.is_deleted =false
                      left join bag_item bi on dsdi.bag_item_id = bi.bag_item_id and bi.is_deleted = false
                      where
                        dsd.do_smd_id = ds.do_smd_id
                      group by
                        dsd.do_smd_id
                    )`, 'total_weight')
          .addSelect(`v.vehicle_capacity`, 'vehicle_capacity')
          .from('do_smd', 'ds')
          .innerJoin(
            'do_smd_vehicle',
            'dsv',
            'ds.vehicle_id_last = dsv.do_smd_vehicle_id and dsv.is_deleted = false ',
          )
          .leftJoin(
            'branch',
            'bf',
            'ds.branch_id = bf.branch_id and bf.is_deleted = false',
          )
          .leftJoin(
            'vehicle',
            'v',
            'dsv.vehicle_number = v.vehicle_number and v.is_deleted = false ',
          );

        payload.applyFiltersToQueryBuilder(subQuery, ['do_smd_time']);

        subQuery
          .andWhere('ds.is_deleted = false');
        return subQuery;
      }, 'ds');

    const total = await QueryBuilderService.count(q, '1');
    payload.applyRawPaginationToQueryBuilder(q);
    const data = await q.getRawMany();

    const result = new MonitoringResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

}
