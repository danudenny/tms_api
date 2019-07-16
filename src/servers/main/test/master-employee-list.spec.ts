import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { Employee } from '../../../shared/orm-entity/employee';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { EmployeeFindAllResponseVm } from '../models/employee.response.vm';

describe('master-employee-list', () => {
  let employees: Employee[];

  beforeAll(async () => {
    employees = await TEST_GLOBAL_VARIABLE.entityFactory.for(Employee).create(5);
  });

  it('Valid list', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 2;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/employee/list', payload)
      .then(async response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const qEmployee = RepositoryService.employee.findAll();

        const result = response.data as EmployeeFindAllResponseVm;

        expect(result.data).toBeDefined();
        expect(result.data.length).toEqual(payload.limit);

        expect(result.paging.currentPage).toEqual(1);
        expect(result.paging.nextPage).toEqual(2);
        expect(result.paging.limit).toEqual(payload.limit);

        const totalData = await qEmployee.countWithoutTakeAndSkip();
        expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Verify created employees & sort', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const createdEmployeeIds = employees.map(e => e.employeeId);
    payload.filters = [
      {
        field: 'employeeId',
        operator: 'in',
        value: createdEmployeeIds,
      },
    ];

    payload.sortBy = 'employeeName';
    payload.sortDir = 'asc';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/employee/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as EmployeeFindAllResponseVm;
        expect(result.data.length).toEqual(5);
        expect(result.paging.totalData).toEqual(5);
        expect(
          result.data.filter(e => createdEmployeeIds.includes(e.employeeId)).length,
        ).toEqual(5);

        const sortedEmployeesByEmployeeName = sortBy(employees, e => e.employeeName);
        expect(result.data[0].employeeId).toEqual(
          sortedEmployeesByEmployeeName[0].employeeId,
        );

        const resultEmployee = result.data[0];
        expect(resultEmployee.employeeId).toBeDefined();
        expect(resultEmployee.nik).toBeDefined();
        expect(resultEmployee.employeeName).toBeDefined();

        const payloadEmployee = employees.find(
          e => e.employeeId === resultEmployee.employeeId,
        );
        expect(payloadEmployee.nik).toEqual(resultEmployee.nik);
        expect(payloadEmployee.employeeName).toEqual(resultEmployee.employeeName);
      });
  });

  it('Verify all filters for 200', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const employeeToCheck = employees[0];

    payload.filters = [
      {
        field: 'nik',
        operator: 'eq',
        value: employeeToCheck.nik,
      },
      {
        field: 'employeeName',
        operator: 'eq',
        value: employeeToCheck.employeeName,
      },
    ];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/employee/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as EmployeeFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultEmployee = result.data[0];
        expect(resultEmployee.employeeId).toEqual(employeeToCheck.employeeId);
        expect(resultEmployee.nik).toEqual(employeeToCheck.nik);
        expect(resultEmployee.employeeName).toEqual(employeeToCheck.employeeName);
      });
  });
});
