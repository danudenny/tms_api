import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { sampleSize, assign } from 'lodash';
import moment = require('moment');
import { PackageAwbResponseVm } from '../../models/gabungan.response.vm';
import { PackagePayloadVm } from '../../models/gabungan-payload.vm';
import _ from 'lodash';
import { District } from '../../../../shared/orm-entity/district';
import { createQueryBuilder, In } from 'typeorm';
import { PodFilterDetailItem } from '../../../../shared/orm-entity/pod-filter-detail-item';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { AwbService } from '../v1/awb.service';
import { Awb } from '../../../../shared/orm-entity/awb';
import { PodScanIn } from '../../../../shared/orm-entity/pod-scan-in';
import { PodScanInHub } from '../../../../shared/orm-entity/pod_scan_in_hub';
import { PodScanInHubDetail } from '../../../../shared/orm-entity/pod_scan_in_hub_detail';
import { PodScanInHubBag } from '../../../../shared/orm-entity/pod_scan_in_hub_bag';

@Injectable()
export class PackageService {
  constructor() {}

  async awbPackage(payload: PackagePayloadVm): Promise<PackageAwbResponseVm> {

    const regexNumber = /^[0-9]+$/;
    const value       = payload.value;
    const valueLength = value.length;
    const result      = new PackageAwbResponseVm();

    result.districtId   = 0;
    result.districtName = null;

    if (regexNumber.test(value) && valueLength === 12) {
      //  scan resi
      if (!payload.districtId && !payload.bagNumber) {
          RequestErrorService.throwObj(
          {
            message: 'Masukan kode kecamatan terlebih dahulu',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const scanResult = await this.awbScan(payload);
      result.dataBag      = scanResult.dataBag;
      result.bagNumber    = scanResult.bagNumber;
      result.districtId   = scanResult.districtId;
      result.districtName = scanResult.districtName;
      result.data         = scanResult.data;
    } else {
      // search district code
      const district = await District.findOne({
        where: { districtCode: value },
      });

      if (!district) {
        RequestErrorService.throwObj(
          {
            message: 'Kode kecamatan tidak ditemukan',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      result.districtId   = district.districtId;
      result.districtName = district.districtName.trim();
    }

    return result;
  }

  private async createBagNumber(payload): Promise<any> {
    const value            = payload.value;
    const result           = new Object();
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    if (!payload.awbItemId || payload.awbItemId.length < 1 ) {
        RequestErrorService.throwObj(
          {
            message: 'Tidak ada nomor resi',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    const districtId       = payload.districtId;

    const qb = createQueryBuilder();
    qb.addSelect('a.bag_id', 'bagId');
    qb.addSelect('a.bag_number', 'bagNumber');
    qb.addSelect('a.district_id_to', 'districtIdTo');
    qb.addSelect('MAX(b.bag_seq)', 'lastSequence');
    qb.from('bag', 'a');
    qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
    qb.where('a.created_time::date = :today', { today: moment().format('YYYY-MM-DD') });
    qb.andWhere('a.is_deleted = false');
    qb.groupBy('a.bag_id');

    const bagData = await qb.getRawOne();
    let bagId;
    let sequence;
    let randomBagNumber;

    if (!bagData) {
          // generate bag number
          randomBagNumber = 'GS' + sampleSize('012345678900123456789001234567890', 5).join('');
          const bagDetail = Bag.create({
            bagNumber    : randomBagNumber,
            bagType      : 'district',
            districtIdTo : districtId,
            branchId     : permissonPayload.branchId,
            userIdCreated: authMeta.userId,
            bagDate      : moment().format('YYYY-MM-DD'),
            bagDateReal  : moment().toDate(),
            createdTime  : moment().toDate(),
            updatedTime  : moment().toDate(),
            userIdUpdated: authMeta.userId,
          });

          const bag = await Bag.save(bagDetail);
          bagId     = bag.bagId;
          sequence  = 1;
          assign(result, { bagNumber: randomBagNumber });
        } else {
          bagId    = bagData.bagId;
          sequence = bagData.lastSequence + 1;
          randomBagNumber = bagData.bagNumber;
        }

    const awbDetail = payload.awbDetail;

    const bagItemDetail = BagItem.create({
            bagId,
            bagSeq             : sequence,
            branchIdLast       : permissonPayload.branchId,
            bagItemStatusIdLast: 3000,
            userIdCreated      : authMeta.userId,
            createdTime        : moment().toDate(),
            updatedTime        : moment().toDate(),
            userIdUpdated: authMeta.userId,
        });
    const bagItem = await BagItem.save(bagItemDetail);

    const totalWeight = parseFloat(awbDetail.weight);
    const bagItemAwbDetail = BagItemAwb.create({
            bagItemId    : bagItem.bagItemId,
            awbNumber    : awbDetail.awbNumber,
            weight       : awbDetail.weight,
            awbItemId    : awbDetail.awbItemId,
            userIdCreated: authMeta.userId,
            createdTime  : moment().toDate(),
            updatedTime  : moment().toDate(),
            userIdUpdated: authMeta.userId,
        });
    await BagItemAwb.save(bagItemAwbDetail);

        // update awb_item_attr
    const awbItemAttr             = await AwbItemAttr.findOne({ where: { awbItemId: payload.awbItemId, isDeleted: false } });
    awbItemAttr.bagItemIdLast     = bagItem.bagItemId;
    awbItemAttr.updatedTime       = moment().toDate();
    awbItemAttr.isPackageCombined = true;
    awbItemAttr.awbStatusIdLast   = 4500;
    awbItemAttr.userIdLast        = authMeta.userId,
      await AwbItemAttr.save(awbItemAttr);

        // update status
    DoPodDetailPostMetaQueueService.createJobByAwbFilter(
          payload.awbItemId,
          permissonPayload.branchId,
          authMeta.userId,
        );

        // insert into pod scan in hub
    const podScanInHubData = PodScanInHub.create({
          branchId: permissonPayload.branchId,
          scanInType: 'BAG',
          transactionStatusId: 200,
          userIdCreated: authMeta.userId,
          createdTime  : moment().toDate(),
          updatedTime  : moment().toDate(),
          userIdUpdated: authMeta.userId,
        });
    const podScanInHub = await PodScanInHub.save(podScanInHubData);

        // insert into pod scan in hub detail
    const podScanInHubDetailData = PodScanInHubDetail.create({
          podScanInHubId: podScanInHub.podScanInHubId,
          bagId,
          bagItemId: bagItem.bagItemId,
          awbItemId: payload.awbItemId,
          awbId: awbDetail.awbId,
          userIdCreated: authMeta.userId,
          createdTime  : moment().toDate(),
          updatedTime  : moment().toDate(),
          userIdUpdated: authMeta.userId,
        });
    const podScanInHubDetail = await PodScanInHubDetail.save(podScanInHubDetailData);

        // insert into pod scan in hub bag
    const podScanInHubBagData = PodScanInHubBag.create({
          podScanInHubId: podScanInHub.podScanInHubId,
          branchId: permissonPayload.branchId,
          bagId,
          bagItemId: bagItem.bagItemId,
          totalAwbItem: 1,
          userIdCreated: authMeta.userId,
          createdTime  : moment().toDate(),
          updatedTime  : moment().toDate(),
          userIdUpdated: authMeta.userId,
        });
    const podScanInHubBag = await PodScanInHubBag.save(podScanInHubBagData);

        // update bagItem
    const updateBagItem = await BagItem.findOne({ where: { bagItemId: bagItem.bagItemId } });

    updateBagItem.weight = totalWeight;
    await BagItem.save(updateBagItem);

    assign(result,  { bagItemId: bagItem.bagItemId, bagNumber: `${randomBagNumber}` + `${sequence.toString().padStart(3, '0')}` });

    return result;
  }

  private async awbScan(payload): Promise<any> {
    const value            = payload.value;
    const result           = new Object();
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    let isTrouble: boolean  = false;
    const troubleDesc: String[] = [];
    const awbItemAttr      = await AwbService.validAwbNumber(value);
    const districtId       = payload.districtId;
    let bagNumber          = payload.bagNumber;

    if (!awbItemAttr) {
      RequestErrorService.throwObj(
        {
          message: 'No resi tidak ditemukan / tidak valid',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else if (awbItemAttr.isPackageCombined) {
      RequestErrorService.throwObj(
        {
          message: 'Nomor resi sudah digabung sortir',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (Number(awbItemAttr.awbStatusIdLast) !== 2600) {
      isTrouble = true;
      troubleDesc.push('Awb status tidak sesuai');
    }

    const awb = await Awb.findOne({ where: { awbNumber: value } });

    if (awb.toId !== districtId) {
      isTrouble = true;
      troubleDesc.push('Tujuan tidak sesuai');
    }

    const districtDetail = await District.findOne({ where: { isDeleted: false, districtId } });

    const detail = {
      awbNumber     : awb.awbNumber,
      weight        : awb.totalWeightRealRounded,
      consigneeName : awb.consigneeName,
      awbItemId     : awbItemAttr.awbItemId,
      customerId    : awb.customerAccountId,
      pickupMerchant: awb.pickupMerchant,
      shipperName   : awb.refReseller,
    };

    assign(payload, {
      awbItemId: awbItemAttr.awbItemId,
      awbDetail: awb,
      isTrouble,
      troubleDesc,
    });

    if (!payload.bagNumber) {
      // Generate Bag Number
      const genBagNumber = await this.createBagNumber(payload);
      bagNumber  = genBagNumber.bagNumber;
    } else {
      await this.insertDetailAwb(payload);
    }

    assign(result, {
      bagNumber,
      data      : detail,
      districtId: districtDetail.districtId,
      districtName: districtDetail.districtName,
    });

    return result;
  }

  private async insertDetailAwb(payload): Promise<any> {
    const result = new Object();

    const bagNumber: string = payload.bagNumber.substring(0, 7);
    const bagSequence: number = Number(payload.bagNumber.substring(7, 10));

    return result;
  }

  private async getBagDetail(bagNumber: string): Promise<any> {
    const bagNumberReal: string = bagNumber.substring(0, 7);
    const bagSequence: number = Number(bagNumber.substring(7, 10));

    const qb = createQueryBuilder();
    qb.addSelect('a.bag_id', 'bagId');
    qb.addSelect('a.bag_number', 'bagNumber');
    qb.addSelect('b.bag_item_id', 'bagItemId');
    qb.from('bag', 'a');
    qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
    qb.where('a.bag_number = :bagNumber', { bagNumber: bagNumberReal });
    qb.andWhere('b.bag_seq = :bagSeq', { bagSeq: bagSequence });
    qb.andWhere('a.is_deleted = false');

    const bagDetail = await qb.getRawOne();

    return bagDetail;
  }
}
