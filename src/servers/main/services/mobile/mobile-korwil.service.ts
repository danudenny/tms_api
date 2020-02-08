import { createQueryBuilder } from 'typeorm';
import { isEmpty } from 'lodash';
import { AuthService } from '../../../../shared/services/auth.service';
import { BranchListKorwilResponseVm, MobilePostKorwilTransactionResponseVm, ItemListKorwilResponseVm, DetailPhotoKorwilResponseVm } from '../../models/mobile-korwil-response.vm';
import { MobilePostKorwilTransactionPayloadVm } from '../../models/mobile-korwil-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { ValidateBranchCoordinateResponseVm, BranchMessageResponseVm } from '../../models/branch-response.vm';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { KorwilTransactionDetail } from '../../../../shared/orm-entity/korwil-transaction-detail';
import moment = require('moment');
import { PayloadTooLargeException } from '@nestjs/common';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { KorwilTransactionDetailPhoto } from '../../../../shared/orm-entity/korwil-transaction-detail-photo';

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

  public static async getItemList(
    branchId: string,
  )
  : Promise <ItemListKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    // item list korwil
    const qb = createQueryBuilder();
    qb.addSelect('ki.korwil_item_name', 'korwilItemName');
    qb.addSelect('ktd.korwil_item_id', 'korwilItemId');
    qb.addSelect('ktd.korwil_transaction_detail_id', 'korwilTransactionDetailId');
    qb.addSelect('ktd.status', 'status');
    qb.addSelect('kt.korwil_transaction_id', 'korwilTransactionId');
    qb.addSelect('ktd.is_done', 'isDone');
    qb.addSelect('ktd.note', 'note');
    qb.from('korwil_transaction', 'kt');
    qb.innerJoin('korwil_transaction_detail',
    'ktd',
    'ktd.korwil_transaction_id = ktd.korwil_transaction_id AND ktd.is_deleted = false'
    );
    qb.innerJoin('korwil_item',
    'ki',
    'ki.korwil_item_id = ktd.korwil_item_id AND ki.is_deleted = false'
    );
    qb.innerJoin('user_to_branch',
    'utb',
    'utb.ref_branch_id = kt.branch_id AND utb.is_deleted = false'
    );
    qb.where('ktd.is_deleted = false');
    qb.andWhere('kt.branch_id = :branchIdTemp',{ branchIdTemp: branchId});
    qb.andWhere('utb.ref_user_id = :userId', { userId: authMeta.userId });

    const result = new ItemListKorwilResponseVm();
    const data = await qb.getRawMany();

    if(data){
      result.itemList = data;
      result.korwilTransactionId = data[0].korwilTransactionId;
      result.isDone = data[0].isDone;
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
    qb.andWhere('ktd.korwil_transaction_detail_id = :korwilTransactionDetailId', { korwilTransactionDetailId: korwilTransactionDetailId });

    const data = await qb.getRawOne();
    const result = new DetailPhotoKorwilResponseVm();
    result.isDone = data.isDone;
    result.note = data.note;
    result.status = data.status;

    qb = createQueryBuilder();
    qb.addSelect('at.url', 'url');
    qb.from('korwil_transaction_detail_photo', 'ktdp');
    qb.innerJoin('attachment_tms',
    'at',
    'at.attachment_tms_id = ktdp.photo_id AND at.is_deleted = false'
    );
    qb.andWhere('ktdp.korwil_transaction_detail_id = :korwilTransactionDetailId', { korwilTransactionDetailId: korwilTransactionDetailId });
    const dataUrl = await qb.getRawMany();
    let urls = [];

    dataUrl.forEach(elem => {
      urls.push(elem.url);
    });

    result.urlPhotos = urls;
    return result;
  }

  public static async validateBranchByCoordinate(lat, long, branchId): Promise<ValidateBranchCoordinateResponseVm>{
    const lata = parseFloat(lat);
      const longa = parseFloat(long);
      const radius = [0.5, 0.5]; // in kilometer
      const data = [];
      const response = new ValidateBranchCoordinateResponseVm();
      let nearby_branch = await this.getNearby(lata, longa, radius[0])

      response.status= false;
      response.message= "lokasi branch tidak valid";

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
      korwilTransactionDetail.status = 0;
      korwilTransactionDetail.date = moment().toDate();
      korwilTransactionDetail.photoCount = res.length;
      korwilTransactionDetail.userIdCreated = authMeta.userId;
      korwilTransactionDetail.createdTime = moment().toDate();
      korwilTransactionDetail.updatedTime = moment().toDate();
      korwilTransactionDetail.userIdUpdated = authMeta.userId;
      await KorwilTransactionDetail.save(korwilTransactionDetail);
    });
  }
}
