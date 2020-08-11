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

@Injectable()
export class ReasonSmdService {
  static async findAllByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<ReasonSmdFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'reason_code',
      },
      {
        field: 'reason_name',
      },
    ];

    const q = RepositoryService.reason.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);
    
    q.selectRaw(
      ['reason.reason_id', 'reason_id'],
      ['reason.reason_code', 'reason_code'],
      ['reason.reason_name', 'reason_name'],
      ['reason.reason_type', 'reason_type'],
      ['reason.reason_category', 'reason_category'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.andWhereRaw(`reason.reason_category='smd'`);

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new ReasonSmdFindAllResponseVm();
    result.data = data;

    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

}
