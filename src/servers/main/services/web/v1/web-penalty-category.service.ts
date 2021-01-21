import { HttpStatus} from '@nestjs/common';
import { AuthService } from '../../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import { EmployeePenalty } from '../../../../../shared/orm-entity/employee-penalty';
import { 
  PenaltyCategoryPayloadVm,
  PenaltyCategoryFeePayloadVm, 
  PenaltyCategoryListResponseVm, 
  PenaltyCategoryFeeListResponseVm } from '../../../models/penalty-category.vm';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import moment = require('moment');
import { PenaltyCategory } from '../../../../../shared/orm-entity/penalty_category';
import { PenaltyCategoryFee } from '../../../../../shared/orm-entity/penalty-category-fee';

export class PenaltyCategoryService{
  constructor(){}

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

  static async findPenaltyCategorieFeeList(
    payload: BaseMetaPayloadVm,
  ): Promise<PenaltyCategoryFeeListResponseVm> {
    payload.globalSearchFields = [
      {
        field: 'penaltyCategoryTitle',
      },
      {
        field: 'penaltyCategoryProcess',
      },
    ];

    payload.fieldResolverMap['penaltyCategoryTitle'] = 'penalty_category.penalty_category_title';
    payload.fieldResolverMap['penaltyCategoryId'] = 'penalty_category.penalty_category_id';

    const q = RepositoryService.penaltyCategoryFee.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['penalty_category.penalty_category_id', 'penaltyCategoryId'],
      ['penalty_category.penalty_category_title', 'penaltyCategoryTitle'],
      ['penalty_category.penalty_category_process', 'penaltyCategoryProcess'],
      ['penalty_category_fee.penalty_category_fee_id', 'penaltyCategoryFeeId'],
      ['penalty_category_fee.penalty_fee', 'penaltyFee'],
    );

    q.innerJoin(e => e.penaltyCategory, 'penalty_category', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new PenaltyCategoryFeeListResponseVm();
    result.data = data;

    result.buildPaging(payload.page, payload.limit, total);

    return result;
  }

  static async createPenaltyCategory(
    payload: PenaltyCategoryPayloadVm,
  ): Promise<any>{
    const authMeta = AuthService.getAuthData();
    const result = {
          status : 'ok',
          message: 'Sukses membuat data',
        };
    let penaltyCategoryData = await PenaltyCategory.findOne({
      where:{
        penaltyCategoryId: payload.penaltyCategoryId,
        isDeleted: false,
      }
    });
    if(penaltyCategoryData){
      RequestErrorService.throwObj(
        {
          message: `Data dengan kategori tersebut sudah ada sebelumnya`,
        },
      HttpStatus.BAD_REQUEST,
      );
    }

    const setPenaltyCategory = await this.setPenaltyCategory(
        payload,
        authMeta.userId,
        null
      );
    penaltyCategoryData = await PenaltyCategory.save(setPenaltyCategory);
    if(!penaltyCategoryData){
        RequestErrorService.throwObj(
          {
            message: `Gagal membuat data kategori pinalty`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

    return result;
  }

  static async createPenaltyCategoryFee(
    payload: PenaltyCategoryFeePayloadVm,
  ): Promise<any>{
    const authMeta = AuthService.getAuthData();
    const result = {
          status : 'ok',
          message: 'Sukses membuat data',
        };

    const setPenaltyCategoryFee = await this.setPenaltyCategoryFee(
      payload,
      authMeta.userId,
      null
    );

    const penaltyCategoryFeeDataExist = await PenaltyCategoryFee.find({
      where:{
        penaltyCategoryId: setPenaltyCategoryFee.penaltyCategoryId,
        penaltyFee: setPenaltyCategoryFee.penaltyFee,
        isDeleted: false
      }
    });
    if(penaltyCategoryFeeDataExist.length > 0){
      RequestErrorService.throwObj(
        {
          message: `Data dengan kategori tersebut sudah ada sebelumnya`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const penaltyCategoryFeeData = await PenaltyCategoryFee.save(setPenaltyCategoryFee);
    if(!penaltyCategoryFeeData){
      RequestErrorService.throwObj(
        {
          message: `Gagal membuat data fee kategori pinalty`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  static async editPenaltyCategory(
    payload: PenaltyCategoryPayloadVm,
  ): Promise<any>{
    const authMeta = AuthService.getAuthData();
    const result = {
          status : 'ok',
          message: 'Sukses merubah data',
        };

    const penaltyCategoryData = await PenaltyCategory.findOne({
      where:{
        penaltyCategoryId: payload.penaltyCategoryId,
        isDeleted: false,
      }
    });

    if(!penaltyCategoryData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menemukan data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const setPenaltyCategory = await this.setPenaltyCategory(
      payload,
      authMeta.userId,
      penaltyCategoryData
    );

    const updatePenaltyCategoryData = await PenaltyCategory.update(
      {
        penaltyCategoryId: payload.penaltyCategoryId,
      },
      {
        ...setPenaltyCategory,
      }
    );

    if(!updatePenaltyCategoryData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat merubah data kategory pinalty`,
        }
      );
    }

    return result;
  }

  static async editPenaltyCategoryFee(
    payload: PenaltyCategoryFeePayloadVm,
  ): Promise<any>{
    const authMeta = AuthService.getAuthData();
    const result = {
          status : 'ok',
          message: 'Sukses merubah data',
        };
    const penaltyCategoryFee = await PenaltyCategoryFee.findOne({
      where:{
        penaltyCategoryFeeId: payload.penaltyCategoryFeeId,
        isDeleted: false
      }
    });
    if(!penaltyCategoryFee){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menemukan data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const setPenaltyCategoryFee = await this.setPenaltyCategoryFee(
      payload,
      authMeta.userId,
      penaltyCategoryFee
    );

    const penaltyCategoryFeeData = await PenaltyCategoryFee.update(
      {
        penaltyCategoryFeeId: penaltyCategoryFee.penaltyCategoryFeeId,
      },
      {
        ...setPenaltyCategoryFee,
      }
    );
    if(!penaltyCategoryFeeData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat merubah data fee kategory pinalty`,
        }
      );
    }
    return result;
  }

  static async deletePenaltyCategory(
    penaltyCategoryId: string,
    ): Promise<any>{
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = {
          status : 'ok',
          message: 'Sukses menghapus data',
        };

    const penaltyCategoryData = await PenaltyCategory.findOne({
      where:{
        penaltyCategoryId: penaltyCategoryId,
        isDeleted: false,
      }
    });
    if(!penaltyCategoryData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menemukan data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const deleteCategoryData = await PenaltyCategory.update(
      {
        penaltyCategoryId: penaltyCategoryId,
      },
      {
        isDeleted:true,
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      }
    );
    if(!deleteCategoryData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menghapus data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  static async deletePenaltyCategoryFee(
    penaltyCategoryFeeId: string,
    ): Promise<any>{
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = {
          status : 'ok',
          message: 'Sukses menghapus data',
        };

    const penaltyCategoryFeeData = await PenaltyCategoryFee.findOne({
      where:{
        penaltyCategoryFeeId: penaltyCategoryFeeId,
        isDeleted: false,
      }
    });
    if(!penaltyCategoryFeeData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menemukan data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const deleteCategoryFeeData = await PenaltyCategoryFee.update(
      {
        penaltyCategoryFeeId: penaltyCategoryFeeId,
      },
      {
        isDeleted:true,
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      }
    );
    if(!deleteCategoryFeeData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menghapus data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  private static async setPenaltyCategory(
    payload: PenaltyCategoryPayloadVm,
    userId : number,
    penaltyCategoryData : PenaltyCategory
    ){
      const penaltyCategory = new PenaltyCategory();
      penaltyCategory.penaltyCategoryTitle = payload.penaltyCategoryTitle;
      if(penaltyCategoryData){
        penaltyCategory.userIdCreated = penaltyCategoryData.userIdCreated;
        penaltyCategory.createdTime = penaltyCategoryData.createdTime;
        penaltyCategory.userIdUpdated = userId;
      }else{
        penaltyCategory.userIdCreated = userId;
        penaltyCategory.createdTime = moment().toDate();
      }
      penaltyCategory.updatedTime = moment().toDate();
      penaltyCategory.penaltyCategoryProcess = '-';
      penaltyCategory.isDeleted = false;

      return penaltyCategory;
  }

  private static async setPenaltyCategoryFee(
    payload: PenaltyCategoryFeePayloadVm,
    userId: number,
    penaltyCategoryFeeData: PenaltyCategoryFee
    ){
      const penaltyCategoryFee = new PenaltyCategoryFee();
      penaltyCategoryFee.penaltyFee = payload.penaltyFee;
      if(penaltyCategoryFeeData){
        penaltyCategoryFee.userIdCreated = penaltyCategoryFeeData.userIdCreated;
        penaltyCategoryFee.createdTime = penaltyCategoryFeeData.createdTime;
        penaltyCategoryFee.userIdUpdated = userId;
      }else{
        penaltyCategoryFee.userIdCreated = userId;
        penaltyCategoryFee.createdTime = moment().toDate();
      }
      penaltyCategoryFee.penaltyCategoryId = payload.penaltyCategoryId;
      penaltyCategoryFee.updatedTime = moment().toDate();
      penaltyCategoryFee.isDeleted = false;

      return penaltyCategoryFee;
  }
}