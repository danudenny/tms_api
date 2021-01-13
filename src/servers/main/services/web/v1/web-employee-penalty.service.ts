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
    'User Created',
    'User Updated',
    'Sanksi'
  ];

  private static strReplaceFunc = str => {
    return str
      ? str
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/;/g, '|')
          .replace(/,/g, '.')
      : null;
  }

  private static currencyConverter =  price => {
    const totalPenalty = price.slice(0, -3);
    const format = totalPenalty.toString().split('').reverse().join('');
    const convert = format.match(/\d{1,3}/g);
    return 'Rp. '+ convert.join('.').split('').reverse().join('')
  }

  private static streamTransformEmployeePenalty(d) {
    const values = [
      d.penaltyDateTime ? moment(d.penaltyDateTime).format('YYYY-MM-DD') : null,
      EmployeePenaltyService.strReplaceFunc(d.penaltyCategoryTitle),
      d.representativeCode,
      `${d.branchCode} - ${d.branchName}`,
      `${d.userName} - ${d.firstName}`,
      d.refAwbNumber ? `'${d.refAwbNumber}` : '-',
      d.refSpkCode ? EmployeePenaltyService.strReplaceFunc(d.refSpkCode) : '-',
      d.qty,
      EmployeePenaltyService.currencyConverter(d.penaltyFee),
      EmployeePenaltyService.currencyConverter(d.totalPenalty),
      d.penaltyDesc ? EmployeePenaltyService.strReplaceFunc(d.penaltyDesc) : '-',
      `${d.createdUserName} - ${d.createdFirstName}`,
      d.updatedUserName ? `${d.updatedUserName} - ${d.updatedFirstName}` : '-',
      d.penaltyType ? EmployeePenaltyService.strReplaceFunc(d.penaltyType) : '-',
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
    employeePenalty.totalPenalty = payload.penaltyFee * payload.qty;
    employeePenalty.branchId = payload.branchId;
    employeePenalty.representativeId = payload.representativeId;
    employeePenalty.refAwbNumber = (payload.refAwbNumber) ? payload.refAwbNumber : null;
    employeePenalty.refSpkCode = (payload.refSpkCode) ? payload.refSpkCode : null; 
    employeePenalty.penaltyDesc = (payload.penaltyDesc) ? payload.penaltyDesc : null;
    employeePenalty.penaltyType = (payload.penaltyType) ? payload.penaltyType : null;
    if(employeePenaltyData){
      employeePenalty.userIdCreated = employeePenaltyData.userIdCreated;
      employeePenalty.userIdUpdated = userId;
      employeePenalty.createdTime = employeePenaltyData.createdTime;
    }else{
      employeePenalty.userIdCreated = userId;
      employeePenalty.createdTime = moment().toDate();
    }
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
      ['penalty_category_id', 'penaltyCategoryId'],
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
    ];

    payload.fieldResolverMap['penaltyDateTime'] = 'employee_penalty.penalty_date_time';
    payload.fieldResolverMap['branchId'] = 'branch.branch_id';

    if (payload.sortBy === '') {
      payload.sortBy = 'penaltyDateTime';
    }

    const q = RepositoryService.employeePenalty.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['employee_penalty.employee_penalty_id', 'employeePenaltyId'],
      ['employee_penalty.penalty_date_time', 'penaltyDateTime'],
      ['penalty_category.penalty_category_title', 'penaltyCategoryTitle'],
      ['penalty_category.penalty_category_Id', 'penaltyCategoryId'],
      ['representative.representative_code', 'representativeCode'],
      ['representative.representative_id', 'representativeId'],
      ['representative.representative_name', 'representativeName'],
      ['branch.branch_name', 'branchName'],
      ['branch.branch_id', 'branchId'],
      ['branch.branch_code', 'branchCode'],
      ['users.first_name', 'firstName'],
      ['users.username', 'userName'],
      ['users.user_id', 'userId'],
      ['employee_penalty.ref_awb_number', 'refAwbNumber'],
      ['employee_penalty.ref_spk_code', 'refSpkCode'],
      ['employee_penalty.penalty_qty', 'qty'],
      ['employee_penalty.penalty_fee', 'penaltyFee'],
      ['employee_penalty.total_penalty', 'totalPenalty'],
      ['employee_penalty.penalty_desc', 'desc'],
      ['employee_penalty.penalty_type', 'penaltyType'],
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
      const fileName = `POD_employee_penalty${new Date().getTime()}.csv`;

      response.setHeader(
        'Content-disposition',
        `attachment; filename=${fileName}`,
      );
      response.writeHead(200, { 'Content-Type': 'text/csv' });
      response.flushHeaders();
      response.write(`${this.ExportHeader.join(',')}\n`);

      payload.fieldResolverMap['userId'] = 'employee_penalty.penalty_user_id';
      payload.fieldResolverMap['penaltyDateTime'] = 'employee_penalty.penalty_date_time';
      payload.fieldResolverMap['branchId'] = 'branch.branch_id';
      payload.fieldResolverMap['representativeCode'] = 'representative.representative_code';

      const q = RepositoryService.employeePenalty.findAllRaw();
      payload.applyToOrionRepositoryQuery(q);

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
        ['employee_penalty.penalty_qty', 'qty'],
        ['employee_penalty.penalty_fee', 'penaltyFee'],
        ['employee_penalty.total_penalty', 'totalPenalty'],
        ['employee_penalty.penalty_desc', 'penaltyDesc'],
        ['usercreated.first_name', 'createdFirstName'],
        ['usercreated.username', 'createdUserName'],
        ['usersupdated.first_name', 'updatedFirstName'],
        ['usersupdated.username', 'updatedUserName'],
        ['employee_penalty.penalty_type', 'penaltyType'],
      );

      q.innerJoin(e => e.penaltyUser, 'users', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.createdUser, 'usercreated', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.leftJoin(e => e.updatedUser, 'usersupdated', j =>
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