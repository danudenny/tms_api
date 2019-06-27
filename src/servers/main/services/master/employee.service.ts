import { Injectable } from '@nestjs/common';
import { MetaService } from '../../../../shared/services/meta.service';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@Injectable()
export class EmployeeService {

  constructor() {}
  async findAllEmployeeVm(
    payload: BaseMetaPayloadVm,
  ): Promise<EmployeeFindAllResponseVm> {
    // mapping search field and operator default ilike
    payload.searchFields = [
      {
        field: 'nik',
      },
      {
        field: 'employeeName',
      },
    ];

    // add field for filter and transform to snake case
    payload.setFieldResolverMapAsSnakeCase(['nik', 'employeeName']);

    // add select field
    const qb = payload.buildQueryBuilder();
    qb.addSelect('employee.employee_id', 'employeeId');
    qb.addSelect('employee.nik', 'nik');
    qb.addSelect('employee.fullname', 'employeeName');
    qb.from('employee', 'employee');

    // exec raw query
    payload.applyPaginationToQueryBuilder(qb);
    const total = await qb.getCount();
    const data = await qb.execute();

    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }
}
