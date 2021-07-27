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
import { UserPasswordPayloadVm } from '../../models/user-password.payload.vm';
import { UserPasswordResponseVm } from '../../models/user-password.response.vm';

import moment = require('moment');
import { Role } from '../../../../shared/orm-entity/role';
import { EmployeePhonePayloadVm } from '../../models/employee-phone.payload.vm';
import { EmployeePhoneResponseVm } from '../../models/employee-phone.response.vm';

@Injectable()
export class MasterDataService {

  private static get logTitle() {
    return '[INTEGRATION MASTER DATA] ';
  }

  static async mappingRole(payload: MappingRolePayloadVm): Promise<MappingRoleResponseVm> {
    const result = new MappingRoleResponseVm();

    this.insertMappingRoleMasterData(payload);

    const users = await this.getUsers(payload.employeeRoleId);

    if (users.length > 0) {
      MappingRoleQueueService.addData(users, payload);
    }

    result.data =  users;
    result.code = HttpStatus.OK;
    result.message = 'Success';

    return result;
  }

  static async mappingRoleUser(payload: MappingRoleUserPayloadVm): Promise<MappingRoleResponseVm> {
    const result = new MappingRoleResponseVm();

    const users = await this.getUsers(payload.employeeId, 1, payload.branchIdLast, payload.branchIdNew);

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
      result.data =  users;
      result.code = HttpStatus.OK;
      result.message = 'Success';
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

  static async syncRoleTms(payload: any) {
    const result = [];

    const users = await this.getNotAvailableUserRole();

    if (users.length > 0) {
      for (const u of users) {
        const customPayload = new MappingRoleUserPayloadVm();
        customPayload.employeeId = u.employeeid;
        customPayload.employeeRoleId = u.employeeroleid;
        customPayload.branchIdLast = u.branchid;
        customPayload.branchIdNew = u.branchid;
        customPayload.userIdUpdated = 0;

        const obj = await this.getMappingRole(customPayload);

        if (Object.getOwnPropertyNames(obj).length > 0) {
          MappingRoleQueueService.addDataUserTms(users, obj);
        } else {
          PinoLoggerService.error(this.logTitle, 'EmployeeId ' + customPayload.employeeId +  ' Not Processed');
        }
      }
    }

    return result;
  }

  static async userPassword(payload: UserPasswordPayloadVm){
    const result = new UserPasswordResponseVm();
    result.code = HttpStatus.OK;
    result.message = 'Success';

    var upperCaseLetter = /[A-Z]/;
    var lowerCaseLetter = /[a-z]/;
    var numeric = /[0-9]/;

    if (payload.password.length >=8 && payload.password.match(upperCaseLetter) && payload.password.match(lowerCaseLetter) && payload.password.match(numeric)){
      //#region Process For Master Data
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const crypto = require('crypto');
        const password = crypto.createHash('md5').update(payload.password).digest('hex');

        const timeNow = moment().toDate();

        let employeeName = '';
        let roleName = '';
        const res = await client.query(`
          SELECT e.fullname, er.employee_role_name, u.password
          FROM users u
          LEFT JOIN employee e on u.employee_id = e.employee_id
          LEFT JOIN employee_role er on er.employee_role_id = e.employee_role_id
          WHERE u.username = $1 and u.is_deleted=false
        `, [payload.username]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
          for (const r of res.rows) {
            employeeName = r.fullname;
            roleName = r.employee_role_name;
          }
        }

        const query = `
          UPDATE users
          SET password = $1, updated_time = $2, user_id_updated = $3
          WHERE username = $4 and is_deleted=false
        `;
      
        await client.query(query, [password, timeNow, 1, payload.username], async function(err) {
          PinoLoggerService.debug(this.logTitle, this.sql);
          if (err) {
            result.code = HttpStatus.UNPROCESSABLE_ENTITY;
            result.message = 'Error update user pass';
            PinoLoggerService.error(this.logTitle, err.message);
          }
        });

        const query2 = `
          insert into user_reset_log (username, employee_name, password, role_name, created_time, user_id_created)
          values($1, $2, $3, $4, $5, $6);
        `;

        await client.query(query2, [ payload.username, employeeName, payload.password, roleName, timeNow, 1], async function(err) {
          PinoLoggerService.debug(this.logTitle, this.sql);
          if (err) {
            result.code = HttpStatus.UNPROCESSABLE_ENTITY;
            result.message = 'Error user reset log';
            PinoLoggerService.error(this.logTitle, err.message);
          }
        });

      } finally {
        client.release();
      }
      //#endregion
    } else {
      result.code = HttpStatus.UNPROCESSABLE_ENTITY;
      result.message = 'Password Must Contains Upper Case, Lower Case, Number, and minimum 8 characters';
    }

    return result;
  }

  // PRIVATE METHOD

  private static async getUsers(id: number, mode: number = 0, branchIdLast: number = 0, branchIdNew: number = 0): Promise<any> {
    let where = ' e.employee_role_id = :id ';
    let additionalSelect = ' , e.branch_id as branchIdLast, e.branch_id as branchIdNew ';
    if (mode == 1) {
      additionalSelect = ' , ' + branchIdLast + ' as branchIdLast, ' + branchIdNew + ' as branchIdNew ';
      where = ' e.employee_id = :id ';
    }
    const query = `
      SELECT u.user_id as userId ` + additionalSelect + `
      FROM employee e
      INNER JOIN users u ON u.employee_id=e.employee_id and u.username=e.nik and u.is_deleted=false
      WHERE ` + where + ` and e.branch_id is not null and e.is_deleted=false
    `;

    return await RawQueryService.queryWithParams(query, {
      id,
    });
  }

  public static async insertUserRole(userId: number, branchIdLast: number, branchIdNew: number, payload: any, mode: number = 0) {
    const arrRoleId = payload.roleIds;
    let timeNow = moment().toDate();

    //#region Process For Tms
      // Delete Previous branch_id_last
    if (branchIdLast != branchIdNew) {
      await UserRole.update(
        {
          userId,
          branchId: branchIdLast,
        },
        {
          userIdUpdated: payload.userIdUpdated,
          updatedTime: timeNow,
          isDeleted: true,
        },
      );
    }

      // Delete Previous User Role By user_id and branch_id_new
    await UserRole.update(
      {
        userId,
        branchId: branchIdNew,
      },
      {
        userIdUpdated: payload.userIdUpdated,
        updatedTime: timeNow,
        isDeleted: true,
      },
    );

    const arrUserRoleNew: UserRole[] = [];
    for (const rr of arrRoleId) {
      if (rr.roleIdTms != null) {
        timeNow = moment().toDate();
        const userRole = UserRole.create(
          {
            userId,
            roleId: rr.roleIdTms,
            branchId: branchIdNew,
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

    if (mode == 0) {
      //#region Process For Master Data
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        timeNow = moment().toDate();
        const queryDelete = `
          UPDATE user_role
          SET user_id_updated = $1, updated_time = $2, is_deleted = true
          WHERE user_id = $3 and branch_id = $4 and is_deleted=false
        `;

        // Delete Previous branch_id_last
        await client.query(queryDelete, [payload.userIdUpdated, timeNow, userId, branchIdLast], async function(err) {
          PinoLoggerService.debug(this.logTitle, this.sql);
          if (err) {
            PinoLoggerService.error(this.logTitle, err.message);
          }
        });

        // Delete Previous User Role By user_id and branch_id_new
        await client.query(queryDelete, [payload.userIdUpdated, timeNow, userId, branchIdNew], async function(err) {
          PinoLoggerService.debug(this.logTitle, this.sql);
          if (err) {
            PinoLoggerService.error(this.logTitle, err.message);
          }
        });

        for (const rr of arrRoleId) {
          if (rr.roleId != null) {
            timeNow = moment().toDate();
            const queryInsert = `
              INSERT INTO user_role (
                user_id, role_id, branch_id, created_time, updated_time, user_id_created, user_id_updated
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await client.query(queryInsert, [userId, rr.roleId, branchIdNew, timeNow, timeNow, userId, userId], async function(err) {
              PinoLoggerService.debug(this.logTitle, this.sql);
              if (err) {
                PinoLoggerService.error(this.logTitle, err.message);
              }
            });
          }
        }
      } finally {
        client.release();
      }
      //#endregion
    }
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
          WHERE employee_role_id =$1 and is_deleted=false
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

  public static async insertMappingRoleMasterData(payload: MappingRolePayloadVm) {
    const pool: any = DatabaseConfig.getMasterDataDbPool();
    const client = await pool.connect();
    const timeNow = moment().toDate();

    try {
      const queryDelete = `
        UPDATE role_mapping
        SET user_id_updated = $1, updated_time = $2, is_deleted = true
        WHERE employee_role_id = $3 and is_deleted=false
      `;

      // Delete Previous role_mapping by employee_role_id
      await client.query(queryDelete, [payload.userIdUpdated, timeNow, payload.employeeRoleId], async function(err) {
        PinoLoggerService.debug(this.logTitle, this.sql);
        if (err) {
          PinoLoggerService.error(this.logTitle, err.message);
        }
      });

      for (const rr of payload.roleIds) {
        let roleNameTms = '';
        const role = await Role.findOne({
          where: {
            roleId: rr.roleIdTms,
            isDeleted: false,
          },
        });
        if (role) {
          roleNameTms = role.roleName;
        }
        const query = `
          INSERT INTO role_mapping (
            employee_role_id, role_id, role_id_tms, role_name_tms, created_time, updated_time, user_id_created, user_id_updated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        await client.query(query, [payload.employeeRoleId, rr.roleId, rr.roleIdTms, roleNameTms, timeNow, timeNow, payload.userIdUpdated, payload.userIdUpdated], async function(err) {
          PinoLoggerService.debug(this.logTitle, this.sql);
          if (err) {
            PinoLoggerService.error(this.logTitle, err.message);
          }
        });
      }
    } finally {
      client.release();
    }
  }

  public static async getNotAvailableUserRole() {
    const backDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');

    const query = `
      SELECT e.employee_role_id as employeeRoleId, e.employee_id as employeeId, e.branch_id as branchId
      FROM users u
      INNER JOIN employee e on u.employee_id=e.employee_id and e.is_deleted=false and e.employee_role_id is not null and e.branch_id is not null
      LEFT JOIN user_role ur on u.user_id = ur.user_id and ur.is_deleted=false
      WHERE u.employee_id is not null and e.updated_time >= :backDate and u.is_deleted=false and ur.user_id is null and e.nik=u.username
      LIMIT 1000
    `;

    return await RawQueryService.queryWithParams(query, {
      backDate,
    });
  }

  static async updatePhone(payload: EmployeePhonePayloadVm){
    const result = new EmployeePhoneResponseVm();
    result.code = HttpStatus.OK;
    result.message = 'Success';
    
    var numeric = /[0-9]/;

    const nik = payload.nik;
    const phone = payload.phone;

    if (nik.length > 0 && phone.length > 0){
      if (phone.match(numeric) && phone.charAt(0) == '0'){
        //#region Process For Master Data
        const pool: any = DatabaseConfig.getMasterDataDbPool();
        const client = await pool.connect();
        try {  
          const timeNow = moment().toDate();
  
          let employee_id = 0;
          const res = await client.query(`SELECT employee_id FROM employee WHERE nik = $1 AND is_deleted = FALSE`, [nik]);
  
          if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              employee_id = r.employee_id;
            }
          } else{
            result.code = HttpStatus.UNPROCESSABLE_ENTITY;
            result.message = 'NIK is not found';
            return result;
          }
  
          const query = `
            UPDATE employee
            SET phone1 = $1, updated_time = $2, user_id_updated = $3
            WHERE employee_id = $4 and is_deleted = FALSE
          `;
        
          await client.query(query, [phone, timeNow, 1, employee_id], async function(err) {
            PinoLoggerService.debug(this.logTitle, this.sql);
            if (err) {
              result.code = HttpStatus.UNPROCESSABLE_ENTITY;
              result.message = 'Error update employee phone';
              PinoLoggerService.error(this.logTitle, err.message);
            }
          });  
        } finally {
          client.release();
        }
        //#endregion
      } else {
        result.code = HttpStatus.UNPROCESSABLE_ENTITY;
        result.message = 'Phone must contains numeric and started with 0';
      }
    } else{
      result.code = HttpStatus.UNPROCESSABLE_ENTITY;
      result.message = 'NIK and Phone cannot be empty';
    }
    return result;
  }

}
