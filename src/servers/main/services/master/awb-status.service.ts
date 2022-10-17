import { Injectable } from '@nestjs/common';

import {
  AwbStatusFindAllResponseVm,
  AwbStatusNonDeliveFindAllResponseVm,
} from '../../models/awb-status.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { AwbService } from '../v1/awb.service';

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
    ];
    // payload.fieldResolverMap['roleId'] = 't1.role_id';
    payload.fieldResolverMap['isFinalStatus'] = 't1.is_final_status';
    payload.fieldResolverMap['isReturn'] = 't1.is_return';
    payload.fieldResolverMap['isProblem'] = 't1.is_problem';
    payload.fieldResolverMap['awbStatusName'] = 't1.awb_status_name';
    payload.fieldResolverMap['awb_status_title'] = 't1.awb_status_title';

    const q = RepositoryService.rolePodManualStatus.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['role_pod_manual_status.awb_status_id', 'awbStatusId'],
      ['t1.awb_status_name', 'awbStatusName'],
      ['t1.awb_status_title', 'awbStatusTitle'],
      ['t1.is_problem', 'isProblem'],
      ['t1.is_final_status', 'isFinalStatus'],
    );
    q.innerJoin(e => e.awbStatus, 't1', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();
    const result = new AwbStatusNonDeliveFindAllResponseVm();

    result.buildPaging(payload.page, payload.limit, total);
    result.data = data;
    return result;
  }

  static async checkValidAwbStatusIdLast(
    awbItemAttr: AwbItemAttr,
    optionalInBranch?: Boolean,
    optionalManifested?: Boolean,
    isReturCheck = true,
    isLostCheck = false
  ) {
    let message = `Resi ${awbItemAttr.awbNumber} tidak dapat di proses.`;
    let isValid = false;
    if (awbItemAttr.awbStatusIdLast) {
      if (AWB_STATUS.ANT == awbItemAttr.awbStatusIdLast) {
        message = `Resi ${awbItemAttr.awbNumber} sudah di proses.`;
        return { isValid, message };
      }
      if (AWB_STATUS.DLV == awbItemAttr.awbStatusIdLast) {
        message = `Resi ${awbItemAttr.awbNumber} sudah deliv`;
        return { isValid, message };
      }
      if (
        !optionalInBranch &&
        AWB_STATUS.IN_BRANCH != awbItemAttr.awbStatusIdLast
      ) {
        message = `Resi ${awbItemAttr.awbNumber} belum di Scan In`;
        return { isValid, message };
      }

      if (AWB_STATUS.BROKE == awbItemAttr.awbStatusIdLast && isLostCheck) {
        message = `Resi ${awbItemAttr.awbNumber} lost`;
        return { isValid, message };
      }

      let arrRetval = await AwbService.validationContainAwBStatus(optionalManifested, awbItemAttr.awbNumber, awbItemAttr.awbItemId, isReturCheck);
      if(arrRetval[0] == true){
        let message = arrRetval[1]
        return {isValid, message};
      } 

      isValid = true;
    }
    return { isValid, message };
  }
}
