// //#region
import _, { assign, join, sampleSize } from 'lodash';
import { createQueryBuilder } from 'typeorm';
import { HttpStatus, BadRequestException } from '@nestjs/common';

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
  PackageAwbResponseVm,
} from '../../../models/gabungan.response.vm';
import { AwbService } from '../../v1/awb.service';
import { BagService } from '../../v1/bag.service';
import moment = require('moment');
import { Branch } from '../../../../../shared/orm-entity/branch';
// //#endregion

export class V1PackageService {
  constructor() {}

  static async awbPackage(
    payload: PackageBackupPayloadVm,
  ): Promise<PackageAwbResponseVm> {
    const regexNumber = /^[0-9]+$/;
    const value = payload.value;
    const valueLength = value.length;
    const result = new PackageAwbResponseVm();

    result.branchId = 0;
    result.branchName = null;

    // gab paket
    if (value.includes('*BUKA')) {
      const dataResult = await this.openSortirCombine(payload);
      result.bagNumber = dataResult.bagNumber;
      result.branchName = dataResult.branchName;
      result.branchId = dataResult.branchId;
      result.branchCode = dataResult.branchCode;
      result.podScanInHubId = dataResult.podScanInHubId;
      result.dataBag = dataResult.dataBag;
      result.bagItemId = dataResult.bagItemId;
      result.bagSeq = dataResult.bagSeq;
      result.weight = dataResult.weight;
    } else if (value === '*SELESAI' || value === '*selesai') {
      await this.onFinish(payload);
    } else {
      // scan awb number or district code
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
        result.dataBag = scanResult.dataBag;
        result.bagNumber = scanResult.bagNumber;
        result.branchId = scanResult.branchId;
        result.branchName = scanResult.branchName;
        result.branchCode = scanResult.branchCode;
        result.data = scanResult.data;
        result.bagItemId = scanResult.bagItemId;
        result.isAllow = scanResult.isAllow;
        result.podScanInHubId = scanResult.podScanInHubId;
        result.bagSeq = scanResult.bagSeq;
        result.bagWeight = scanResult.bagWeight;
      } else {
        // search branch code
        const branch = await Branch.findOne({
          where: {
            branchCode: value,
          },
        });
        if (branch) {
          result.branchId = branch.branchId;
          result.branchName = branch.branchName.trim();
          result.branchCode = branch.branchCode.trim();
        } else {
          throw new BadRequestException('Kode kecamatan tidak ditemukan');
        }
      }
    }

    return result;
  }

  static async loadAwbPackage(): Promise<PackageAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const result = new PackageAwbResponseVm();

    result.branchId = 0;

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
      qb.addSelect('c.weight', 'bagWeight');
      qb.addSelect('b.branch_id_to', 'branchId');
      qb.addSelect('f.branch_name', 'branchName');
      qb.addSelect('f.branch_code', 'branchCode');
      qb.addSelect('d.consignee_name', 'consigneeName');
      qb.addSelect('d.consignee_address', 'consigneeAddress');
      qb.addSelect('d.consignee_phone', 'consigneeNumber');
      qb.addSelect('a.awb_item_id', 'awbItemId');
      qb.addSelect('d.awb_number', 'awbNumber');
      qb.addSelect('d.customer_account_id', 'customerId');
      qb.addSelect('d.pickup_merchant', 'pickupMerchant');
      qb.addSelect('d.ref_reseller', 'shipperName');
      qb.addSelect('d.total_weight_real_rounded', 'weight');
      qb.addSelect('d.total_weight_final_rounded', 'totalWeightFinalRounded');
      qb.from('pod_scan_in_hub_detail', 'a');
      qb.innerJoin('bag', 'b', 'a.bag_id = b.bag_id');
      qb.innerJoin('bag_item', 'c', 'c.bag_item_id = a.bag_item_id');
      qb.innerJoin('awb', 'd', 'd.awb_id = a.awb_id');
      qb.innerJoin('awb_item', 'e', 'e.awb_item_id = a.awb_item_id');
      qb.innerJoin('branch', 'f', 'f.branch_id = b.branch_id_to');
      qb.where('a.pod_scan_in_hub_id = :podScanInHubId', { podScanInHubId });
      qb.andWhere('a.is_deleted = false');

      const data = await qb.getRawMany();
      let bagNumber;
      let branchId;
      let branchName;
      let bagItemId;
      let branchCode;
      let bagSeq;
      let bagWeight;

      bagNumber = `${data[0].bagNumber}${data[0].bagSeq
        .toString()
        .padStart(3, '0')}`;
      branchId = data[0].branchId;
      branchName = data[0].branchName;
      branchCode = data[0].branchCode;
      bagItemId = data[0].bagItemId;
      bagWeight = data[0].bagWeight;
      bagSeq = data[0].bagSeq;

      result.bagNumber = bagNumber;
      result.branchId = branchId;
      result.branchName = branchName;
      result.branchCode = branchCode;
      result.bagSeq = bagSeq;
      result.bagWeight = bagWeight;
      result.podScanInHubId = podScanInHubId;
      result.bagItemId = bagItemId;
      result.dataBag = data;
    }
    return result;
  }

  // private ==================================================================
  private static async openSortirCombine(
    payload,
  ): Promise<{
    bagNumber: string;
    branchId: number;
    branchName: string;
    podScanInHubId: string;
    dataBag: AwbPackageDetail[];
    bagItemId: number;
    branchCode: string;
    bagSeq: number;
    weight: number;
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
    qb.addSelect('c.consignee_phone', 'consigneeNumber');
    qb.addSelect('c.total_weight_real_rounded', 'weight');
    qb.addSelect('c.total_weight_final_rounded', 'totalWeightFinalRounded');
    qb.addSelect('c.customer_account_id', 'customerId');
    qb.addSelect('c.pickup_merchant', 'pickupMerchant');
    qb.addSelect('c.ref_reseller', 'refReseller');
    qb.addSelect('a.pod_scan_in_hub_id', 'podScanInHubId');
    qb.addSelect('e.branch_id', 'branchId');
    qb.addSelect('e.branch_name', 'branchName');
    qb.addSelect('e.branch_code', 'branchCode');
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
      'branch',
      'e',
      'e.branch_id = d.branch_id_to AND e.is_deleted = false',
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
    if (data.length) {
      const dataResult = {
        bagNumber,
        branchId: data[0].branchId,
        branchName: data[0].branchName,
        podScanInHubId: data[0].podScanInHubId,
        branchCode: data[0].branchCode,
        dataBag: data,
        bagItemId: bagDetail.bagItemId,
        bagSeq: bagDetail.bagSeq,
        weight: bagDetail.weight,
      };
      return dataResult;
    } else {
      throw new BadRequestException(
        'No gabungan sortir tidak ditemukan pada gerai ini',
      );
    }
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
    const value = payload.value;
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
    const branchId = payload.branchId;

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
    qb.andWhere('a.branch_id_to = :branchId', { branchId });
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
      const representativeCode = payload.districtDetail
        ? payload.districtDetail.districtCode.substring(0, 3)
        : null;
      const representative = await Representative.findOne({
        where: { isDeleted: false, representativeCode },
      });

      const bagDetail = Bag.create({
        bagNumber: randomBagNumber,
        branchIdTo: branchId,
        refRepresentativeCode: representative
          ? representative.representativeCode
          : null,
        representativeIdTo: representative
          ? representative.representativeId
          : null,
        refBranchCode: payload.branchDetail.branchCode,
        bagType: 'branch',
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
      weight: awbDetail.totalWeightRealRounded,
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

    const totalWeight = parseFloat(awbDetail.weight);
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
    const podScanInHubDetail = await PodScanInHubDetail.save(
      podScanInHubDetailData,
    );

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
    const podScanInHubBag = await PodScanInHubBag.save(podScanInHubBagData);
    const bagSeq = sequence.toString().padStart(3, '0');
    assign(result, {
      bagItemId: bagItem.bagItemId,
      podScanInHubId: podScanInHub.podScanInHubId,
      bagNumber: `${randomBagNumber}${bagSeq}`,
      weight: bagItem.weight,
      bagSeq,
    });

    return result;
  }

  private static async awbScan(payload): Promise<any> {
    const value = payload.value;
    const result = new Object();
    const awbItemAttr = await AwbService.validAwbNumber(value);
    const branchId: number = payload.branchId;
    let bagNumber: number = payload.bagNumber;
    let bag = null;
    let podScanInHubId: string = payload.podScanInHubId;
    let bagItemId: string = payload.bagItemId;
    let isTrouble: boolean = false;
    let isAllow: boolean = true;
    const troubleDesc: String[] = [];
    let districtId = null;
    let branch = null;

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
      branch = await Branch.findOne({
        where: {
          branchId,
        },
      });
      // NOTE: Validate branch
      if (!branch) {
        troubleDesc.push('Gerai tidak ditemukan');
        isAllow = false;
      } else {
        districtId = branch.districtId;
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
        totalWeightRealRounded: awb.totalWeightRealRounded,
        totalWeightFinalRounded: awb.totalWeightFinalRounded,
        consigneeName: awb.consigneeName,
        consigneeNumber: awb.consigneeNumber,
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
        branchDetail: branch,
      });

      if (payload.bagNumber) {
        bag = await this.insertDetailAwb(payload);
      } else {
        // Generate Bag Number
        const genBagNumber = await this.createBagNumber(payload);
        bagNumber = genBagNumber.bagNumber;
        bagItemId = genBagNumber.bagItemId;
        podScanInHubId = genBagNumber.podScanInHubId;
        bag = genBagNumber;
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
        branchId,
        data: detail,
        branchName: branch ? branch.branchName : null,
        branchCode: branch ? branch.branchCode : null,
        bagWeight: bag.weight,
        bagSeq: bag.bagSeq,
      });
    } else {
      assign(result, {
        isAllow,
        bagNumber,
        podScanInHubId,
        bagItemId,
        data: [],
        branchId,
        branchName: branch ? branch.branchName : null,
        branchCode: branch ? branch.branchCode : null,
        bagWeight: null,
        bagSeq: null,
      });
    }

    return result;
  }

  private static async insertDetailAwb(payload): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const bagDetail = await this.getBagDetail(payload.bagNumber);

    // Insert into table bag item awb
    const bagItemAwbData = BagItemAwb.create({
      bagItemId: bagDetail.bagItemId,
      awbNumber: payload.awbDetail.awbNumber,
      weight: payload.awbDetail.totalWeightRealRounded,
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
    const bagWeight = +bagItem.weight;
    const totalWeightRealRounded = +payload.awbDetail.totalWeightRealRounded;
    const bagWeightFinalFloat = (bagWeight + totalWeightRealRounded).toFixed(5);
    bagItem.weight = bagWeightFinalFloat as any;
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
    const podScanInHubDetail = await PodScanInHubDetail.save(
      podScanInHubDetailData,
    );

    // Update Pod scan in hub bag
    const podScanInHubBag = await PodScanInHubBag.findOne({
      where: { podScanInHubId: payload.podScanInHubId },
    });
    podScanInHubBag.totalAwbItem += 1;
    podScanInHubBag.totalAwbScan += 1;
    await PodScanInHubBag.save(podScanInHubBag);

    // update awb_item_attr
    const awbItemAttr = await AwbItemAttr.findOne({
      where: { awbItemId: payload.awbItemId, isDeleted: false },
    });
    awbItemAttr.bagItemIdLast = bagDetail.bagItemId;
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

    return bagItem;
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
