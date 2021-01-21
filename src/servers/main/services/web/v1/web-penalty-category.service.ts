import { HttpStatus} from '@nestjs/common';
import { AuthService } from '../../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import { EmployeePenalty } from '../../../../../shared/orm-entity/employee-penalty';
import { PenaltyCategoryPayloadVm, PenaltyCategoryListResponseVm, PenaltyCategoryFeeListResponseVm } from '../../../models/penalty-category.vm';
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

    q.selectRaw(`
      DISTINCT(penalty_category_title) AS "penaltyCategoryTitle"
    `);

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

    const setPenaltyCategory = await this.setPenaltyCategory(
      payload,
      authMeta.userId,
      null
    );

    const penaltyCategoryData = await PenaltyCategory.save(setPenaltyCategory);
    if(!penaltyCategoryData){
      RequestErrorService.throwObj(
        {
          message: `Gagal membuat data kategori pinalty`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const setPenaltyCategoryFee = await this.setPenaltyCategoryFee(
      payload,
      authMeta.userId,
      null,
      penaltyCategoryData
    );

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
          message: 'Sukses membuat data',
        };

    const penaltyCategoryFee = await PenaltyCategoryService.findOneCategory(payload.penaltyCategoryFeeId);
    if(!penaltyCategoryFee){
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
      penaltyCategoryFee
    );

    const updatePenaltyCategoryData = await PenaltyCategory.update(
      {
        penaltyCategoryId: penaltyCategoryFee.penaltyCategoryId,
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

    const setPenaltyCategoryFee = await this.setPenaltyCategoryFee(
      payload,
      authMeta.userId,
      penaltyCategoryFee,
      setPenaltyCategory,
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
    penaltyCategoryFeeId: string,
    ): Promise<any>{
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = {
          status : 'ok',
          message: 'Sukses menghapus data',
        };
    const penaltyCategoryFeeData = await PenaltyCategoryService.findOneCategory(penaltyCategoryFeeId)
    if(!penaltyCategoryFeeData){
      RequestErrorService.throwObj(
        {
          message: `tidak dapat menemukan data`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const deleteCategoryData = await PenaltyCategory.update(
      {
        penaltyCategoryId: penaltyCategoryFeeData.penaltyCategoryId,
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

    const deleteCategoryFeeData = await PenaltyCategoryFee.update(
      {
        penaltyCategoryFeeId: penaltyCategoryFeeData.penaltyCategoryFeeId,
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
    penaltyCategoryFeeData : PenaltyCategoryFee
    ){
      const penaltyCategory = new PenaltyCategory();
      penaltyCategory.penaltyCategoryTitle = payload.penaltyCategoryTitle;
      if(penaltyCategoryFeeData){
        penaltyCategory.userIdCreated = penaltyCategoryFeeData.penaltyCategory.userIdCreated;
        penaltyCategory.createdTime = penaltyCategoryFeeData.penaltyCategory.createdTime;
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
    payload: PenaltyCategoryPayloadVm,
    userId: number,
    penaltyCategoryFeeData: PenaltyCategoryFee,
    penaltyCategoryData: PenaltyCategory
    ){
      const penaltyCategoryFee = new PenaltyCategoryFee();
      penaltyCategoryFee.penaltyFee = payload.penaltyFee;
      if(penaltyCategoryFeeData){
        penaltyCategoryFee.userIdCreated = penaltyCategoryFeeData.userIdCreated;
        penaltyCategoryFee.createdTime = penaltyCategoryFeeData.createdTime;
        penaltyCategoryFee.userIdUpdated = userId;
        penaltyCategoryFee.penaltyCategoryId = penaltyCategoryFeeData.penaltyCategoryId;
      }else{
        penaltyCategoryFee.userIdCreated = penaltyCategoryData.userIdCreated;
        penaltyCategoryFee.createdTime = penaltyCategoryData.createdTime;
        penaltyCategoryFee.penaltyCategoryId = penaltyCategoryData.penaltyCategoryId;
      }
      penaltyCategoryFee.updatedTime = penaltyCategoryData.updatedTime;
      penaltyCategoryFee.isDeleted = false;

      return penaltyCategoryFee;
  }

  private static async findOneCategory(
    penaltyCategoryFeeId : string
    ): Promise<PenaltyCategoryFee>{
    const q = RepositoryService.penaltyCategoryFee.findOne();
    q.innerJoin(e => e.penaltyCategory);

    const penaltyCategoryFee = await q
    .select({
      penaltyCategoryFeeId: true,
      penaltyCategoryId: true,
      penaltyFee: true,
      userIdCreated: true,
      userIdUpdated: true,
      createdTime: true,
      updatedTime: true,
      penaltyCategory: true,
    })
    .where(e => e.penaltyCategoryFeeId, w => w.equals(penaltyCategoryFeeId))
    .andWhere(e => e.isDeleted, w => w.isFalse());

    return penaltyCategoryFee;
  }

}