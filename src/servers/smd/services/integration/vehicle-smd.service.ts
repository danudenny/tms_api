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
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm, ScanOutSmdItemResponseVm, ScanOutSmdSealResponseVm, ScanOutListResponseVm, ScanOutHistoryResponseVm, ScanOutSmdHandoverResponseVm, ScanOutSmdDetailResponseVm, ScanOutSmdDetailBaggingResponseVm } from '../../models/scanout-smd.response.vm';
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
import { RepositoryService } from '../../../../shared/services/repository.service';
import { ReasonSmdFindAllResponseVm } from '../../models/reason-smd.response.vm';
import { VehicleSmdFindAllResponseVm } from '../../models/vehicle-smd.response.vm';

@Injectable()
export class VehicleSmdService {
  static async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<VehicleSmdFindAllResponseVm> {
    // mapping search field and operator default ilike

    const permissonPayload = AuthService.getPermissionTokenPayload();
    payload.globalSearchFields = [
      {
        field: 'vehicle_number',
      },
      {
        field: 'vehicle_name',
      },
    ];

    const q = RepositoryService.vehicle.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['vehicle.vehicle_id', 'vehicle_id'],
      ['vehicle.vehicle_number', 'vehicle_number'],
      ['vehicle.vehicle_name', 'vehicle_name'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    if (permissonPayload.branchId !== 121) {
      q.andWhereRaw(`vehicle.branch_id = '${permissonPayload.branchId}'`);
    }

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new VehicleSmdFindAllResponseVm();
    result.data = data;

    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

}
