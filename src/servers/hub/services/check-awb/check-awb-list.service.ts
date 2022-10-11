import { HttpStatus, Injectable } from '@nestjs/common';
import e from 'express';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbCheckLog } from '../../../../shared/orm-entity/awb-check-log';
import { AwbCheckSummary } from '../../../../shared/orm-entity/awb-check-summary';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { CheckAwbDetailResponVm, CheckAwbListResponVm } from '../../models/check-awb/check-awb-list.response';
import { CheckAwbResponseVM } from '../../models/hub-machine-sortir.vm';

@Injectable()
export class CheckAwbListService {

  async checkAwbList(payload: BaseMetaPayloadVm): Promise<CheckAwbListResponVm> {
    payload.sortBy = payload.sortBy || 'createdTime';

    const repo = new OrionRepositoryService(AwbCheckSummary, 'acs');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumn = [
      ['acs.awb_check_summary_id', 'awbCheckId'],
      ['acs.start_time', 'startTime'],
      ['acs.end_time', 'endTime'],
      ['acs.branch_id', 'branchId'],
      ['acs.logs', 'totalAwb'],
      ['ue.employee_id', 'nik'],
      ['ue.fullname', 'name'],

    ];
    q.selectRaw(...selectColumn)
      .innerJoin(e => e.user.employee, 'ue',  j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()));

    const [objCheckAwb, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new CheckAwbListResponVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data check AWV';
    result.data =  objCheckAwb;
    result.buildPagingWithPayload(payload, count);

    return result;

  }

  async checkAwbDetail(payload: BaseMetaPayloadVm): Promise<CheckAwbDetailResponVm> {

    const repo = new OrionRepositoryService(AwbCheckLog, 'acl');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumn = [
      ['acl.awb_check_summary_id', 'awbCheckSummaryId'],
      ['acl.awb_number', 'awbNumber'],
      ['a.consignee_name', 'consigneeName'],
      ['a.consignee_name', 'consigneeName'],
      ['a.consignee_address', 'consigneeAddress'],
      ['d.district_name', 'districtName'],

    ];
    q.selectRaw(...selectColumn)
      .leftJoin(e => e.awb, 'a',  j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()))
      .leftJoin(e => e.awb.district, 'd', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()));

    const [objDetailCheckAwb, count] = await Promise.all([
        q.exec(),
        q.countWithoutTakeAndSkip(),
      ]);

    const result = new CheckAwbDetailResponVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data check AWB';
    result.data =  objDetailCheckAwb;
    result.buildPagingWithPayload(payload, count);

    return result;
  }

}
