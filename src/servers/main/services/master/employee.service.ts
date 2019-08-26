import { Injectable, HttpStatus } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { EmployeeFindAllResponseVm, EmployeeResponseVm } from '../../models/employee.response.vm';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { ConfigService } from '../../../../shared/services/config.service';

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

  async findAllEmployeeByRequestBranch(
    payload: BaseMetaPayloadVm,
    branchId: string,
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

    q.innerJoin(e => e.branch, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.branch.branchId, w => w.equals(branchId));

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  async findById(employeeId: number): Promise<EmployeeResponseVm> {
    // TODO: to be improvement
    const employee = await RepositoryService.employee
      .findOne()
      .leftJoin(e => e.attachment, null, join =>
        join.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .where(e => e.employeeId, w => w.equals(employeeId))
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .select({
        employeeId: true,
        employeeName: true,
        nik: true,
        homeAddress: true,
        idCardAddress: true,
        mobile1: true,
        mobile2: true,
        attachment: {
          attachmentId: true,
          attachmentPath: true,
        },
      });
    if (employee) {
      const pathImage = employee.attachment
        ? employee.attachment.attachmentPath
        : 'attachments/tms-check-in/1565581705338-20151017.png'; // set default image
      // NOTE: manipulate data
      const additional = {
        attachmentUrl: `${ConfigService.get(
          'cloudStorage.cloudUrl',
        )}/${pathImage}`,
        mobilePhone: employee.mobile1
          ? employee.mobile1
          : employee.mobile2,
      };

      return {...employee, ...additional};
    } else {
      RequestErrorService.throwObj(
        {
          message: 'data employee not found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
