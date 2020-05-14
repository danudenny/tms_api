// //#region
import _, { assign, join, sampleSize } from 'lodash';
import { createQueryBuilder } from 'typeorm';
import { HttpStatus } from '@nestjs/common';

import { Awb } from '../../../../../shared/orm-entity/awb';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { AwbTrouble } from '../../../../../shared/orm-entity/awb-trouble';
import { Bag } from '../../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../../shared/orm-entity/bag-item-awb';
import { District } from '../../../../../shared/orm-entity/district';
import { PodScanInHub } from '../../../../../shared/orm-entity/pod-scan-in-hub';
import { PodScanInHubBag } from '../../../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../../../shared/orm-entity/pod-scan-in-hub-detail';
import { Representative } from '../../../../../shared/orm-entity/representative';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
import { BagItemHistoryQueueService } from '../../../../queue/services/bag-item-history-queue.service';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { PackageBackupPayloadVm } from '../../../models/gabungan-payload.vm';
import {
  AwbPackageDetail,
  PackageAwbBackupResponseVm,
} from '../../../models/gabungan.response.vm';
import { AwbService } from '../../v1/awb.service';
import { BagService } from '../../v1/bag.service';
import moment = require('moment');
// //#endregion

export class V1PackageService {
  constructor() {}

  static async awbPackage(
    payload: PackageBackupPayloadVm,
  ): Promise<PackageAwbBackupResponseVm> {
    const regexNumber = /^[0-9]+$/;
    const value = payload.value;
    const valueLength = value.length;
    const result = new PackageAwbBackupResponseVm();

    result.districtId = 0;
    result.districtName = null;

    // gab paket
    if (value.includes('*BUKA')) {
      const dataResult = await this.openSortirCombine(payload);
      result.bagNumber = dataResult.bagNumber;
      result.districtName = dataResult.districtName;
      result.districtId = dataResult.districtId;
      result.podScanInHubId = dataResult.podScanInHubId;
      result.dataBag = dataResult.dataBag;
      result.bagItemId = dataResult.bagItemId;
    } else if (regexNumber.test(value) && valueLength === 12) {
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
      result.dataBag = scanResult.dataBag;
      result.bagNumber = scanResult.bagNumber;
      result.districtId = scanResult.districtId;
      result.districtName = scanResult.districtName;
      result.data = scanResult.data;
      result.bagItemId = scanResult.bagItemId;
      result.isAllow = scanResult.isAllow;
      result.podScanInHubId = scanResult.podScanInHubId;
    } else if (value === '*SELESAI' || value === '*selesai') {
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

      result.districtId = district.districtId;
      result.districtName = district.districtName.trim();
    }

    return result;
  }

  static async loadAwbPackage(): Promise<PackageAwbBackupResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = new PackageAwbBackupResponseVm();

    result.districtId = 0;

    const podScanInHub = await PodScanInHub.findOne({
      where: {
        branchId: permissonPayload.branchId,
        userIdCreated: authMeta.userId,
        transactionStatusId: 100,
        scanInType: 'BAG',
        isDeleted: false,
      },
    });

    if (podScanInHub) {
      const podScanInHubId = podScanInHub.podScanInHubId;
      const qb = createQueryBuilder();
      qb.addSelect('b.bag_number', 'bagNumber');
      qb.addSelect('c.bag_seq', 'bagSeq');
      qb.addSelect('c.bag_item_id', 'bagItemId');
      qb.addSelect('b.district_id_to', 'districtId');
      qb.addSelect('f.district_name', 'districtName');
      qb.addSelect('d.consignee_name', 'consigneeName');
      qb.addSelect('d.consignee_address', 'consigneeAddress');
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

      bagNumber = `${data[0].bagNumber}${data[0].bagSeq
        .toString()
        .padStart(3, '0')}`;
      districtId = data[0].districtId;
      districtName = data[0].districtName;
      bagItemId = data[0].bagItemId;

      result.bagNumber = bagNumber;
      result.districtId = districtId;
      result.districtName = districtName;
      result.podScanInHubId = podScanInHubId;
      result.bagItemId = bagItemId;
      result.dataBag = data;
    }
    return result;
  }

  // private
  private static async openSortirCombine(
    payload,
  ): Promise<{
    bagNumber: string;
    districtId: number;
    districtName: string;
    podScanInHubId: string;
    dataBag: AwbPackageDetail[];
    bagItemId: number;
  }> {
    const value = payload.value;
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // open package combine
    const getNumberValue = value.replace('*BUKA ', '').trim();
    const bagNumber: string = getNumberValue.substring(0, 10);
    const bagDetail = await BagService.validBagNumber(bagNumber);

    if (!bagDetail) {
      RequestErrorService.throwObj(
        {
          message: 'No gabungan sortir tidak ditemukan',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const qb = createQueryBuilder();
    qb.addSelect('c.awb_number', 'awbNumber');
    qb.addSelect('c.consignee_name', 'consigneeName');
    qb.addSelect('c.consignee_address', 'consigneeAddress');
    qb.addSelect('c.total_weight_real_rounded', 'weight');
    qb.addSelect('c.customer_account_id', 'customerId');
    qb.addSelect('c.pickup_merchant', 'pickupMerchant');
    qb.addSelect('c.ref_reseller', 'refReseller');
    qb.addSelect('a.pod_scan_in_hub_id', 'podScanInHubId');
    qb.addSelect('e.district_id', 'districtId');
    qb.addSelect('e.district_name', 'districtName');
    qb.addSelect('false', 'isTrouble');
    qb.from('pod_scan_in_hub_bag', 'a');
    qb.innerJoin(
      'pod_scan_in_hub_detail',
      'b',
      'a.pod_scan_in_hub_id = b.pod_scan_in_hub_id AND b.is_deleted = false',
    );
    qb.innerJoin('awb', 'c', 'c.awb_id = b.awb_id AND c.is_deleted = false');
    qb.innerJoin('bag', 'd', 'd.bag_id = b.bag_id AND d.is_deleted = false');
    qb.innerJoin(
      'district',
      'e',
      'e.district_id = d.district_id_to AND e.is_deleted = false',
    );
    qb.where('a.is_deleted = false');
    qb.andWhere('a.bag_id = :bagId', { bagId: bagDetail.bagId });
    qb.andWhere('a.bag_item_id = :bagItemId', {
      bagItemId: bagDetail.bagItemId,
    });
    qb.andWhere('a.branch_id = :branchId', {
      branchId: permissonPayload.branchId,
    });
    const data = await qb.getRawMany();
    if (data.length < 1) {
      RequestErrorService.throwObj(
        {
          message: 'No gabungan sortir tidak ditemukan pada gerai ini',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataResult = {
      bagNumber,
      districtId: data[0].districtId,
      districtName: data[0].districtName,
      podScanInHubId: data[0].podScanInHubId,
      dataBag: data,
      bagItemId: bagDetail.bagItemId,
    };
    return dataResult;
  }

  private static async onFinish(payload): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const podScanInHub = await PodScanInHub.findOne({
      where: { podScanInHubId: payload.podScanInHubId },
    });
    podScanInHub.transactionStatusId = 200;
    podScanInHub.updatedTime = moment().toDate();
    podScanInHub.userIdUpdated = authMeta.userId;
    podScanInHub.save();
  }

  private static async createBagNumber(payload): Promise<any> {
    const result = new Object();
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    if (!payload.awbItemId || payload.awbItemId.length < 1) {
      RequestErrorService.throwObj(
        {
          message: 'Tidak ada nomor resi',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const districtId = payload.districtId;

    const qb = createQueryBuilder();
    qb.addSelect('a.bag_id', 'bagId');
    qb.addSelect('a.bag_number', 'bagNumber');
    qb.addSelect('a.district_id_to', 'districtIdTo');
    qb.addSelect('MAX(b.bag_seq)', 'lastSequence');
    qb.from('bag', 'a');
    qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
    qb.where('a.created_time::date = :today', {
      today: moment().format('YYYY-MM-DD'),
    });
    qb.andWhere('a.district_id_to = :districtId', { districtId });
    qb.andWhere('a.is_deleted = false');
    qb.groupBy('a.bag_id');

    const bagData = await qb.getRawOne();
    let bagId;
    let sequence;
    let randomBagNumber;

    if (!bagData) {
      // generate bag number
      randomBagNumber =
        'S' + sampleSize('012345678900123456789001234567890', 6).join('');
      const representativeCode = payload.districtDetail.districtCode.substring(
        0,
        3,
      );
      const representative = await Representative.findOne({
        where: { isDeleted: false, representativeCode },
      });

      const bagDetail = Bag.create({
        bagNumber: randomBagNumber,
        districtIdTo: districtId,
        refRepresentativeCode: representative.representativeCode,
        representativeIdTo: representative.representativeId,
        bagType: 'district',
        branchId: permissonPayload.branchId,
        bagDate: moment().format('YYYY-MM-DD'),
        bagDateReal: moment().toDate(),
        createdTime: moment().toDate(),
        updatedTime: moment().toDate(),
        userIdCreated: authMeta.userId,
        userIdUpdated: authMeta.userId,
        isSortir: true,
      });

      const bag = await Bag.save(bagDetail);
      bagId = bag.bagId;
      sequence = 1;
      assign(result, { bagNumber: randomBagNumber });
    } else {
      bagId = bagData.bagId;
      sequence = bagData.lastSequence + 1;
      randomBagNumber = bagData.bagNumber;
    }

    const awbDetail = payload.awbDetail;

    // INSERT INTO TABLE BAG ITEM
    const bagItemDetail = BagItem.create({
      bagId,
      bagSeq: sequence,
      branchIdLast: permissonPayload.branchId,
      bagItemStatusIdLast: 3000,
      userIdCreated: authMeta.userId,
      weight: parseFloat(awbDetail.totalWeightRealRounded),
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
      isSortir: true,
    });
    const bagItem = await BagItem.save(bagItemDetail);

    // NOTE: background job for insert bag item history
    BagItemHistoryQueueService.addData(
      bagItem.bagItemId,
      500,
      permissonPayload.branchId,
      authMeta.userId,
    );

    BagItemHistoryQueueService.addData(
      bagItem.bagItemId,
      3000,
      permissonPayload.branchId,
      authMeta.userId,
    );

    // INSERT INTO TABLE BAG ITEM AWB
    const bagItemAwbDetail = BagItemAwb.create({
      bagItemId: bagItem.bagItemId,
      awbNumber: awbDetail.awbNumber,
      weight: parseFloat(awbDetail.totalWeightRealRounded),
      awbItemId: payload.awbItemId,
      userIdCreated: authMeta.userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
      isSortir: true,
    });
    await BagItemAwb.save(bagItemAwbDetail);

    // update awb_item_attr
    const awbItemAttr = await AwbItemAttr.findOne({
      where: { awbItemId: payload.awbItemId, isDeleted: false },
    });
    awbItemAttr.bagItemIdLast = bagItem.bagItemId;
    awbItemAttr.updatedTime = moment().toDate();
    awbItemAttr.isPackageCombined = true;
    awbItemAttr.awbStatusIdLast = 4500;
    (awbItemAttr.userIdLast = authMeta.userId),
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
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
    });
    const podScanInHub = await PodScanInHub.save(podScanInHubData);

    // insert into pod scan in hub detail
    const podScanInHubDetailData = PodScanInHubDetail.create({
      podScanInHubId: podScanInHub.podScanInHubId,
      bagId,
      bagItemId: bagItem.bagItemId,
      bagNumber: randomBagNumber,
      awbItemId: payload.awbItemId,
      awbId: awbDetail.awbId,
      awbNumber: awbDetail.awbNumber,
      userIdCreated: authMeta.userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
    });

    // insert into pod scan in hub bag
    const podScanInHubBagData = PodScanInHubBag.create({
      podScanInHubId: podScanInHub.podScanInHubId,
      branchId: permissonPayload.branchId,
      bagId,
      bagNumber: randomBagNumber,
      bagItemId: bagItem.bagItemId,
      totalAwbItem: 1,
      totalAwbScan: 1,
      userIdCreated: authMeta.userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
    });

    assign(result, {
      bagItemId: bagItem.bagItemId,
      podScanInHubId: podScanInHub.podScanInHubId,
      bagNumber: `${randomBagNumber}${sequence.toString().padStart(3, '0')}`,
    });

    return result;
  }

  // TODO: need refactoring
  private static async awbScan(payload): Promise<any> {
    const value = payload.value;
    const result = new Object();
    const awbItemAttr = await AwbService.validAwbNumber(value);
    const districtId: number = payload.districtId;
    let bagNumber: number = payload.bagNumber;
    let podScanInHubId: string = payload.podScanInHubId;
    let bagItemId: string = payload.bagItemId;
    let isTrouble: boolean = false;
    const isAllow: boolean = true;
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

    const awb = await Awb.findOne({
      where: { awbNumber: value, isDeleted: false },
    });

    if (awb.toId) {
      // NOTES: WILL BE USE IN NEXT FUTURE
      if (awb.toId !== districtId) {
        troubleDesc.push('Tujuan tidak sesuai');
        // isAllow = false;
      }
    } else {
      isTrouble = true;
      troubleDesc.push('Tidak ada tujuan');
    }

    if (isAllow) {
      const districtDetail = await District.findOne({
        where: { isDeleted: false, districtId },
      });

      const detail = {
        awbNumber: awb.awbNumber,
        weight: awb.totalWeightRealRounded,
        consigneeName: awb.consigneeName,
        awbItemId: awbItemAttr.awbItemId,
        customerId: awb.customerAccountId,
        pickupMerchant: awb.pickupMerchant,
        shipperName: awb.refReseller,
        consigneeAddress: awb.consigneeAddress,
        isTrouble,
      };

      assign(payload, {
        awbItemId: awbItemAttr.awbItemId,
        awbDetail: awb,
        isTrouble,
        troubleDesc,
        districtDetail,
      });

      if (payload.bagNumber) {
        await this.insertDetailAwb(payload);
      } else {
        // Generate Bag Number
        const genBagNumber = await this.createBagNumber(payload);
        bagNumber = genBagNumber.bagNumber;
        bagItemId = genBagNumber.bagItemId;
        podScanInHubId = genBagNumber.podScanInHubId;
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
        data: detail,
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

  private static async insertDetailAwb(payload): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const bagDetail = await this.getBagDetail(payload.bagNumber);
    if (bagDetail) {
      // Insert into table bag item awb
      const bagItemAwbData = BagItemAwb.create({
        bagItemId: bagDetail.bagItemId,
        awbNumber: payload.awbDetail.awbNumber,
        weight: parseFloat(payload.awbDetail.totalWeightRealRounded),
        awbItemId: payload.awbItemId,
        userIdCreated: authMeta.userId,
        createdTime: moment().toDate(),
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      });
      await BagItemAwb.save(bagItemAwbData);

      // update weight in bag item
      const bagItem = await BagItem.findOne({
        where: { bagItemId: bagDetail.bagItemId },
      });
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
        createdTime: moment().toDate(),
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      });
    } // end of bagDetail

    // Update Pod scan in hub bag
    const podScanInHubBag = await PodScanInHubBag.findOne({
      where: { podScanInHubId: payload.podScanInHubId },
    });
    if (podScanInHubBag) {
      const totalAwbItem = (podScanInHubBag.totalAwbItem += 1);
      const totalAwbScan = (podScanInHubBag.totalAwbScan += 1);
      await PodScanInHubBag.update(
        {
          podScanInHubId: payload.podScanInHubId,
        },
        {
          totalAwbItem,
          totalAwbScan,
        },
      );
    }

    // update awb_item_attr
    const awbItemAttr = await AwbItemAttr.findOne({
      where: { awbItemId: payload.awbItemId, isDeleted: false },
    });
    if (awbItemAttr) {
      awbItemAttr.bagItemIdLast = bagDetail.bagItemId;
      awbItemAttr.updatedTime = moment().toDate();
      awbItemAttr.isPackageCombined = true;
      awbItemAttr.awbStatusIdLast = 4500;
      (awbItemAttr.userIdLast = authMeta.userId),
        await AwbItemAttr.save(awbItemAttr);
    }

    // update status
    DoPodDetailPostMetaQueueService.createJobByAwbFilter(
      payload.awbItemId,
      permissonPayload.branchId,
      authMeta.userId,
    );
  }

  private static async getBagDetail(
    bagNumber: string,
  ): Promise<{
    bagNumber: number;
    bagId: number;
    bagItemId: number;
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

  private static async insertAwbTrouble(data): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbTroubleCode = await CustomCounterCode.awbTrouble(
      moment().toDate(),
    );
    const awbTroubleData = AwbTrouble.create({
      awbTroubleCode,
      awbStatusId: 2600,
      transactionStatusId: 500,
      awbNumber: data.awbNumber,
      troubleDesc: data.troubleDesc,
      troubleCategory: 'sortir_bag',
      employeeIdTrigger: authMeta.userId,
      userIdTrigger: authMeta.userId,
      branchIdTrigger: permissonPayload.branchId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdCreated: authMeta.userId,
      userIdUpdated: authMeta.userId,
    });
    await AwbTrouble.save(awbTroubleData);
  }
}
