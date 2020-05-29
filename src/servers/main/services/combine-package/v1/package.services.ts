// //#region
import _, { assign, join, sampleSize } from 'lodash';
import { createQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

import { Awb } from '../../../../../shared/orm-entity/awb';
import { AwbTrouble } from '../../../../../shared/orm-entity/awb-trouble';
import { Bag } from '../../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { District } from '../../../../../shared/orm-entity/district';
import { PodScanInHub } from '../../../../../shared/orm-entity/pod-scan-in-hub';
import { Representative } from '../../../../../shared/orm-entity/representative';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { BagItemHistoryQueueService } from '../../../../queue/services/bag-item-history-queue.service';
import { PackagePayloadVm } from '../../../models/gabungan-payload.vm';
import { PackageAwbResponseVm } from '../../../models/gabungan.response.vm';
import { AwbService } from '../../v1/awb.service';
import { BagService } from '../../v1/bag.service';
import moment = require('moment');
import { Branch } from '../../../../../shared/orm-entity/branch';
import { OpenSortirCombineVM, PackageBagDetailVM, CreateBagNumberResponseVM } from '../../../models/package-payload.vm';
import { CreateBagFirstScanHubQueueService } from '../../../../queue/services/create-bag-first-scan-hub-queue.service';
import { CreateBagAwbScanHubQueueService } from '../../../../queue/services/create-bag-awb-scan-hub-queue.service';
import { PinoLoggerService } from '../../../../../shared/services/pino-logger.service';
// //#endregion

export class V1PackageService {
  constructor() {}

  static async awbPackage(
    payload: PackagePayloadVm,
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
        if (!payload.branchId && !payload.bagNumber) {
          throw new BadRequestException(
            'Masukan kode gerai terlebih dahulu',
          );
        }

        // TODO: handle first scan and create bag number
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
          throw new BadRequestException('Kode gerai tidak ditemukan');
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
      qb.addSelect('d.total_weight_real_rounded', 'totalWeightFinalRounded');
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
    payload: PackagePayloadVm,
  ): Promise<OpenSortirCombineVM> {
    const value = payload.value;
    const permissonPayload = AuthService.getPermissionTokenPayload();
    // open package combine
    const getNumberValue = value.replace('*BUKA ', '').trim();
    const bagNumber: string = getNumberValue.substring(0, 10);
    const bagDetail = await BagService.validBagNumber(bagNumber);

    if (!bagDetail) {
      throw new BadRequestException('No gabungan sortir tidak ditemukan');
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

  private static async onFinish(payload: PackagePayloadVm): Promise<boolean> {
    const authMeta = AuthService.getAuthData();
    const podScanInHub = await PodScanInHub.findOne({
      where: { podScanInHubId: payload.podScanInHubId },
    });
    if (podScanInHub) {
      await PodScanInHub.update({
        podScanInHubId: payload.podScanInHubId,
      }, {
        transactionStatusId: 200,
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      });
      return true;
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }
  }

  private static async createBagNumber(payload): Promise<CreateBagNumberResponseVM> {
    const result = new CreateBagNumberResponseVM();
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const branchId = payload.branchId;

    let bagId: number;
    let sequence: number;
    let randomBagNumber;

    if (!payload.awbItemId || payload.awbItemId.length < 1) {
      throw new BadRequestException('Tidak ada nomor resi');
    }

    const qb = createQueryBuilder();
    qb.addSelect('a.bag_id', 'bagId');
    qb.addSelect('a.bag_number', 'bagNumber');
    qb.addSelect('a.district_id_to', 'districtIdTo');
    qb.addSelect('MAX(b.bag_seq)', 'lastSequence');
    qb.from('bag', 'a');
    qb.innerJoin('bag_item', 'b', 'a.bag_id = b.bag_id');
    qb.where('a.created_time >= :today AND a.created_time < :tomorrow', {
      today: moment().format('YYYY-MM-DD'),
      tomorrow: moment().add(1, 'd').format('YYYY-MM-DD'),
    });
    qb.andWhere('a.branch_id_to = :branchId', { branchId });
    qb.andWhere('a.is_deleted = false');
    qb.groupBy('a.bag_id');

    const bagData = await qb.getRawOne();

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
    const bagSeq: string = sequence.toString().padStart(3, '0');
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

    // insert into pod scan in hub
    // 100 = inprogress, 200 = done
    const podScanInHubData = PodScanInHub.create({
      branchId: permissonPayload.branchId,
      scanInType: 'BAG',
      transactionStatusId: 100,
      userIdCreated: authMeta.userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
    });
    const podScanInHub = await PodScanInHub.save(podScanInHubData);

    // #region send to background process
    CreateBagFirstScanHubQueueService.perform(
      bagId,
      bagItem.bagItemId,
      randomBagNumber,
      payload.awbItemId,
      awbDetail.awbNumber,
      podScanInHub.podScanInHubId,
      parseFloat(awbDetail.totalWeightRealRounded),
      authMeta.userId,
      permissonPayload.branchId,
      moment().toDate(),
    );
    // #endregion send to background process

    // contruct data response
    result.bagItemId = bagItem.bagItemId;
    result.podScanInHubId = podScanInHub.podScanInHubId;
    result.bagNumber = `${randomBagNumber}${bagSeq}`;
    result.weight = bagItem.weight;
    result.bagSeq = sequence;

    return result;
  }

  private static async awbScan(payload: PackagePayloadVm): Promise<any> {
    const awbNumber = payload.value;
    const branchId: number = payload.branchId;
    const result = new Object();
    const troubleDesc: String[] = [];

    let bagWeight: number = null;
    let bagSeq: number = null;
    let branch: Branch = null;
    let branchName = null;
    let branchCode = null;

    let bagItemId: number = payload.bagItemId;
    let bagNumber: string = payload.bagNumber;
    let podScanInHubId: string = payload.podScanInHubId;

    let isTrouble: boolean = false;
    let isAllow: boolean = true;
    let districtId = null;

    const awbItemAttr = await AwbService.validAwbNumber(awbNumber);
    if (!awbItemAttr) {
      throw new BadRequestException('No resi tidak ditemukan / tidak valid');
    } else if (awbItemAttr.isPackageCombined) {
      throw new BadRequestException('Nomor resi sudah digabung sortir');
    }
    // check awb status
    if (awbItemAttr.awbStatusIdLast !== 2600) {
      isTrouble = true;
      troubleDesc.push('Awb status tidak sesuai');
    }

    // NOTE: check destination awb with awb.toId
    const awb = await Awb.findOne({
      where: { awbNumber, isDeleted: false },
    });
    if (awb.toId) {
      // use cache data
      branch = await Branch.findOne({ cache: true, where: { branchId } });
      // NOTE: Validate branch
      if (!branch) {
        isAllow = false;
        troubleDesc.push('Gerai tidak ditemukan');
      } else {
        branchCode = branch.branchCode;
        branchName = branch.branchName;
        districtId = branch.districtId;
      }
    } else {
      isTrouble = true;
      troubleDesc.push('Tidak ada tujuan');
    }

    if (isAllow) {
      // use cache data
      const districtDetail = await District.findOne({
        cache: true,
        where: { districtId, isDeleted: false },
      });

      // construct data detail
      // NOTE: change totalWeightFinalRounded : awb.totalWeightRealRounded
      const detail = {
        awbNumber: awb.awbNumber,
        totalWeightRealRounded: awb.totalWeightRealRounded,
        totalWeightFinalRounded: awb.totalWeightRealRounded,
        consigneeName: awb.consigneeName,
        consigneeNumber: awb.consigneeNumber,
        awbItemId: awbItemAttr.awbItemId,
        customerId: awb.customerAccountId,
        pickupMerchant: awb.pickupMerchant,
        shipperName: awb.refReseller,
        consigneeAddress: awb.consigneeAddress,
        isTrouble,
      };

      // assign data payload
      assign(payload, {
        awbItemId: awbItemAttr.awbItemId,
        awbDetail: awb,
        isTrouble,
        troubleDesc,
        districtDetail,
        branchDetail: branch,
      });

      // NOTE: critical path
      // get data bag / create new data bag
      if (payload.bagNumber) {
        const bagItem = await this.insertDetailAwb(payload);
        bagWeight = bagItem.weight;
        bagSeq = bagItem.bagSeq;
      } else {
        // Generate Bag Number
        const genBagNumber = await this.createBagNumber(payload);
        bagNumber = genBagNumber.bagNumber;
        podScanInHubId = genBagNumber.podScanInHubId;
        bagItemId = genBagNumber.bagItemId;
        bagWeight = genBagNumber.weight;
        bagSeq = genBagNumber.bagSeq;
      }

      // insert data trouble
      // TODO: feature disable
      if (isTrouble) {
        const dataTrouble = {
          awbNumber: awb.awbNumber,
          troubleDesc: join(troubleDesc, ' dan '),
        };
        console.error('TROUBLE SCAN GAB SORTIR :: ', dataTrouble);
        // await this.insertAwbTrouble(dataTrouble);
      }

      // construct response data
      assign(result, {
        bagNumber,
        isAllow,
        podScanInHubId,
        bagItemId,
        branchId,
        data: detail,
        branchName,
        branchCode,
        bagWeight,
        bagSeq,
      });

    } else {
      assign(result, {
        isAllow,
        bagNumber,
        podScanInHubId,
        bagItemId,
        data: [],
        branchId,
        branchName,
        branchCode,
        bagWeight,
        bagSeq,
      });
    }

    return result;
  }

  private static async insertDetailAwb(payload): Promise<BagItem> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const bagDetail = await BagService.validBagNumber(payload.bagNumber);

    if (!bagDetail) {
      throw new BadRequestException('No gabungan sortir tidak ditemukan');
    }

    // update weight in bag item
    const bagItem = await BagItem.findOne({
      where: { bagItemId: bagDetail.bagItemId },
    });
    if (bagItem) {
      const bagWeight = Number(bagItem.weight);
      const totalWeightRealRounded = Number(payload.awbDetail.totalWeightRealRounded);
      const bagWeightFinalFloat = parseFloat((bagWeight + totalWeightRealRounded).toFixed(5));
      PinoLoggerService.log('#### bagWeightFinalFloat :: ', bagWeightFinalFloat );

      await BagItem.update({
        bagItemId: bagDetail.bagItemId,
      }, {
        weight: bagWeightFinalFloat,
      });
      bagItem.weight = bagWeightFinalFloat;
      // await bagItem.save();

      // //#region sending background process
      CreateBagAwbScanHubQueueService.perform(
        bagDetail.bagId,
        bagDetail.bagItemId,
        bagDetail.bag.bagNumber,
        payload.awbItemId,
        payload.awbDetail.awbNumber,
        payload.podScanInHubId,
        payload.awbDetail.totalWeightRealRounded,
        authMeta.userId,
        permissonPayload.branchId,
        moment().toDate(),
      );
      // //#endregion
    }
    return bagItem;
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

  // TODO: need to be removed
  private static async getBagDetail(
    bagNumber: string,
  ): Promise<PackageBagDetailVM> {
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
