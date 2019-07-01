import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';

@Injectable()
export class EmployeeService {
  constructor() {}
  async findAllEmployeeVm(
    payload: BaseMetaPayloadVm,
  ): Promise<EmployeeFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'nik',
      },
      {
        field: 'employeeName',
      },
    ];

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('employee.employee_id', 'employeeId');
    qb.addSelect('employee.nik', 'nik');
    qb.addSelect('employee.fullname', 'employeeName');
    qb.from('employee', 'employee');

    const total = await qb.getCount();

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
