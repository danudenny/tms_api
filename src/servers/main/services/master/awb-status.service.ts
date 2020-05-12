import { Injectable } from '@nestjs/common';

import { AwbStatusFindAllResponseVm, AwbStatusNonDeliveFindAllResponseVm } from '../../models/awb-status.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RolePodManualStatus } from '../../../../shared/orm-entity/role-pod-manual-status';

@Injectable()
export class AwbStatusService {
  constructor() {}

  async listData(
    payload: BaseMetaPayloadVm,
  ): Promise<AwbStatusFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbStatusName',
      },
      {
        field: 'awbStatusTitle',
      },
    ];

    const q = RepositoryService.awbStatus.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['awb_status.awb_status_id', 'awbStatusId'],
      ['awb_status.awb_status_name', 'awbStatusName'],
      ['awb_status.awb_status_title', 'awbStatusTitle'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new AwbStatusFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
  async listDataNonDelive(
    payload: BaseMetaPayloadVm,
  ): Promise<AwbStatusNonDeliveFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'awbStatusName',
      },
      {
        field: 'awbStatusTitle',
      },
      {
        field: 'roleId',
      }
    ];
    payload.fieldResolverMap['roleId'] = 't1.role_id';
    payload.fieldResolverMap['isFinalStatus'] = 'awb_status.is_final_status';
    payload.fieldResolverMap['isReturn'] = 'awb_status.is_return';
    payload.fieldResolverMap['isProble'] = 'awb_status.is_problem';
    payload.fieldResolverMap['awbStatusName'] = 'awb_status.awb_status_name';
    payload.fieldResolverMap['awb_status_title'] = 'awb_status.awb_status_title';

    const db = await RolePodManualStatus.find({
        select: [
            'isBulky',
            'awbStatusId',
          ],
          where: {
            isDeleted: false,
          },
    });

    const q = RepositoryService.awbStatus.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.awb_status_id', 'awbStatusId'],
      ['t1.isBulky', 'isBulky'],
      ['awb_status.awb_status_name', 'awbStatusName'],
      ['awb_status.awb_status_title', 'awbStatusTitle'],
      ['awb_status.is_problem', 'isProblem'],
      ['awb_status.is_final_status', 'isFinalStatus'],
      );
    q.innerJoin(e => e.rolePodManualStatus, 't1', j => j.andWhere(e => e.isDeleted, w => w.isFalse()));
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orWhere(e => e.isProblem, w => w.isTrue());
    q.orWhere(e => e.isFinalStatus, w => w.isTrue());
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new AwbStatusNonDeliveFindAllResponseVm();

    result.buildPaging(payload.page, payload.limit, total);
    result.data = data;
    return result;
  }
}
