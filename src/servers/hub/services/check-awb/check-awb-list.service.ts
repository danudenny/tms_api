import { HttpStatus, Injectable } from '@nestjs/common';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbCheckLog } from '../../../../shared/orm-entity/awb-check-log';
import { AwbCheckSummary } from '../../../../shared/orm-entity/awb-check-summary';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { CheckAwbDetailResponVm, CheckAwbListResponVm } from '../../models/check-awb/check-awb-list.response';
import moment= require('moment');

@Injectable()
export class CheckAwbListService {

  async checkAwbList(payload: BaseMetaPayloadVm): Promise<CheckAwbListResponVm> {

    payload.fieldResolverMap['awbCheckId'] = 'acs.awbCheckId';
    payload.fieldResolverMap['startTime'] = 'acs.start_time';
    payload.fieldResolverMap['endTime'] = 'acs.end_time';
    payload.fieldResolverMap['createdTime'] = 'acs.created_time';
    payload.fieldResolverMap['branchId'] = 'acs.branch_id';
    payload.fieldResolverMap['nik'] = 'ue.nik';
    payload.fieldResolverMap['totalAwb'] = 'acs.logs';

    if (payload.sortBy === '') {
      payload.sortBy = 'start_time';

    }

    const dateCreated = this.formatPayloadFiltersAwb(payload);
    const repo = new OrionRepositoryService(AwbCheckSummary, 'acs');
    const q = repo.findAllRaw();

    const selectColumn = [
      ['acs.awb_check_summary_id', 'awbCheckId'],
      ['acs.start_time', 'startTime'],
      ['acs.end_time', 'endTime'],
      ['acs.branch_id', 'branchId'],
      ['b.branch_code', 'branchCode'],
      ['b.branch_name', 'branchName'],
      ['acs.logs', 'totalAwb'],
      ['ue.nik', 'nik'],
      ['ue.fullname', 'name'],

    ];
    q.selectRaw(...selectColumn)
      .innerJoin(e => e.user.employee, 'ue',  j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()))
      .innerJoin(e => e.branch, 'b', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()));
    q.where(e => e.createdTime, w => w.greaterThan(dateCreated.start));
    q.andWhere(e => e.createdTime, w => w.lessThan(dateCreated.end));
    payload.applyToOrionRepositoryQuery(q, true);
    q.andWhere(e => e.logs, w => w.greaterThan(0));
    const [objCheckAwb, count] = await Promise.all([
      q.exec(),
      q.countWithoutTakeAndSkip(),
    ]);

    const result = new CheckAwbListResponVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data check AWB';
    result.data =  objCheckAwb;
    result.buildPagingWithPayload(payload, count);

    return result;

  }

  private formatPayloadFiltersAwb(payload: BaseMetaPayloadVm) {

    let value;
    let start;
    let end;
    if (payload.filters != null) {
      payload.filters.forEach(filter => {
        if (filter.field == 'startTime' && filter.value != null) {
          value = moment(filter.value).format('YYYY-MM-DD');
          if (filter.operator == 'gte') {
            start = value;
          } else {
            end = value;
          }
        }
      });
    }

    return {start, end};
  }

  async checkAwbDetail(payload: BaseMetaPayloadVm): Promise<CheckAwbDetailResponVm> {

    payload.fieldResolverMap['awbCheckId'] = 'acl.awb_check_summary_id';
    payload.fieldResolverMap['createdTime'] = 'acl.created_time';
    payload.fieldResolverMap['awbNumber'] = 'acl.awb_number';
    payload.fieldResolverMap['branchToName'] = 'dt.district_name';

    if (payload.sortBy === '') {
      payload.sortBy = 'createdTime';
    }

    const repo = new OrionRepositoryService(AwbCheckLog, 'acl');
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    const selectColumn = [
      ['acl.awb_check_summary_id', 'awbCheckId'],
      ['acl.awb_number', 'awbNumber'],
      ['acl.created_time', 'createdTime'],
      ['a.consignee_name', 'consigneeName'],
      ['a.consignee_address', 'consigneeAddress'],
      [`dt.district_name`, 'branchToName'],

    ];
    q.selectRaw(...selectColumn)
      .leftJoin(e => e.awb, 'a',  j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()))
      .leftJoinRaw('district', 'dt', 'dt.district_id = a.to_id and a.from_type = 40 ');
      // .leftJoinRaw('branch', 'bt', 'bt.branch_id = dt.branch_id_delivery');
      // .leftJoinRaw('representative', 'r', 'r.representative_id = bt.representative_id');

    const [objDetailCheckAwb, count] = await Promise.all([
        q.exec(),
        q.countWithoutTakeAndSkip(),
      ]);

    const result = new CheckAwbDetailResponVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil data detail check AWB';
    result.data =  objDetailCheckAwb;
    result.buildPagingWithPayload(payload, count);

    return result;
  }

}
