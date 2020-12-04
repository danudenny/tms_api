import { Injectable } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { UserRole } from '../../../../shared/orm-entity/user-role';
import { MappingRoleResponseVm } from '../../models/mapping-role.response.vm';
import { MappingRolePayloadVm } from '../../models/mapping-role.payload.vm';
import { MappingRoleUserPayloadVm } from '../../models/mapping-role-user.payload.vm';
import { SunfishEmployeeResponseVm } from '../../models/sunfish-employee.response.vm';
import { HttpStatus } from '@nestjs/common';
import { MappingRoleQueueService } from '../../../queue/services/mapping-role-queue.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { DatabaseConfig } from '../../config/database/db.config';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { RoleTmsResponseVm } from '../../models/role-tms.response.vm';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ConfigService } from '../../../../shared/services/config.service';

import moment = require('moment');
import axios from 'axios';
import { Role } from '../../../../shared/orm-entity/role';

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

  static async sunfishEmployee(payload: any): Promise<SunfishEmployeeResponseVm> {
    const result = new SunfishEmployeeResponseVm();
    const res_data = [];
    const resSuccess = [];
    const resUnsuccess = [];
    const updated_time = moment().toDate();
    const timeNow = moment().toDate();
    let url = `${ConfigService.get('sunfish.baseUrl')}sicepat_FULL_getEmployeeData`;

    const obj = await this.getCronSunfishUpdateDate();

    if (obj !== null || obj != null) {
      url += `&modified_date=` + moment(obj).format('YYYY-MM-DD HH:mm:ss');
    }

    const headers = {
      'X-SFAPI-Account': ConfigService.get('sunfish.accountName'),
      'X-SFAPI-AppName': ConfigService.get('sunfish.appName'),
      'X-SFAPI-RSAKey': ConfigService.get('sunfish.rsaAKey'),
    };

    const config = {
      headers,
    };
    // try {
    let retry = 1;
    let success = false;
    let resData = [];
    const result_data = [];

    while (success == false && retry <= 5) {
      const response = await axios.get(url, config);
      resData = response.data;

      console.log('### START POST GET SUNFISH EMPLOYEE ###');
      if (response.status == 200 && response.data != undefined && response.data != '' && resData['MESSAGE'] != '') {
        success = true;
        console.log('### Succeed in-' + retry + ' ###');
      } else {
        console.log('### Failed in-' + retry + ' ###');
        retry++;
      }
    }

    if (success && resData['CODE'] == 200) {
      if (resData['RECORDCNT'] > 0) {
        const ots = resData['RESULT'];

        let err_code = 0;
        let err_message = '';

        const pool: any = DatabaseConfig.getMasterDataDbPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const queryUpdateEmployee = `UPDATE employee SET fullname=$2, gender=$3, place_of_birth=$4, birthdate=$5, religion=$6, marital_status=$7, district_id_home=$8, home_address=$9, zip_code_home=$10, phone1=$11, email1=$12, employee_type_id=$13, date_of_entry=$14, employee_role_id=$15, branch_id=$16, department_id=$17, employee_id_coach=$18, npwp_number=$19, division_id=$20, nickname=$21, district_id_id_card=$22, id_card_address=$23, zip_code_id_card=$24, number_of_child=$25, cod_position=$26, passport_number=$27, driver_license_a=$28, driver_license_c=$29, bank_id_account=$30, bank_account_number=$31, bank_account_name=$32, is_outsource=$33, country_id_nationality=$34, date_of_resign=$35, status_employee=$36, updated_time=$37 WHERE employee_id=$1 AND is_deleted = false`;

            const queryUpdateUser = `UPDATE users SET first_name=$2, username=$3, email=$4, updated_time=$5, user_id_updated=$6 WHERE employee_id=$1 AND is_deleted = false`;

            const queryDeleteEmployeeFamily = `UPDATE employee_family SET updated_time=$2, user_id_updated=$3, is_deleted=$4 WHERE employee_id=$1 AND is_deleted = false`;

            const queryInsertEmployeeFamily = `INSERT INTO employee_family (employee_id,full_name,status,gender,last_education,user_id_created,created_time,user_id_updated,updated_time,is_deleted) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

            const queryDeleteEmployeeExperience = `UPDATE employee_experience SET updated_time=$2, user_id_updated=$3, is_deleted=$4 WHERE employee_id=$1 AND is_deleted = false`;

            const queryInsertEmployeeExperience = `INSERT INTO employee_experience (employee_id,company,company_description,position,experience_start,experience_end,last_salary,user_id_created,created_time,user_id_updated,updated_time,is_deleted) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;

            const queryDeleteEmployeeEducation = `UPDATE employee_education SET updated_time=$2, user_id_updated=$3, is_deleted=$4 WHERE employee_id=$1 AND is_deleted = false`;

            const queryInsertEmployeeEducation = `INSERT INTO employee_education (employee_id, education, education_name, majors, education_start, education_end,user_id_created, created_time, user_id_updated, updated_time, is_deleted) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`;

            for (const item of ots) {
              // console.log(item);
              let religion = '';
              const item_religion = item.agama.toLowerCase();
              if (item_religion == 'katolik') {
                religion = 'catholic';
              } else if (item_religion == 'buddha') {
                religion = 'buddha';
              } else if (item_religion == 'kristen') {
                religion = 'christian';
              } else if (item_religion == 'islam') {
                religion = 'islam';
              } else if (item_religion == 'hindu') {
                religion = 'hindu';
              } else if (item_religion == 'konghucu') {
                religion = 'konghucu';
              }

              let district_id_home = 0;
              if (item.kecamatan_tinggal !== '') {
                district_id_home = await this.getDistrictId(item.kecamatan_tinggal);
              }

              let marital_status = '';
              if (item.status == '0') {
                marital_status = 'single';
              } else if (item.status == '1') {
                marital_status = 'married';
              } else if (item.status == '2') {
                marital_status = 'widow';
              } else if (item.status == '3') {
                marital_status = 'widower';
              }

              let district_id_id_card = 0;
              if (item.kecamatan_sesuai !== '') {
                district_id_id_card = await this.getDistrictId(item.kecamatan_sesuai);
              }

              const employee_type = item.tipe.toLowerCase();
              let employee_type_id = 0;
              let is_outsource = false;
              if (employee_type == 'probation') {
                employee_type_id = 1;
              } else if (employee_type == 'kontrak 1') {
                employee_type_id = 2;
              } else if (employee_type == 'kontrak 2') {
                employee_type_id = 3;
              } else if (employee_type == 'karyawan tetap') {
                employee_type_id = 4;
              } else if (employee_type == 'pjs promosi jabatan sementara') {
                employee_type_id = 5;
              } else if (employee_type == 'outsource') {
                is_outsource = true;
              }
              // else if (employee_type == 'internship') {
              //   employee_type_id = 6;
              // } else if (employee_type == 'probation2') {
              //   employee_type_id = 7;
              // }

              let employee_role_id = 0;
              if (item.pangkat !== '') {
                employee_role_id = await this.getEmployeeRoleId(item.pangkat);
              }

              let branch_id = 0;
              if (item.kantor !== '') {
                branch_id = await this.getBranchId(item.kantor);
              }

              let department_id = 0;
              if (item.department !== '') {
                department_id = await this.getDepartmentId(item.department);
              }

              let division_id = 0;
              if (item.divisi !== '') {
                division_id = await this.getDivisionId(item.divisi);
              }

              let bank_id = 0;
              if (item.cabang_bank !== '') {
                bank_id = await this.getBankId(item.cabang_bank);
              }

              let number_of_child = 0;
              if (item.jumlah_anak !== '') {
                number_of_child = parseInt(item.jumlah_anak);
              }

              let coach = 0;
              if (item.coach !== '') {
                coach = parseInt(item.coach);
              }

              let gender = 'male';
              if (item.gender == 0) {
                gender = 'female';
              } else if (item.gender == 1) {
                gender = 'male';
              }

              let country_id_nationality = 0;
              if (item.kewarganegaraan !== '') {
                country_id_nationality = await this.getCountryId(item.kewarganegaraan);
              }

              let status_employee = 10;
              let resign_date;
              if (item.resign_date !== '') {
                resign_date = new Date(item.resign_date);
                status_employee = 20;
              } else {
                resign_date = null;
                status_employee = 10;
              }

              const r_employee_id = await client.query(`
                SELECT employee_id FROM employee
                WHERE nik = $1 AND is_deleted=false
              `, [item.nik]);
              // console.log(item.nik);

              if (r_employee_id && r_employee_id.rows && r_employee_id.rows.length && r_employee_id.rows.length > 0) {
                const employee_id = r_employee_id.rows[0].employee_id;

                if (err_code == 0) {
                // Update Employee
                await client.query(queryUpdateEmployee, [employee_id, item.nama_lengkap, gender, item.tempat_lahir, moment(item.tanggal_lahir).format('YYYY-MM-DD'), religion, marital_status, district_id_home, item.alamat_tinggal, item.kode_pos_tinggal, item.telepon, item.email, employee_type_id, moment(item.tanggal_masuk).format('YYYY-MM-DD'), employee_role_id, branch_id, department_id, coach, item.no_npwp, division_id, item.nama_panggilan, district_id_id_card, item.alamat_sesuai, item.kode_pos_sesuai, number_of_child, item.cod_posisi, item.no_passport, item.sim_a, item.sim_c, bank_id, item.no_rekening, item.atas_nama, is_outsource, country_id_nationality, resign_date, status_employee, moment().format('YYYY-MM-DD HH:mm:ss')], async function(err) {
                  PinoLoggerService.debug(this.logTitle, this.sql);
                  if (err) {
                    err_code++;
                    err_message = err.message;
                    PinoLoggerService.error(this.logTitle, err.message);
                  }
                });
              }

                if (err_code == 0) {
                // Update User
                await client.query(queryUpdateUser, [employee_id, item.nama_lengkap, item.username, item.email, moment().format('YYYY-MM-DD HH:mm:ss'), 1], async function(err) {
                  PinoLoggerService.debug(this.logTitle, this.sql);
                  if (err) {
                    err_code++;
                    err_message = err.message;
                    PinoLoggerService.error(this.logTitle, err.message);
                  }
                });
              }

                if (err_code == 0) {
                // Update Employee Family
                await client.query(queryDeleteEmployeeFamily, [employee_id, moment().format('YYYY-MM-DD HH:mm:ss'), 1, true], async function(err) {
                  PinoLoggerService.debug(this.logTitle, this.sql);
                  if (err) {
                    err_code++;
                    err_message = err.message;
                    PinoLoggerService.error(this.logTitle, err.message);
                  } else {
                    if (item.keluarga.length > 0) {
                      for (const family of item.keluarga) {
                        let family_gender = '';
                        if (item.gender == 0) {
                          family_gender = 'female';
                        } else if (item.gender == 1) {
                          family_gender = 'male';
                        }

                        // Insert new employee family
                        await client.query(queryInsertEmployeeFamily, [employee_id, family.nama_keluarga, family.status_keluarga.toLowerCase(), family_gender, family.pendidikan_terakhir_keluarga, 1, moment().format('YYYY-MM-DD HH:mm:ss'), 1, moment().format('YYYY-MM-DD HH:mm:ss'), false], async function(err) {
                          PinoLoggerService.debug(this.logTitle, this.sql);
                          if (err) {
                            err_code++;
                            err_message = err.message;
                            PinoLoggerService.error(this.logTitle, err.message);
                          }
                        });
                      }
                    }
                  }
                });
              }

                if (err_code == 0) {
                // Update Employee Experience
                await client.query(queryDeleteEmployeeExperience, [employee_id, moment().format('YYYY-MM-DD HH:mm:ss'), 1, true], async function(err) {
                      PinoLoggerService.debug(this.logTitle, this.sql);
                      if (err) {
                        err_code++;
                        err_message = err.message;
                        PinoLoggerService.error(this.logTitle, err.message);
                      } else {
                        if (item.pengalaman.length > 0) {
                          for (const experience of item.pengalaman) {
                                // Insert new employee experience
                            await client.query(queryInsertEmployeeExperience, [employee_id, experience.perusahaan_pengalaman, experience.bidang_perusahaan, experience.jabatan_perusahaan, experience.masa_kerja_perusahaan_from, experience.masa_kerja_perusahaan_to, experience.gaji_perusahaan, 1, moment().format('YYYY-MM-DD HH:mm:ss'), 1, moment().format('YYYY-MM-DD HH:mm:ss'), false], async function(err) {
                              PinoLoggerService.debug(this.logTitle, this.sql);
                              if (err) {
                                err_code++;
                                err_message = err.message;
                                PinoLoggerService.error(this.logTitle, err.message);
                              }
                            });
                          }
                        }
                      }
                    });
                  }

                if (err_code == 0) {
                  // Update Employee Experience
                  await client.query(queryDeleteEmployeeEducation, [employee_id, moment().format('YYYY-MM-DD HH:mm:ss'), 1, true], async function(err) {
                    PinoLoggerService.debug(this.logTitle, this.sql);
                    if (err) {
                        err_code++;
                        err_message = err.message;
                        PinoLoggerService.error(this.logTitle, err.message);
                      } else {
                        if (item.pendidikan.length > 0) {
                          for (const education of item.pendidikan) {
                              // Insert new employee education
                            await client.query(queryInsertEmployeeEducation, [employee_id, education.pendidikan_pendidikan, education.nama_instansi_pendidikan, education.jurusan_pendidikan, education.masa_dari_pendidikan, education.masa_sampai_pendidikan, 1, moment().format('YYYY-MM-DD HH:mm:ss'), 1, moment().format('YYYY-MM-DD HH:mm:ss'), false], async function(err) {
                              PinoLoggerService.debug(this.logTitle, this.sql);
                              if (err) {
                                err_code++;
                                err_message = err.message;
                                PinoLoggerService.error(this.logTitle, err.message);
                              }
                            });
                          }
                        }
                      }
                    });
                  }
                result_data.push({NIK: item.nik, status: 'Successfully updated'});
              } else {
                result_data.push({NIK: item.nik, status: 'Not found in masterdata'});
              }
            }
            if (err_code == 0) {
              const queryUpdateCron = `UPDATE cron_config SET updated_time=$1 WHERE cron_config_name = 'CRON_EMPLOYEE_SUNFISH'`;
              await client.query(queryUpdateCron, [moment().format('YYYY-MM-DD HH:mm:ss')], async function(err) {
                PinoLoggerService.debug(this.logTitle, this.sql);
                if (err) {
                  PinoLoggerService.error(this.logTitle, err.message);
                } else {
                  result.data = result_data;
                  result.code = HttpStatus.OK;
                  result.message = 'Success';
                }
              });
              await client.query('COMMIT');
            } else {
              result.code = HttpStatus.CONFLICT;
              result.message = 'Error';
              result.data = [];
              console.log('\nclient.query():', err_message);
              await client.query('ROLLBACK');
              console.log('Transaction ROLLBACK called [0]');
            }
          } catch (e) {
            result.code = HttpStatus.CONFLICT;
            result.message = 'Error';
            result.data = [];
            console.log('\nclient.query():', err_message);
            await client.query('ROLLBACK');
            console.log('Transaction ROLLBACK called [1]');
          } finally {
            client.release();
          }
      }
    } else if (success && resData['CODE'] != 200 && resData['RECORDCNT'] == 0) {
      result.code = HttpStatus.CONFLICT;
      result.message = resData['MESSAGE'];
      result.data = [];
      console.log(resData['MESSAGE']);
    } else {
      result.code = HttpStatus.CONFLICT;
      result.message = 'Can\'t get any response from Sunfish';
      result.data = [];
      console.log('Can\'t get any response from Sunfish');
    }
    return result;
  }

  public static async getCronSunfishUpdateDate() {
    let updatedTime;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT cron_config_id,updated_time
          FROM cron_config
          WHERE cron_config_name = 'CRON_EMPLOYEE_SUNFISH'
          LIMIT 1
        `);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
          // console.log(res.rows);
          for (const r of res.rows) {
            updatedTime = r.updated_time;
          }
        } else {
            const queryInsert = `
              INSERT INTO cron_config (
                cron_config_name
              ) VALUES ($1)
            `;

          // Insert new role
            await client.query(queryInsert, ['CRON_EMPLOYEE_SUNFISH'], async function(err) {
            PinoLoggerService.debug(this.logTitle, this.sql);
            if (err) {
              PinoLoggerService.error(this.logTitle, err.message);
            }
          });
        }
        return updatedTime;
      } finally {
        client.release();
      }
    } catch (error) {
      return updatedTime;
    }
  }

  public static async getDistrictId(district: string): Promise<any> {
    let district_id = 0;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT district_id
          FROM district
          WHERE district_name = $1 AND is_deleted = FALSE
        `, [district]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              district_id = r.district_id;
            }
          }
        return district_id;
      } finally {
        client.release();
      }
    } catch (error) {
      return district_id;
    }
  }

  public static async getEmployeeRoleId(employee_role: string): Promise<any> {
    let employee_role_id = 0;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT employee_role_id
          FROM employee_role
          WHERE employee_role_name = $1 AND is_deleted = FALSE
        `, [employee_role]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              employee_role_id = r.employee_role_id;
            }
          }
        return employee_role_id;
      } finally {
        client.release();
      }
    } catch (error) {
      return employee_role_id;
    }
  }

  public static async getBranchId(branch: string): Promise<any> {
    let branch_id = 0;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT branch_id
          FROM branch
          WHERE branch_name = $1 AND is_deleted = FALSE
        `, [branch]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              branch_id = r.branch_id;
            }
          }
        return branch_id;
      } finally {
        client.release();
      }
    } catch (error) {
      return branch_id;
    }
  }

  public static async getDepartmentId(department: string): Promise<any> {
    let department_id = 0;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT department_id
          FROM department
          WHERE department_name = $1 AND is_deleted = FALSE
        `, [department]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              department_id = r.department_id;
            }
          }
        return department_id;
      } finally {
        client.release();
      }
    } catch (error) {
      return department_id;
    }
  }

  public static async getDivisionId(division: string): Promise<any> {
    let division_id = 0;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT division_id
          FROM division
          WHERE division_name = $1 AND is_deleted = FALSE
        `, [division]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              division_id = r.division_id;
            }
          }
        return division_id;
      } finally {
        client.release();
      }
    } catch (error) {
      return division_id;
    }
  }

  public static async getBankId(bank: string): Promise<any> {
    let bank_id = 0;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT bank_id
          FROM bank
          WHERE bank_code = $1 AND is_deleted = FALSE
        `, [bank]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              bank_id = r.bank_id;
            }
          }
        return bank_id;
      } finally {
        client.release();
      }
    } catch (error) {
      return bank_id;
    }
  }

  public static async getCountryId(country: string): Promise<any> {
    let country_id = 0;
    try {
      const pool: any = DatabaseConfig.getMasterDataDbPool();
      const client = await pool.connect();
      try {
        const res = await client.query(`
          SELECT country_id
          FROM country
          WHERE country_name = $1 AND is_deleted=false
        `, [country]);

        if (res && res.rows && res.rows.length && res.rows.length > 0) {
            for (const r of res.rows) {
              country_id = r.country_id;
            }
          }
        return country_id;
      } finally {
        client.release();
      }
    } catch (error) {
      return country_id;
    }
  }
}
