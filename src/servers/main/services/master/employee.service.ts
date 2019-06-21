import { Injectable } from '@nestjs/common';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { EmployeeRequestPayloadVm } from '../../models/employee.vm';

@Injectable()
export class EmployeeService {
  constructor() {}
    async findAllEmployeeVm(
      payload: EmployeeRequestPayloadVm,
      ): Promise<EmployeeFindAllResponseVm> {
      const page = toInteger(payload.page) || 1;
      const take = toInteger(payload.limit) || 10;
      const search = payload.filters.search;
      const offset = (page - 1) * take;
      const sortBy = isEmpty(payload.sortBy) ? 'fullname' : payload.sortBy;
      const sortDir = isEmpty(payload.sortDir) ? 'ASC' : payload.sortDir;

      // FIXME: change to ORM
      const [query, parameters] = RawQueryService.escapeQueryWithParameters(
        `SELECT
          employee_id as "employeeId", nik,
          fullname as "employeeName"
        FROM employee
        WHERE fullname ILIKE '%${search}%' OR nik ILIKE '%${search}%'
        ORDER BY ${sortBy} ${sortDir} LIMIT :take OFFSET :offset`,
        { take, offset },
      );

      const [querycount, parameterscount] = RawQueryService.escapeQueryWithParameters(
        `SELECT count (*) FROM employee WHERE fullname ILIKE '%${search}%' OR nik ILIKE '%${search}%'`,
        { },
      );
      // exec raw query
      const data = await RawQueryService.query(query, parameters);
      const total = await RawQueryService.query(querycount, parameterscount);
      const result = new EmployeeFindAllResponseVm();
      result.data = data;
      result.paging = MetaService.set(page, take, toInteger(total[0].count));
      return result;
      }
}
