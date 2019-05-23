import { Injectable } from '@nestjs/common';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { RawQueryService } from 'src/shared/services/raw-query.service';
import { EmployeeRequestPayloadVm } from '../../models/employee.vm';

@Injectable()
export class EmployeeService {
  constructor() {}
    async findAllEmployeeVm(
      payload: EmployeeRequestPayloadVm
      ): Promise<EmployeeFindAllResponseVm> {
      const page = toInteger(payload.page) || 1;
      const take = toInteger(payload.limit) || 10;
      const search = payload.filters.search
      const offset = (page - 1) * take;

      const [query, parameters] = RawQueryService.escapeQueryWithParameters(
        `select employee_id as "employeeId", nik as "nik",fullname as "employeeName" from employee where fullname LIKE '%${search}%' LIMIT :take`,
        { take},
      );

      const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
        `select count (*) from employee where fullname LIKE '%${search}%'`,
        { },
      );
      // exec raw query
      const data = await RawQueryService.query(query, parameters);
      const total = await RawQueryService.query(querycount, parameterscount);
      const result = new EmployeeFindAllResponseVm();
      result.data = data;
      result.paging = MetaService.set(page, take, total[0].count);
      return result;
      }
}

