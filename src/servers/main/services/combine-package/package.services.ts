import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { sampleSize, assign, join } from 'lodash';
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
import { PodScanInHub } from '../../../../shared/orm-entity/pod-scan-in-hub';
import { PodScanInHubDetail } from '../../../../shared/orm-entity/pod-scan-in-hub-detail';
import { PodScanInHubBag } from '../../../../shared/orm-entity/pod-scan-in-hub-bag';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';

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
      result.dataBag        = scanResult.dataBag;
      result.bagNumber      = scanResult.bagNumber;
      result.districtId     = scanResult.districtId;
      result.districtName   = scanResult.districtName;
      result.data           = scanResult.data;
      result.bagItemId      = scanResult.bagItemId;
      result.isAllow        = scanResult.isAllow;
      result.podScanInHubId = scanResult.podScanInHubId;
    } else if (value === '*SELESAI' || value === '*selesai' ) {
      await this.onFinish(payload);
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

  async loadAwbPackage(): Promise<PackageAwbResponseVm> {
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result           = new PackageAwbResponseVm();

    result.districtId = 0;

    const podScanInHub = await PodScanInHub.findOne({ where: {
        branchId           : permissonPayload.branchId,
        userIdCreated      : authMeta.userId,
        transactionStatusId: 100,
        scanInType         : 'BAG',
        isDeleted          : false,
    }});

    if (podScanInHub) {
      const podScanInHubId = podScanInHub.podScanInHubId;
      const qb = createQueryBuilder();
      qb.addSelect('b.bag_number', 'bagNumber');
      qb.addSelect('c.bag_seq', 'bagSeq');
      qb.addSelect('c.bag_item_id', 'bagItemId');
      qb.addSelect('b.district_id_to', 'districtId');
      qb.addSelect('f.district_name', 'districtName');
      qb.addSelect('d.consignee_name', 'consigneeName');
      qb.addSelect('a.awb_item_id', 'awbItemId');
      qb.addSelect('d.awb_number', 'awbNumber');
      qb.addSelect('d.customer_account_id', 'customerId');
      qb.addSelect('d.pickup_merchant', 'pickupMerchant');
      qb.addSelect('d.ref_reseller', 'shipperName');
      qb.addSelect('d.total_weight_real_rounded', 'weight');
      qb.from('pod_scan_in_hub_detail', 'a');
      qb.innerJoin('bag', 'b', 'a.bag_id = b.bag_id');
      qb.innerJoin('bag_item', 'c', 'c.bag_item_id = a.bag_item_id');
      qb.innerJoin('awb', 'd', 'd.awb_id = a.awb_id');
      qb.innerJoin('awb_item', 'e', 'e.awb_item_id = a.awb_item_id');
      qb.innerJoin('district', 'f', 'f.district_id = b.district_id_to');
      qb.where('a.pod_scan_in_hub_id = :podScanInHubId', { podScanInHubId });
      qb.andWhere('a.is_deleted = false');

      const data = await qb.getRawMany();
      let bagNumber;
      let districtId;
      let districtName;
      let bagItemId;

      bagNumber = `${data[0].bagNumber}${data[0].bagSeq.toString().padStart(3, '0')}`;
      districtId = data[0].districtId;
      districtName = data[0].districtName;
      bagItemId = data[0].bagItemId;

      result.bagNumber      = bagNumber;
      result.districtId     = districtId;
      result.districtName   = districtName;
      result.podScanInHubId = podScanInHubId;
      result.bagItemId      = bagItemId;
      result.dataBag        = data;

    }
    return result;
  }

  private async onFinish(payload): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const podScanInHub = await PodScanInHub.findOne({ where: { podScanInHubId: payload.podScanInHubId } });
    podScanInHub.transactionStatusId = 200;
    podScanInHub.updatedTime         = moment().toDate();
    podScanInHub.userIdUpdated       = authMeta.userId;
    podScanInHub.save();
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
    qb.andWhere('a.district_id_to = :districtId', { districtId });
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
            districtIdTo : districtId,
            bagType      : 'district',
            branchId     : permissonPayload.branchId,
            bagDate      : moment().format('YYYY-MM-DD'),
            bagDateReal  : moment().toDate(),
            createdTime  : moment().toDate(),
            updatedTime  : moment().toDate(),
            userIdCreated: authMeta.userId,
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

    // INSERT INTO TABLE BAG ITEM
    const bagItemDetail = BagItem.create({
            bagId,
            bagSeq             : sequence,
            branchIdLast       : permissonPayload.branchId,
            bagItemStatusIdLast: 3000,
            userIdCreated      : authMeta.userId,
            weight             : parseFloat(awbDetail.totalWeightRealRounded),
            createdTime        : moment().toDate(),
            updatedTime        : moment().toDate(),
            userIdUpdated: authMeta.userId,
        });
    const bagItem = await BagItem.save(bagItemDetail);

    const totalWeight = parseFloat(awbDetail.weight);
    // INSERT INTO TABLE BAG ITEM AWB
    const bagItemAwbDetail = BagItemAwb.create({
            bagItemId    : bagItem.bagItemId,
            awbNumber    : awbDetail.awbNumber,
            weight       : parseFloat(awbDetail.totalWeightRealRounded),
            awbItemId    : payload.awbItemId,
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
          // 100 = inprogress, 200 = done
          transactionStatusId: 100,
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

    assign(result,  {
      bagItemId     : bagItem.bagItemId,
      podScanInHubId: podScanInHub.podScanInHubId,
      bagNumber     : `${randomBagNumber}${sequence.toString().padStart(3, '0')}`,
    });

    return result;
  }

  private async awbScan(payload): Promise<any> {
    const value            = payload.value;
    const result           = new Object();
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbItemAttr      = await AwbService.validAwbNumber(value);
    const districtId: number    = payload.districtId;
    let bagNumber: number       = payload.bagNumber;
    let podScanInHubId: number  = payload.podScanInHubId;
    let bagItemId: number       = payload.bagItemId;
    let isTrouble: boolean      = false;
    let isAllow: boolean        = true;
    const troubleDesc: String[] = [];

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

    if (awb.toId) {
      if (awb.toId !== districtId) {
        isAllow = false;
      }
    } else {
      isTrouble = true;
      troubleDesc.push('Tidak ada tujuan');
    }

    if (isAllow) {
      const districtDetail = await District.findOne({ where: { isDeleted: false, districtId } });

      const detail = {
        awbNumber     : awb.awbNumber,
        weight        : awb.totalWeightRealRounded,
        consigneeName : awb.consigneeName,
        awbItemId     : awbItemAttr.awbItemId,
        customerId    : awb.customerAccountId,
        pickupMerchant: awb.pickupMerchant,
        shipperName   : awb.refReseller,
        isTrouble,
      };

      assign(payload, {
        awbItemId: awbItemAttr.awbItemId,
        awbDetail: awb,
        isTrouble,
        troubleDesc,
      });

      if (payload.bagNumber) {
        await this.insertDetailAwb(payload);
      } else {
        // Generate Bag Number
        const genBagNumber = await this.createBagNumber(payload);
        bagNumber          = genBagNumber.bagNumber;
        bagItemId          = genBagNumber.bagItemId;
        podScanInHubId     = genBagNumber.podScanInHubId;
      }

      if (isTrouble) {
        const dataTrouble = {
          awbNumber: awb.awbNumber,
          troubleDesc: join(troubleDesc, ' dan '),
        };
        await this.insertAwbTrouble(dataTrouble);
      }

      assign(result, {
        bagNumber,
        isAllow,
        podScanInHubId,
        bagItemId,
        districtId,
        data        : detail,
        districtName: districtDetail.districtName,
      });
    } else {
      assign(result, {
        isAllow,
        bagNumber,
        podScanInHubId,
        bagItemId,
        data: [],
        districtId,
        districtName: null,
      });
    }

    return result;
  }

  private async insertDetailAwb(payload): Promise<any> {
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const bagDetail = await this.getBagDetail(payload.bagNumber);

    // Insert into table bag item awb
    const bagItemAwbData = BagItemAwb.create({
      bagItemId    : bagDetail.bagItemId,
      awbNumber    : payload.awbDetail.awbNumber,
      weight       : parseFloat(payload.awbDetail.totalWeightRealRounded),
      awbItemId    : payload.awbItemId,
      userIdCreated: authMeta.userId,
      createdTime  : moment().toDate(),
      updatedTime  : moment().toDate(),
      userIdUpdated: authMeta.userId,
    });
    await BagItemAwb.save(bagItemAwbData);

    // update weight in bag item
    const bagItem = await BagItem.findOne({ where: { bagItemId: bagDetail.bagItemId } });
    bagItem.weight += parseFloat(payload.awbDetail.totalWeightRealRounded);
    bagItem.save();

    // Insert into table pod scan in hub detail
    const podScanInHubDetailData = PodScanInHubDetail.create({
      podScanInHubId: payload.podScanInHubId,
      bagId: bagDetail.bagId,
      bagItemId: bagDetail.bagItemId,
      awbItemId: payload.awbItemId,
      awbId: payload.awbDetail.awbId,
      userIdCreated: authMeta.userId,
      createdTime  : moment().toDate(),
      updatedTime  : moment().toDate(),
      userIdUpdated: authMeta.userId,
    });
    const podScanInHubDetail = await PodScanInHubDetail.save(podScanInHubDetailData);

    // update awb_item_attr
    const awbItemAttr             = await AwbItemAttr.findOne({ where: { awbItemId: payload.awbItemId, isDeleted: false } });
    awbItemAttr.bagItemIdLast     = bagDetail.bagItemId;
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

  }

  private async getBagDetail(bagNumber: string): Promise<{
    bagNumber: number,
    bagId: number,
    bagItemId: number,
  }> {
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

  private async insertAwbTrouble(data): Promise<any> {
    const authMeta         = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbTroubleCode = await CustomCounterCode.awbTrouble(
      moment().toDate(),
    );
    const awbTroubleData = AwbTrouble.create({
        awbTroubleCode,
        awbStatusId       : 2600,
        transactionStatusId: 500,
        awbNumber         : data.awbNumber,
        troubleDesc       : data.troubleDesc,
        troubleCategory   : 'sortir_bag',
        employeeIdTrigger : authMeta.userId,
        userIdTrigger     : authMeta.userId,
        branchIdTrigger   : permissonPayload.branchId,
        createdTime       : moment().toDate(),
        updatedTime       : moment().toDate(),
        userIdCreated     : authMeta.userId,
        userIdUpdated     : authMeta.userId,
    });
    await AwbTrouble.save(awbTroubleData);
  }
}
