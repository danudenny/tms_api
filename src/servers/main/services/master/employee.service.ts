import { HttpStatus, Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ConfigService } from '../../../../shared/services/config.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { EmployeeFindAllResponseVm, EmployeeResponseVm } from '../../models/employee.response.vm';

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
    payload.fieldResolverMap['employeeRoleId'] = 'employee.employee_role_id';
    payload.fieldResolverMap['roleId'] = 'user_role.role_id';
    payload.fieldResolverMap['branchId'] = 'user_role.branch_id';

    const q = RepositoryService.employee.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(`
      DISTINCT(users.user_id) AS "userId",
      employee.nik AS "nik",
      employee.employee_id AS "employeeId",
      employee.fullname AS "employeeName"
    `);
    q.innerJoin(u => u.user, 'users', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(u => u.user.userRoles, 'user_role', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
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
    payload.fieldResolverMap['employeeRoleId'] = 'employee.employee_role_id';
    payload.fieldResolverMap['roleId'] = 'user_role.role_id';

    const q = RepositoryService.employee.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(`
      DISTINCT(users.user_id) AS "userId",
      employee.nik AS "nik",
      employee.employee_id AS "employeeId",
      employee.fullname AS "employeeName"
    `);

    q.innerJoin(u => u.user, 'users', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(u => u.user.userRoles, 'user_role', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.user.userRoles.branchId, w => w.equals(branchId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  async findAllEmployeeCodByRequest(
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
    payload.fieldResolverMap['employeeRoleId'] = 'employee.employee_role_id';
    payload.fieldResolverMap['roleId'] = 'user_role.role_id';
    payload.fieldResolverMap['branchId'] = 'user_role.branch_id';

    const q = RepositoryService.employee.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);
    q.selectRaw(`
      DISTINCT(users.user_id) AS "userId",
      employee.nik AS "nik",
      employee.employee_id AS "employeeId",
      employee.fullname AS "employeeName"
    `);
    q.innerJoin(u => u.user, 'users', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(u => u.user.userRoles, 'user_role');
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  async findAllEmployeeCodByRequestBranch(
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
    payload.fieldResolverMap['employeeRoleId'] = 'employee.employee_role_id';
    payload.fieldResolverMap['roleId'] = 'user_role.role_id';

    const q = RepositoryService.employee.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(`
      DISTINCT(users.user_id) AS "userId",
      employee.nik AS "nik",
      employee.employee_id AS "employeeId",
      employee.fullname AS "employeeName"
    `);

    q.innerJoin(u => u.user, 'users', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(u => u.user.userRoles, 'user_role');
    q.andWhere(e => e.user.userRoles.branchId, w => w.equals(branchId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

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
        user: {
          userId: true,
        },
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
        mobilePhone: employee.mobile1 ? employee.mobile1 : employee.mobile2,
        userId: employee.user.userId,
      };
      return { ...employee, ...additional };
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
