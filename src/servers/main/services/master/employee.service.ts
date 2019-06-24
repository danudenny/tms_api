import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { EmployeeRequestPayloadVm } from '../../models/employee.vm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';

@Injectable()
export class EmployeeService {

  constructor() {}
  async findAllEmployeeVm(
    payload: EmployeeRequestPayloadVm,
  ): Promise<EmployeeFindAllResponseVm> {
    // params
    const page = toInteger(payload.page) || 1;
    const take = toInteger(payload.limit) || 10;
    const search = payload.filters.search;
    const offset = (page - 1) * take;
    const sortBy = isEmpty(payload.sortBy) ? 'fullname' : payload.sortBy;
    const sortDir = payload.sortDir === 'asc' ? 'asc' : 'desc';

    // NOTE: query with ORM
    const queryPayload = new BaseQueryPayloadVm();
    // add pagination
    queryPayload.take = take;
    queryPayload.skip = offset;
    // add sorting data
    queryPayload.sort = [
      {
        field: sortBy,
        dir: sortDir,
      },
    ];
    // add filter
    queryPayload.filter = [
      [
        {
          field: 'nik',
          operator: 'like',
          value: search,
        },
      ],
      [
        {
          field: 'fullname',
          operator: 'like',
          value: search,
        },
      ],
    ];

    // add select field
    const qb = queryPayload.buildQueryBuilder();
    qb.addSelect('employee.employee_id', 'employeeId');
    qb.addSelect('employee.nik', 'nik');
    qb.addSelect('employee.fullname', 'employeeName');
    qb.from('employee', 'employee');

    // exec raw query
    const data = await qb.execute();
    const total = await qb.getCount();
    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
