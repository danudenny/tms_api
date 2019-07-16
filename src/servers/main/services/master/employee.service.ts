import { Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';

@Injectable()
export class EmployeeService {
  async findAllEmployeeByRequest(
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

    // mapping field
    payload.fieldResolverMap['employeeName'] = 'employee.fullname';

    const q = RepositoryService.employee.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['employee.employee_id', 'employeeId'],
      ['employee.nik', 'nik'],
      ['employee.fullname', 'employeeName'],
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
