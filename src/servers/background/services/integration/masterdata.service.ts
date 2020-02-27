import { Injectable } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { UserRole } from '../../../../shared/orm-entity/user-role';
import { MappingRoleResponseVm } from '../../models/mapping-role.response.vm';
import { MappingRolePayloadVm } from '../../models/mapping-role.payload.vm';
import { MappingRoleUserPayloadVm } from '../../models/mapping-role-user.payload.vm';
import { HttpStatus } from '@nestjs/common';
import { MappingRoleQueueService } from '../../../queue/services/mapping-role-queue.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { DatabaseConfig } from '../../config/database/db.config';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { RoleTmsResponseVm } from '../../models/role-tms.response.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

import moment = require('moment');

@Injectable()
export class MasterDataService {
  static async mappingRole(payload: MappingRolePayloadVm): Promise<MappingRoleResponseVm> {
    const result = new MappingRoleResponseVm();

    const users = await this.getUsers(payload.employeeRoleId);

    if (users.length > 0) {
      MappingRoleQueueService.addData(users, payload);

      result.data =  users;
      result.code = HttpStatus.OK;
      result.message = 'Success';
    } else {
      result.code = HttpStatus.UNPROCESSABLE_ENTITY;
      result.message = 'Employee Role Id Not Found';
    }

    return result;
  }

  static async mappingRoleUser(payload: MappingRoleUserPayloadVm): Promise<MappingRoleResponseVm> {
    const result = new MappingRoleResponseVm();

    const users = await this.getUsers(payload.employeeId, 1);

    if (users.length > 0) {
      const obj = await this.getMappingRole(payload);

      if (Object.getOwnPropertyNames(obj).length > 0) {
        MappingRoleQueueService.addDataUser(users, obj);
        result.data =  users;
        result.code = HttpStatus.OK;
        result.message = 'Success';
      } else {
        RequestErrorService.throwObj(
          {
            message: 'Role Mapping Not Found',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    } else {
      RequestErrorService.throwObj(
        {
          message: 'Employee Id Not Found',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return result;
  }

  static async roleTms(payload: BaseMetaPayloadVm): Promise<RoleTmsResponseVm> {
    const q = RepositoryService.role.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['role.role_id', 'roleId'],
      ['role.role_name', 'roleName'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new RoleTmsResponseVm();
    result.data = data;
    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  private static async getUsers(id: number, mode: number = 0): Promise<any> {
    let where = ' e.employee_role_id = :id ';
    if (mode == 1) {
      where = ' e.employee_id = :id ';
    }
    const query = `
      SELECT u.user_id as userId, e.branch_id as branchId
      FROM employee e
      INNER JOIN users u ON u.employee_id=e.employee_id and u.username=e.nik and u.is_deleted=false
      WHERE ` + where + ` and e.branch_id is not null and e.is_deleted=false
    `;

    return await RawQueryService.queryWithParams(query, {
      id,
    });
  }

  public static async insertUserRole(userId: number, branchId: number, payload: any) {
    const logTitle = '[INTEGRATION MASTER DATA] ';

    const arrRoleId = payload.roleIds;

    //#region Process For Tms
    let timeNow = moment().toDate();
    await UserRole.update(
      {
        userId,
        branchId,
      },
      {
        userIdUpdated: payload.userIdUpdated,
        updatedTime: timeNow,
        isDeleted: true,
      },
    );

    const arrUserRoleNew: UserRole[] = [];
    for (const rr of arrRoleId) {
      if (rr.roleId != null) {
        timeNow = moment().toDate();
        const userRole = UserRole.create(
          {
            userId,
            roleId: rr.roleId,
            branchId,
            createdTime: timeNow,
            updatedTime: timeNow,
            userIdCreated: userId,
            userIdUpdated: userId,
          },
        );
        arrUserRoleNew.push(userRole);
      }
    }

    if (arrUserRoleNew.length > 0) {
      await UserRole.insert(arrUserRoleNew);
    }
    //#endregion

    //#region Process For Master Data
    const pool: any = DatabaseConfig.getMasterDataDbPool();
    const client = await pool.connect();
    try {
      const queryDelete = `
        UPDATE user_role
        SET user_id_updated = $1, updated_time = $2, is_deleted = true
        WHERE user_id = $3 and branch_id = $4 and is_deleted=false
      `;
      await client.query(queryDelete, [payload.userIdUpdated, timeNow, userId, branchId], async function(err) {
        PinoLoggerService.debug(logTitle, this.sql);
        if (err) {
          PinoLoggerService.error(logTitle, err.message);
        }
      });

      for (const rr of arrRoleId) {
        if (rr.roleIdTms != null) {
          timeNow = moment().toDate();
          const queryInsert = `
            INSERT INTO user_role (
              user_id, role_id, branch_id, created_time, updated_time, user_id_created, user_id_updated
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `;
          await client.query(queryInsert, [userId, rr.roleIdTms, branchId, timeNow, timeNow, userId, userId], async function(err) {
            PinoLoggerService.debug(logTitle, this.sql);
            if (err) {
              PinoLoggerService.error(logTitle, err.message);
            }
          });
        }
      }
    } finally {
      client.release();
    }
    //#endregion
  }

  public static async getMappingRole(payload: MappingRoleUserPayloadVm) {
    let temp = {};
    try {
      const arrRoleId = [];
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT role_id, role_id_tms
          FROM role_mapping
          WHERE employee_role_id =$1
        `, [payload.employeeRoleId]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
          for (const r of res.rows) {
            arrRoleId.push(
              {
                roleId: r.role_id,
                roleIdTms: r.role_id_tms,
              },
            );
          }
          temp = {
            employeeId: payload.employeeId,
            employeeRoleId: payload.employeeRoleId,
            userIdUpdated: payload.userIdUpdated,
            roleIds: arrRoleId,
          };
        }

        return temp;
      } finally {
        client.release();
      }
    } catch (error) {
      return temp;
    }
  }
}
