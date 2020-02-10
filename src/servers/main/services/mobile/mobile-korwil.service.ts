import { createQueryBuilder } from 'typeorm';
import { isEmpty } from 'lodash';
import { AuthService } from '../../../../shared/services/auth.service';
import { BranchListKorwilResponseVm, MobileKorwilTransactionResponseVm, ItemListKorwilResponseVm, DetailPhotoKorwilResponseVm, MobileUpdateProcessKorwilResponseVm } from '../../models/mobile-korwil-response.vm';
import { MobilePostKorwilTransactionPayloadVm, MobileUpdateProcessKorwilPayloadVm, MobileValidateCoordinateKorwilTransactionPayloadVm } from '../../models/mobile-korwil-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { ValidateBranchCoordinateResponseVm } from '../../models/branch-response.vm';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { KorwilTransactionDetail } from '../../../../shared/orm-entity/korwil-transaction-detail';
import moment = require('moment');
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { KorwilTransactionDetailPhoto } from '../../../../shared/orm-entity/korwil-transaction-detail-photo';
import { AttachmentTms } from '../../../../shared/orm-entity/attachment-tms';
import { getType } from 'mime';

export class MobileKorwilService {
  constructor() {}
  static E_RADIUS = 6372.8;

  public static async getBranchList()
  : Promise <BranchListKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    // Branch list dari user role korwil
    const qb = createQueryBuilder();
    qb.addSelect('b.branch_id', 'branchId');
    qb.addSelect('b.branch_name', 'branchName');
    qb.from('user_to_branch', 'utb');
    qb.innerJoin('branch',
      'b',
      'b.branch_id = utb.ref_branch_id AND b.is_deleted = false'
    );
    qb.where('utb.is_deleted = false');
    qb.andWhere('utb.ref_user_id = :userId', { userId: authMeta.userId });

    const result = new BranchListKorwilResponseVm();
    result.branchList = await qb.getRawMany();

    return result;
  }

  public static async updateDoneKorwil(
    payload: MobileUpdateProcessKorwilPayloadVm
  )
  : Promise <MobileUpdateProcessKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const result = new MobileUpdateProcessKorwilResponseVm();
    const timeNow = moment().toDate();
    result.message = "success";
    result.status = "ok";

    // update status sedang dikerjakan(2) jadi status selesai(3)
    await KorwilTransactionDetail.update({
      korwilTransactionId: payload.korwilTransactionId,
      status: 2,
      isDeleted: false,
    },
    {
      status: 3,
      date: timeNow,
    });

    let korwilTransaction = await KorwilTransaction.findOne({
      where: {
        korwilTransactionId: payload.korwilTransactionId,
      }
    });
    if(!korwilTransaction){
      result.message = "error";
      result.status = "Korwil tidak ditemukan";
      return result;
    }
    korwilTransaction.totalTask = await this.getTotalTask(payload.korwilTransactionId);
    korwilTransaction.userIdUpdated = authMeta.userId;
    korwilTransaction.updatedTime = timeNow;
    korwilTransaction.date = timeNow;
    await KorwilTransaction.save(korwilTransaction);

    result.statusKorwilTransaction = korwilTransaction.status;
    return result;
  }

  public static async updateSubmitKorwil(
    payload: MobileUpdateProcessKorwilPayloadVm
  )
  : Promise <MobileUpdateProcessKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const result = new MobileUpdateProcessKorwilResponseVm();
    const timeNow = moment().toDate();
    result.message = "success";
    result.status = "ok";

    let korwilTransaction = await KorwilTransaction.findOne({
      where: {
        korwilTransactionId: payload.korwilTransactionId,
        status: 0,
      }
    });
    if(!korwilTransaction){
      result.message = "error";
      result.status = "Korwil tidak ditemukan atau sudah di submit";
      return result;
    }
    korwilTransaction.totalTask = await this.getTotalTask(payload.korwilTransactionId);
    korwilTransaction.userIdUpdated = authMeta.userId;
    korwilTransaction.updatedTime = timeNow;
    korwilTransaction.date = timeNow;
    korwilTransaction.status = 1;
    await KorwilTransaction.save(korwilTransaction);

    result.statusKorwilTransaction = korwilTransaction.status;
    return result;
  }

  public static async getItemList(
    branchId: string,
  )
  : Promise <ItemListKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    const qb1 = createQueryBuilder();
    qb1.addSelect('kt.korwil_transaction_id', 'id');
    qb1.from('korwil_transaction', 'kt');
    qb1.andWhere('kt.branch_id = :branchIdTemp',{ branchIdTemp: branchId});
    qb1.andWhere('kt.user_id = :userId', { userId: authMeta.userId });
    qb1.orderBy('created_time', 'DESC');
    const dataKorwil = await qb1.getRawOne();
    let id = dataKorwil ? dataKorwil.id : null;

    // item list korwil
    const qb = createQueryBuilder();
    qb.addSelect('ki.korwil_item_name', 'korwilItemName');
    qb.addSelect('ktd.korwil_item_id', 'korwilItemId');
    qb.addSelect('ktd.korwil_transaction_detail_id', 'korwilTransactionDetailId');
    qb.addSelect('ktd.status', 'status');
    qb.addSelect('kt.korwil_transaction_id', 'korwilTransactionId');
    qb.addSelect('kt.status', 'statusTransaction');
    qb.addSelect('ktd.note', 'note');
    qb.from('korwil_transaction', 'kt');
    qb.innerJoin('korwil_transaction_detail',
    'ktd',
    'ktd.korwil_transaction_id = kt.korwil_transaction_id AND ktd.is_deleted = false'
    );
    qb.innerJoin('korwil_item',
    'ki',
    'ki.korwil_item_id = ktd.korwil_item_id AND ki.is_deleted = false'
    );
    qb.innerJoin('user_to_branch',
    'utb',
    'utb.ref_branch_id = kt.branch_id AND utb.is_deleted = false'
    );
    qb.where('kt.is_deleted = false');
    qb.andWhere('kt.branch_id = :branchIdTemp',{ branchIdTemp: branchId});
    qb.andWhere('utb.ref_user_id = :userId', { userId: authMeta.userId });
    qb.andWhere('kt.korwil_transaction_id = :korwilId', { korwilId: id });
    qb.orderBy('ki.sort_order', 'ASC');

    const data = await qb.getRawMany();
    console.log(data);
    const result = new ItemListKorwilResponseVm();
    result.itemList = [];
    result.korwilTransactionId = "";
    result.status = null;

    if(data.length != 0){
      result.itemList = data;
      result.korwilTransactionId = data[0].korwilTransactionId;
      result.status = data[0].statusTransaction;
    }
    return result;
  }

  public static async getDetailPhoto(
    korwilTransactionDetailId: string,
  )
  : Promise <DetailPhotoKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    // detail photo
    let qb = createQueryBuilder();
    qb.addSelect('ktd.note', 'note');
    qb.addSelect('ktd.is_done', 'isDone');
    qb.addSelect('ktd.status', 'status');
    qb.from('korwil_transaction_detail', 'ktd');
    qb.where('ktd.is_deleted = false');
    qb.andWhere('ktd.korwil_transaction_detail_id = :korwilTransactionDetailId', { korwilTransactionDetailId: korwilTransactionDetailId });

    const data = await qb.getRawOne();
    const result = new DetailPhotoKorwilResponseVm();
    result.isDone = data.isDone;
    result.note = data.note;
    result.status = data.status;

    qb = createQueryBuilder();
    qb.addSelect('at.url', 'url');
    qb.addSelect('ktdp.photo_id', 'id');
    qb.from('korwil_transaction_detail_photo', 'ktdp');
    qb.innerJoin('attachment_tms',
    'at',
    'at.attachment_tms_id = ktdp.photo_id AND at.is_deleted = false'
    );
    qb.where('ktdp.is_deleted = false');
    qb.andWhere('ktdp.korwil_transaction_detail_id = :korwilTransactionDetailId', { korwilTransactionDetailId: korwilTransactionDetailId });
    const dataUrl = await qb.getRawMany();

    result.photo = dataUrl;
    return result;
  }

  public static async validateBranchCoordinate(
    payload: MobileValidateCoordinateKorwilTransactionPayloadVm
  ): Promise<MobileKorwilTransactionResponseVm>{
    const result = new MobileKorwilTransactionResponseVm();
    result.message = "success";
    result.status = "ok";

    const responseCheckBranch = await this.validateBranchByCoordinate(payload.latitude, payload.longitude, payload.branchId);
    if (responseCheckBranch.status == false){
      result.status = "error";
      result.message = responseCheckBranch.message;
    }

    return result;
  }
  public static async updateTransaction(
    payload: MobilePostKorwilTransactionPayloadVm,
    files
  ): Promise<MobileKorwilTransactionResponseVm> {
    const result = new MobileKorwilTransactionResponseVm();
    const authMeta = AuthService.getAuthMetadata();
    const timeNow = moment().toDate();

    result.message = "success";
    result.status = "ok";

    // validate branch must near coordinate user
    const responseCheckBranch = await this.validateBranchByCoordinate(payload.latitude, payload.longitude, payload.branchId);
    if (responseCheckBranch.status == false){
      result.status = "error";
      result.message = responseCheckBranch.message;
      return result;
    }

    let qb = createQueryBuilder();
    qb.addSelect('ktd.korwil_transaction_detail_id', 'korwilTransactionDetailId');
    qb.from('korwil_transaction_detail', 'ktd');
    qb.innerJoin('korwil_transaction',
    'kt',
    'kt.korwil_transaction_id = ktd.korwil_transaction_id AND ktd.is_deleted = false'
    );
    qb.where('ktd.is_deleted = false');
    qb.andWhere('ktd.korwil_transaction_detail_id = :korwilTransactionDetailId', { korwilTransactionDetailId: payload.korwilTransactionDetailId });
    qb.andWhere('kt.korwil_transaction_id = :korwilTransactionId', { korwilTransactionId: payload.korwilTransactionId });
    const checkData = await qb.getRawOne();

    if(!checkData){
      result.message = "Data korwil tidak ditemukan";
      result.status = "error";
      return result;
    }

    let countInsertedImage = 0;
    // upload image
    files.forEach(file => {
      countInsertedImage++;
      this.uploadImage(file, payload.korwilTransactionDetailId);
    });

    // Delete unused photo
    const deletedPhotos = JSON.parse(payload.deletedPhotos);
    if(deletedPhotos){
      deletedPhotos.forEach(id => {
        this.deletePhotoKorwil(id);
      });
    }

    // GET total photo after delete and upload
    let qb1 = createQueryBuilder();
    qb1.addSelect('ktdp.korwil_transaction_detail_photo_id', 'korwilTransactionDetailPhotoId');
    qb1.from('korwil_transaction_detail', 'ktd');
    qb1.innerJoin('korwil_transaction_detail_photo',
    'ktdp',
    'ktdp.korwil_transaction_detail_id = ktd.korwil_transaction_detail_id AND ktdp.is_deleted = false'
    );
    qb1.where('ktd.is_deleted = false');
    qb1.andWhere('ktdp.korwil_transaction_detail_id = :korwilTransactionDetailId', { korwilTransactionDetailId: payload.korwilTransactionDetailId });
    const photos = await qb1.getRawMany();
    const temp = photos.length;

    const deletedPhotoLength = payload.deletedPhotos ? payload.deletedPhotos.length : 0;
    const countPhoto = temp - deletedPhotoLength + countInsertedImage;
    console.log(temp,deletedPhotoLength,countInsertedImage)
    // update count photo in korwil
    let korwilTransactionDetail = await KorwilTransactionDetail.findOne({
      where: {
        korwilTransactionDetailId: payload.korwilTransactionDetailId,
      }
    });
    korwilTransactionDetail.latChecklist = payload.latitude;
    korwilTransactionDetail.longChecklist = payload.longitude;
    korwilTransactionDetail.note = payload.note;
    korwilTransactionDetail.isDone = true;
    korwilTransactionDetail.status = 2;
    korwilTransactionDetail.date = timeNow;
    korwilTransactionDetail.userIdUpdated = authMeta.userId;
    korwilTransactionDetail.updatedTime = timeNow;
    korwilTransactionDetail.photoCount = countPhoto;
    await KorwilTransactionDetail.save(korwilTransactionDetail);

    return result;
  }

  private static async uploadImage(file, korwilTransactionDetailId){
    if(file){
      const timeNow = moment().toDate();
      const authMeta = AuthService.getAuthMetadata();
      let attachmentId = null;
      const attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        'tms-korwil',
      );
      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
      }

      const korwilTransactionDetailPhoto          = KorwilTransactionDetailPhoto.create();
      korwilTransactionDetailPhoto.photoId        = attachmentId;
      korwilTransactionDetailPhoto.korwilTransactionDetailId = korwilTransactionDetailId;
      korwilTransactionDetailPhoto.isDeleted      = false;
      korwilTransactionDetailPhoto.updatedTime    = timeNow;
      korwilTransactionDetailPhoto.createdTime    = timeNow;
      korwilTransactionDetailPhoto.userIdCreated  = authMeta.userId;
      korwilTransactionDetailPhoto.userIdUpdated  = authMeta.userId;
      await KorwilTransactionDetailPhoto.save(korwilTransactionDetailPhoto);
    }
  }

  private static async getTotalTask(korwilTransactionId){
    const qb = createQueryBuilder();
    qb.addSelect('ki.korwil_item_id', 'korwilItemId');
    qb.from('korwil_item', 'ki');
    qb.innerJoin('korwil_transaction_detail',
    'ktd',
    'ktd.korwil_item_id = ki.korwil_item_id AND ktd.is_deleted = false'
    );
    qb.where('ki.is_deleted = false');
    qb.where('ktd.korwil_transaction_id = :korwilTransactionIdTemp',{korwilTransactionIdTemp: korwilTransactionId});
    const result = await qb.getCount();
    return result;
  }

  private static async deletePhotoKorwil(id){
    const attachmentTms = await AttachmentTms.findOne({
      where: {
        attachmentTmsId: Number(id),
        isDeleted: false,
      }
    });
    if(attachmentTms){AttachmentService.deleteAttachment(attachmentTms.attachmentTmsId);}

    const deleteKorwilPhoto = await KorwilTransactionDetailPhoto.findOne({
      where: {
        photoId: Number(id),
        isDeleted: false,
      }
    });
    if(deleteKorwilPhoto){
      deleteKorwilPhoto.isDeleted = true;
      await KorwilTransactionDetailPhoto.save(deleteKorwilPhoto);
    }
  }

  public static async validateBranchByCoordinate(lat, long, branchId): Promise<ValidateBranchCoordinateResponseVm>{
    const lata = parseFloat(lat);
      const longa = parseFloat(long);
      const radius = [0.5, 0.5]; // in kilometer
      const data = [];
      const response = new ValidateBranchCoordinateResponseVm();
      let nearby_branch = await this.getNearby(lata, longa, radius[0])

      response.status= false;
      response.message= "Lokasi branch tidak valid";

      const res = await RawQueryService.query(`SELECT branch_id FROM branch WHERE is_deleted = false
      AND longitude IS NOT NULL AND latitude IS NOT NULL
      AND latitude::float >= ${nearby_branch[0]} AND latitude::float <= ${nearby_branch[2]}
      AND longitude::float >= ${nearby_branch[1]} AND longitude::float <= ${nearby_branch[3]}
      AND branch_id = ${branchId}`);
      if (res.length != 0) {
        response.message = "Lokasi branch valid";
        response.status = true;
      }
      return response;
  }

  static async getNearby(lat, long, radius) {
    // NOTE:
    // PURPOSE: get latitude and longitude in radius by method get_nearby
    // (see https://gist.github.com/rochacbruno/2883505)

    // offsets in kilometers
    const dn = radius
    const de = radius

    // coordinate offsets in radians
    const dLat = (dn / this.E_RADIUS)
    const dLon = de / (this.E_RADIUS * Math.cos(Math.PI * lat / 180))

    // offset position, decimal degrees
    const min_lat = lat - ( dLat * 180 / Math.PI )
    const min_lon = long - ( dLon * 180 / Math.PI )

    // offset position, decimal degrees
    const max_lat = lat + ( dLat * 180 / Math.PI )
    const max_lon = long + ( dLon * 180 / Math.PI )

    return [min_lat, min_lon, max_lat, max_lon]
  }

  static async haversine(lat1: number, lon1: number, lat2: number, lon2: number) {

    // var dlat: number, dlon: number, a: number, c: number, R: number;
    let dlat, dlon, a, c, R: number;

    dlat = this.radians(lat2 - lat1);
    dlon = this.radians(lon2 - lon1);
    lat1 = this.radians(lat1);
    lat2 = this.radians(lat2);
    a = Math.sin(dlat / 2) * Math.sin(dlat / 2) + Math.sin(dlon / 2) * Math.sin(dlon / 2) * Math.cos(lat1) * Math.cos(lat2)
    c = 2 * Math.asin(Math.sqrt(a));
    return this.E_RADIUS * c;
  }

  static radians(degree: number) {
    // degrees to radians
    return degree * Math.PI / 180;
  }

  public async createTransactionItem(
    korwilTransactionId: string,
  ){
    const authMeta = AuthService.getAuthMetadata();
    const qb = createQueryBuilder();
    qb.addSelect('ki.korwil_item_name', 'korwilItemName');
    qb.addSelect('ki.korwil_item_id', 'korwilItemId');
    qb.from('korwil_item', 'ki');

    const res = await qb.getRawMany();

    res.forEach(async(item) => {
      const korwilTransactionDetail = KorwilTransactionDetail.create();
      korwilTransactionDetail.korwilItemId = item.korwilItemId;
      korwilTransactionDetail.korwilTransactionId = korwilTransactionId;
      korwilTransactionDetail.latChecklist = "";
      korwilTransactionDetail.longChecklist = "";
      korwilTransactionDetail.note = "";
      korwilTransactionDetail.status = 1;
      korwilTransactionDetail.isDone = false;
      korwilTransactionDetail.date = moment().toDate();
      korwilTransactionDetail.photoCount = 0;
      korwilTransactionDetail.userIdCreated = authMeta.userId;
      korwilTransactionDetail.createdTime = moment().toDate();
      korwilTransactionDetail.updatedTime = moment().toDate();
      korwilTransactionDetail.userIdUpdated = authMeta.userId;
      await KorwilTransactionDetail.save(korwilTransactionDetail);
    });
  }
}
