import { HttpStatus} from '@nestjs/common';
import { AuthService } from '../../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import { EmployeePenalty } from '../../../../../shared/orm-entity/employee-penalty';
import { PenaltyCategoryListResponseVm } from '../../../models/penalty-category.vm';
import { EmployeePenaltyListResponseVM, EmployeePenaltyPayloadVm } from '../../../models/employee-penalty.vm';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import moment = require('moment');
export class EmployeePenaltyService {

  constructor(){}

  static ExportHeader = [
    'Tanggal',
    'Kategori',
    'Perwakilan',
    'Cabang',
    'Dibebankan',
    'No Resi',
    'No SPK/ SJ',
    'Qty',
    'Denda',
    'Total Denda',
    'Keterangan',
  ];

  static strReplaceFunc = str => {
    return str
      ? str
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/;/g, '|')
          .replace(/,/g, '.')
      : null;
  }

  static streamTransformEmployeePenalty(d) {
    const values = [
      d.penaltyDateTime ? moment(d.manifestedDate).format('YYYY-MM-DD') : null,
      d.penaltyCategoryTitle,
      d.representativeCode,
      `${d.branchCode} - ${d.branchName}`,
      `${d.userName} - ${d.firstName}`,
      d.refAwbNumber ? d.refAwbNumber : '-',
      d.refSpkCode ? d.refSpkCode : '-',
      d.qty,
      d.penaltyFee,
      d.totalPenalty,
      d.penaltyDesc ? d.penaltyDesc : '-',
    ];

    return `${values.join(',')} \n`;
  }

  private static async setEmployeePenalty(
    payload : EmployeePenaltyPayloadVm,
    userId : number,
    employeePenaltyData : EmployeePenalty,
    ){
    const employeePenalty = new EmployeePenalty();
    employeePenalty.penaltyUserId = payload.penaltyUserId;
    employeePenalty.penaltyDateTime = payload.createTime;
    employeePenalty.penaltyCategoryId = payload.penaltyCategoryid;
    employeePenalty.penaltyQty = payload.qty;
    employeePenalty.penaltyFee = payload.penaltyFee;
    employeePenalty.totalPenalty = payload.totalPenalty;
    employeePenalty.branchId = payload.branchId;
    employeePenalty.representativeId = payload.representativeId;
    employeePenalty.refAwbNumber = (payload.refAwbNumber) ? payload.refAwbNumber : null;
    employeePenalty.refSpkCode = (payload.refSpkCode) ? payload.refSpkCode : null; 
    employeePenalty.penaltyDesc = (payload.penaltyDesc) ? payload.penaltyDesc : null;
    if(employeePenaltyData){
      employeePenalty.userIdCreated = employeePenaltyData.userIdCreated;
      employeePenalty.createdTime = employeePenaltyData.createdTime;
    }else{
      employeePenalty.userIdCreated = userId;
      employeePenalty.createdTime = moment().toDate();
    }
    employeePenalty.userIdUpdated = userId;
    employeePenalty.updatedTime = moment().toDate();
    employeePenalty.isDeleted = false;

    return employeePenalty;
  }

  static async findPenaltyCategories(
    payload: BaseMetaPayloadVm,
  ): Promise<PenaltyCategoryListResponseVm> {
    payload.globalSearchFields = [
      {
        field: 'penaltyCategoryTitle',
      },
      {
        field: 'penaltyCategoryProcess',
      },
    ];

    const q = RepositoryService.penaltyCategory.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['penalty_category_title', 'penaltyCategoryTitle'],
      ['penalty_category_process', 'penaltyCategoryProcess'],
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new PenaltyCategoryListResponseVm();
    result.data = data;

    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  static async findEmpolyeePenalties(
    payload: BaseMetaPayloadVm,
  ): Promise<EmployeePenaltyListResponseVM> {

    payload.globalSearchFields = [
      {
        field: 'penaltyCategoryTitle',
      },
      {
        field: 'penaltyDateTime',
      },
    ];

    payload.fieldResolverMap['penaltyDateTime'] = 'employee_penalty.penalty_date_time';
    // payload.fieldResolverMap['branchId'] = 'branch.branch_id';
    // payload.fieldResolverMap['dateTime'] = 'mobile_device_info.date_time';

    if (payload.sortBy === '') {
      payload.sortBy = 'penaltyDateTime';
    }

    const q = RepositoryService.employeePenalty.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['employee_penalty.employee_penalty_id', 'employeePenaltyId'],
      ['employee_penalty.penalty_date_time', 'penaltyDateTime'],
      ['penalty_category.penalty_category_title', 'penaltyCategoryTitle'],
      ['representative.representative_code', 'representativeCode'],
      ['branch.branch_name', 'branchName'],
      ['users.first_name', 'firstName'],
      ['users.username', 'userName'],
      ['employee_penalty.ref_awb_number', 'refAwbNumber'],
      ['employee_penalty.ref_spk_code', 'refSpkCode'],
      ['employee_penalty.total_penalty', 'totalPenalty'],
    );

    q.innerJoin(e => e.penaltyUser, 'users', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branch, 'branch', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.branch.representative, 'representative', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.innerJoin(e => e.penaltyCategory, 'penalty_category', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new EmployeePenaltyListResponseVM();
    result.data = data;

    result.buildPaging(payload.page, payload.limit, total);

    return result;

  }

  static async createEmployeePenalty(
  payload: EmployeePenaltyPayloadVm,
  ): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = {
          status : 'ok',
          message: 'Sukses membuat data',
        };
    const setEmployeePenalty = await this.setEmployeePenalty(
      payload,
      authMeta.userId,
      null
    )
    const data = await EmployeePenalty.save(setEmployeePenalty);
    if(!data){
      RequestErrorService.throwObj(
        {
          message: `Gagal membuat data`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  static async editEmployeePenalty(
  payload: EmployeePenaltyPayloadVm,
  ): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = {
          status : 'ok',
          message: 'Sukses merubah data',
        };

    const employeePenaltyData = await EmployeePenalty.findOne({
      where:{
        employeePenaltyId : payload.employeePenaltyId
      },
    });

    if(!employeePenaltyData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menemukan data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const setEmployeePenalty = await this.setEmployeePenalty(
      payload,
      authMeta.userId,
      employeePenaltyData,
    );
    const data = await EmployeePenalty.update(
      {
        employeePenaltyId: employeePenaltyData.employeePenaltyId,
      },
      {
        ...setEmployeePenalty,
      }
    );

    if(!data){
        RequestErrorService.throwObj(
        {
          message: `tidak dapat merubah data`,
        },
        HttpStatus.BAD_REQUEST,
      );
      }
    return result;
  }

  static async deleteEmployeePenalty(
  employeePenaltyId: string,
  ): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = {
          status : 'ok',
          message: 'Sukses menghapus data',
        };
    const employeePenaltyData = await EmployeePenalty.findOne({
      where:{
        employeePenaltyId : employeePenaltyId,
      },
    });

    if(!employeePenaltyData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menemukan data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const deleteData = await EmployeePenalty.update(
      {
        employeePenaltyId: employeePenaltyData.employeePenaltyId,
      },
      {
        isDeleted:true,
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      }
    );

    if(!deleteData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menghapus data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return result;
  }

  static async exportEmployeePenalty (payload: BaseMetaPayloadVm, response){
    try {
      const fileName = `COD_fee_${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.ExportHeader.join(',')}\n`);

      payload.fieldResolverMap['penaltyDateTime'] = 'employee_penalty.penalty_date_time';

      const q = RepositoryService.employeePenalty.findAllRaw();
      payload.applyToOrionRepositoryQuery(q, true);

      q.selectRaw(
        ['employee_penalty.employee_penalty_id', 'employeePenaltyId'],
        ['employee_penalty.penalty_date_time', 'penaltyDateTime'],
        ['penalty_category.penalty_category_title', 'penaltyCategoryTitle'],
        ['representative.representative_code', 'representativeCode'],
        ['branch.branch_name', 'branchName'],
        ['branch.branch_code', 'branchCode'],
        ['users.first_name', 'firstName'],
        ['users.username', 'userName'],
        ['employee_penalty.ref_awb_number', 'refAwbNumber'],
        ['employee_penalty.ref_spk_code', 'refSpkCode'],
        ['employee_penalty.total_penalty', 'totalPenalty'],
      );

      q.innerJoin(e => e.penaltyUser, 'users', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.branch, 'branch', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.branch.representative, 'representative', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.penaltyCategory, 'penalty_category', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.andWhere(e => e.isDeleted, w => w.isFalse());

      await q.stream(response, this.streamTransformEmployeePenalty);

    } catch (err) {
      throw err;
    }
  }

  
}