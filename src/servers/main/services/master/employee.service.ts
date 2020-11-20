import { HttpStatus, Injectable } from '@nestjs/common';

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { UserRole } from '../../../../shared/orm-entity/user-role';
import { AuthService } from '../../../../shared/services/auth.service';
import { ConfigService } from '../../../../shared/services/config.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import {
  EmployeeFindAllResponseVm,
  EmployeeMergerFindAllResponseVm,
  EmployeeResponseVm,
} from '../../models/employee.response.vm';

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

  async findAllEmployeeCodMergerByRequest(
    payload: BaseMetaPayloadVm,
  ): Promise<EmployeeMergerFindAllResponseVm> {
    const authMeta = AuthService.getAuthData();

    // mapping field
    payload.fieldResolverMap['userRoleId'] = 't1.user_role_id';
    payload.fieldResolverMap['username'] = 't2.username';
    payload.fieldResolverMap['nickname'] = 't3.nickname';
    payload.fieldResolverMap['roleName'] = 't4.role_name';
    payload.fieldResolverMap['branchName'] = 't5.branch_name';
    payload.fieldResolverMap['branchCode'] = 't5.branch_code';

    const repo = new OrionRepositoryService(UserRole, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.user_role_id', 'userRoleId'],
      ['t2.username', 'username'],
      ['t3.nickname', 'nickname'],
      ['t4.role_name', 'roleName'],
      ['t5.branch_name', 'branchName'],
      ['t5.branch_code', 'branchCode'],
    );

    q.innerJoin(e => e.users, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.leftJoin(e => e.users.employee, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.role, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branch, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    // Region COD Merger
    q.innerJoin(e => e.codUserToBranch, 't6', j =>
      j
        .andWhere(e => e.isDeleted, w => w.isFalse())
        .andWhere(e => e.userId, w => w.equals(authMeta.userId)),
    );
    // End Region

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new EmployeeMergerFindAllResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }
}
