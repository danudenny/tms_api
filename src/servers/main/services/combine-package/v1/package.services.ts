// #region import
import _, { assign, join, sampleSize } from 'lodash';
import { createQueryBuilder, getManager } from 'typeorm';

import { BadRequestException } from '@nestjs/common';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { AwbTrouble } from '../../../../../shared/orm-entity/awb-trouble';
import { Bag } from '../../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../../shared/orm-entity/bag-item-awb';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { PodScanInHub } from '../../../../../shared/orm-entity/pod-scan-in-hub';
import { PodScanInHubBag } from '../../../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../../../shared/orm-entity/pod-scan-in-hub-detail';
import { Representative } from '../../../../../shared/orm-entity/representative';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { BagItemHistoryQueueService } from '../../../../queue/services/bag-item-history-queue.service';
import { CreateBagAwbScanHubQueueService } from '../../../../queue/services/create-bag-awb-scan-hub-queue.service';
import { CreateBagFirstScanHubQueueService } from '../../../../queue/services/create-bag-first-scan-hub-queue.service';
import { PackagePayloadVm } from '../../../models/gabungan-payload.vm';
import { PackageAwbResponseVm } from '../../../models/gabungan.response.vm';
import {
  CreateBagNumberResponseVM,
  OpenSortirCombineVM,
  UnloadAwbPayloadVm,
  UnloadAwbResponseVm,
  AwbScanPackageDetailVm,
} from '../../../models/package-payload.vm';
import { BagService } from '../../v1/bag.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import moment = require('moment');
// #endregion
const uuidv1 = require('uuid/v1');

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
          throw new BadRequestException('Masukan kode gerai terlebih dahulu');
        }

        // handle race condition
        const redlock = await RedisService.redlock(
          `redlock:hubSortir:awbScan:${payload.value}`,
          10,
        );
        if (!redlock) {
          throw new BadRequestException(
            `Resi ${payload.value}, sedang di proses!`,
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

        result.message = scanResult.message;
      } else {
        // search branch code
        const branch = await Branch.findOne({
          where: {
            branchCode: value,
            isActive : true,
            isDeleted : false
          },
        });
        if (branch) {
          payload.branchId = branch.branchId;
          const representative = await Representative.findOne({
            cache: true,
            where: {
              representativeId: branch.representativeId,
              isDeleted: false,
            },
          });

          if (representative) {
            // assign data payload
            assign(payload, {
              representative,
            });
          }
          // create new bag number sortir
          const genBagNumber = await this.createBagNumber(
            payload,
            branch.branchCode,
          );
          if (genBagNumber) {
            result.bagNumber = genBagNumber.bagNumber;
            result.bagItemId = genBagNumber.bagItemId;
            result.bagWeight = genBagNumber.weight;
            result.bagSeq = genBagNumber.bagSeq;
          }

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
        scanInType: 'BAG',
        transactionStatusId: 100,
        branchId: permissonPayload.branchId,
        userIdCreated: authMeta.userId,
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
      qb.andWhere('f.is_deleted = false and f.is_active = true')

      const data = await qb.getRawMany();
      let bagNumber;
      let branchId;
      let branchName;
      let bagItemId;
      let branchCode;
      let bagSeq;
      let bagWeight;
      // TODO: refactoring
      if (data) {
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
        return result;
      } else {
        throw new BadRequestException(
          'Data tidak ditemukan / sudah di proses!',
        );
      }
    } else {
      throw new BadRequestException('Data Sortir sudah di proses!');
    }
  }

  static async unloadAwb(
    payload: UnloadAwbPayloadVm,
  ): Promise<UnloadAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const timestamp = moment().toDate();
    const result = new UnloadAwbResponseVm();

    await getManager().transaction(async transactional => {
      // check valid data awb and bag item
      const bagItemAwb = await transactional.findOne(BagItemAwb, {
        where: {
          awbItemId: payload.awbItemId,
          bagItemId: payload.bagItemId,
          isSortir: true,
          isDeleted: false,
        },
      });

      if (bagItemAwb) {
        // Step 1: update AwbItemAttr
        await transactional.update(
          AwbItemAttr,
          { awbItemId: payload.awbItemId },
          {
            bagItemIdLast: null,
            updatedTime: timestamp,
            isPackageCombined: false,
            userIdLast: authMeta.userId,
          },
        );
        // 1.1 // Bag item [reduce weight] ?? next

        // Step 2: update BagItemAwb
        await transactional.update(
          BagItemAwb,
          {
            bagItemAwbId: bagItemAwb.bagItemAwbId,
          },
          {
            isDeleted: true,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );

        // Step 3: update PodScanInHubDetail
        await transactional.update(
          PodScanInHubDetail,
          {
            bagItemId: payload.bagItemId,
            awbItemId: payload.awbItemId,
          },
          {
            isDeleted: true,
            updatedTime: timestamp,
            userIdUpdated: authMeta.userId,
          },
        );

        // Step 4: balance total awb podScanInHubBag
        const podScanInHubBag = await transactional.findOne(PodScanInHubBag, {
          where: { bagItemId: payload.bagItemId },
        });
        if (podScanInHubBag) {
          await transactional.update(
            PodScanInHubBag,
            {
              bagItemId: payload.bagItemId,
            },
            {
              totalAwbItem: podScanInHubBag.totalAwbItem -= 1,
              totalAwbScan: podScanInHubBag.totalAwbScan -= 1,
            },
          );
        }

        // TODO: create new data history delete awb from combine package
        // insert data to package-awb-remove ???

        // handle response data
        result.awbNumber = bagItemAwb.awbNumber;
        result.awbItemId = bagItemAwb.awbItemId;
        result.bagItemId = bagItemAwb.bagItemId;
        result.bagNumber = payload.bagNumber;
        result.weight = bagItemAwb.weight;
      } else {
        throw new BadRequestException(
          'Data tidak valid No Resi tidak ditemukan!',
        );
      }
    });
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
    let bagWeightFinal;
    const authMeta = AuthService.getAuthData();
    const podScanInHub = await PodScanInHub.findOne({
      where: { podScanInHubId: payload.podScanInHubId },
    });
    if (podScanInHub) {
      const getCache = await RedisService.get(
        `package:combine:bagItemId:${payload.bagItemId}`,
      );
      // handle if cache redis notfound
      if (getCache) {
        bagWeightFinal = getCache;
      } else {
        const bagItem = await BagItem.findOne({
          select: ['weight', 'bagItemId'],
          where: {
            bagItemId: payload.bagItemId,
          },
        });
        bagWeightFinal = bagItem ? bagItem.weight : 0;
      }

      // transaction
      await getManager().transaction(async trans => {
        await trans.update(PodScanInHub,
          {
            podScanInHubId: payload.podScanInHubId,
          },
          {
            transactionStatusId: 200,
            updatedTime: moment().toDate(),
            userIdUpdated: authMeta.userId,
          },
        );

        await trans.update(
          BagItem,
          {
            bagItemId: payload.bagItemId,
          },
          {
            weight: Number(bagWeightFinal),
          },
        );
      });

      await RedisService.del(
        `package:combine:bagItemId:${payload.bagItemId}`,
      );
      return true;
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }
  }

  // TODO: need refactoring
  private static async createBagNumber(
    payload,
    branchCode: string,
  ): Promise<CreateBagNumberResponseVM> {
    const result = new CreateBagNumberResponseVM();
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timestamp = moment().toDate();
    const branchId = payload.branchId;

    let bagId: number;
    let sequence: number;
    let randomBagNumber;

    // if (!payload.awbItemId || payload.awbItemId.length < 1) {
    //   throw new BadRequestException('Tidak ada nomor resi');
    // }

    const qb = createQueryBuilder();
    qb.addSelect('a.bag_id', 'bagId');
    qb.addSelect('a.bag_number', 'bagNumber');
    qb.addSelect('a.district_id_to', 'districtIdTo');
    qb.from('bag', 'a');
    qb.where('a.created_time >= :today AND a.created_time < :tomorrow', {
      today: moment().format('YYYY-MM-DD'),
      tomorrow: moment()
        .add(1, 'd')
        .format('YYYY-MM-DD'),
    });
    qb.andWhere('a.branch_id = :branchIdHub', {
      branchIdHub: permissonPayload.branchId,
    });
    qb.andWhere('a.branch_id_to = :branchId', { branchId });
    qb.andWhere('a.is_manual = true');
    qb.andWhere('a.is_deleted = false');

    const bagData = await qb.getRawOne();

    if (!bagData) {
      // generate bag number
      let bagChecked;
      // transaction
      await getManager().transaction(async trans => {
        do {
          randomBagNumber =
            'S' + sampleSize('012345678900123456789001234567890', 6).join('');
          bagChecked = await trans.findOne(Bag, {
            where: {
              bagNumber: randomBagNumber,
              isDeleted: false,
            },
          });
        } while (bagChecked);

        const bagDetail = Bag.create({
          bagNumber: randomBagNumber,
          branchIdTo: branchId,
          refRepresentativeCode: payload.representative
            ? payload.representative.representativeCode
            : null,
          representativeIdTo: payload.representative
            ? payload.representative.representativeId
            : null,
          refBranchCode: branchCode,
          bagType: 'branch',
          branchId: permissonPayload.branchId,
          bagDate: moment().format('YYYY-MM-DD'),
          bagDateReal: timestamp,
          createdTime: timestamp,
          updatedTime: timestamp,
          userIdCreated: authMeta.userId,
          userIdUpdated: authMeta.userId,
          isSortir: true,
          isManual: true,
        });
        const bag = await trans.save(Bag, bagDetail);
        bagId = bag.bagId;
      }); // end transaction

      assign(result, { bagNumber: randomBagNumber });
    } else {
      bagId = bagData.bagId;
      randomBagNumber = bagData.bagNumber;
    }

    // NOTE: Check Bag Sequence
    let bagItemCheck;
    let bagSeq;

    // TODO: need rebuild
    do {
      const qbs = createQueryBuilder();
      qbs.addSelect('MAX(a.bag_seq)', 'bagSeqMax');
      qbs.from('bag_item', 'a');
      qbs.andWhere('a.bag_id = :bagId', { bagId });
      qbs.andWhere('a.is_deleted = false');

      const getSequence = await qbs.getRawOne();
      sequence = getSequence.bagSeqMax + 1;

      bagSeq = sequence.toString().padStart(3, '0');
      bagItemCheck = await BagItem.findOne({
        where: {
          bagId,
          isDeleted: false,
          bagSeq: sequence,
        },
      });
    } while (bagItemCheck);

    // INSERT INTO TABLE BAG ITEM
    let bagItem;
    // transaction
    await getManager().transaction(async trans => {
      const bagItemDetail = BagItem.create({
        bagId,
        bagSeq: sequence,
        branchIdLast: permissonPayload.branchId,
        bagItemStatusIdLast: 3000,
        userIdCreated: authMeta.userId,
        weight: 0,
        createdTime: timestamp,
        updatedTime: timestamp,
        userIdUpdated: authMeta.userId,
        isSortir: true,
      });
      bagItem = await trans.save(BagItem, bagItemDetail);
    });

    // bag number with bag seq (koli)
    result.bagItemId = bagItem.bagItemId;
    result.bagNumber = `${randomBagNumber}${bagSeq}`;
    result.weight = bagItem.weight;
    result.bagSeq = sequence;
    result.bagId = bagId;

    return result;
  }

  private static async firstPodScanInHub(
    payload,
  ): Promise<CreateBagNumberResponseVM> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    let podScanInHubId: string = null;

    // TODO: add payload.bagId
    // const bagDetail = await BagService.validBagNumber(payload.bagNumber);
    // find data to bagItemId
    const bagDetail = await BagItem.findOne({
      where: {
        bagItemId: payload.bagItemId,
        isDeleted: false,
      },
    });

    if (!bagDetail) {
      throw new BadRequestException('No gabungan sortir tidak ditemukan');
    }

    // update weight in bag item
    // delay get data from replication
    // TODO: change method update data weight bag ??
    if (bagDetail) {
      const totalWeightRealRounded = Number(payload.awbDetail.totalWeightRealRounded);
      const bagWeightFinalFloat = parseFloat(totalWeightRealRounded.toFixed(5));

      try {
        // proses store on redis
        await RedisService.incrbyfloat(
          `package:combine:bagItemId:${payload.bagItemId}`,
          bagWeightFinalFloat,
        );
        // await BagItem.update({
        //   bagItemId: bagDetail.bagItemId,
        // }, {
        //   weight: bagWeightFinalFloat,
        // });

        // #region PodScanInHub process
        const podScanInHub = await PodScanInHub.findOne({
          where: {
            scanInType: 'BAG',
            transactionStatusId: 100,
            branchId: permissonPayload.branchId,
            userIdCreated: authMeta.userId,
            isDeleted: false,
          },
        });
        if (podScanInHub) {
          podScanInHubId = podScanInHub.podScanInHubId;
        } else {
          // create new one
          // insert into pod scan in hub
          // 100 = inprogress, 200 = done
          podScanInHubId = uuidv1();
          const podScanInHubData = PodScanInHub.create({
            podScanInHubId,
            branchId: permissonPayload.branchId,
            scanInType: 'BAG',
            transactionStatusId: 100,
            userIdCreated: authMeta.userId,
            createdTime: moment().toDate(),
            updatedTime: moment().toDate(),
            userIdUpdated: authMeta.userId,
          });
          await PodScanInHub.insert(podScanInHubData);

          // #region send to background process
          CreateBagFirstScanHubQueueService.perform(
            bagDetail.bagId,
            bagDetail.bagItemId,
            payload.bagNumber,
            payload.awbItemId,
            payload.awbDetail.awbNumber,
            podScanInHubId,
            bagWeightFinalFloat,
            authMeta.userId,
            permissonPayload.branchId,
            moment().toDate(),
          );

          // NOTE: background job for insert bag item history
          BagItemHistoryQueueService.addData(
            bagDetail.bagItemId,
            500,
            permissonPayload.branchId,
            authMeta.userId,
            -1,
          );

          BagItemHistoryQueueService.addData(
            bagDetail.bagItemId,
            3000,
            permissonPayload.branchId,
            authMeta.userId,
          );
          // #endregion send to background process
        }
        // #endregion

        // contruct data response
        const result = new CreateBagNumberResponseVM();
        result.podScanInHubId = podScanInHubId;
        result.bagItemId = bagDetail.bagItemId;
        result.bagSeq = bagDetail.bagSeq;
        result.weight = bagWeightFinalFloat;
        return result;

      } catch (error) {
        console.error(error);
        throw new BadRequestException(
          'Problem Server, Coba beberapa saat lagi!',
        );
      }
    } else {
      throw new BadRequestException(
        `Bag Number ${payload.bagNumber}, tidak ditemukan`,
      );
    }
  }

  private static async awbScan(payload: PackagePayloadVm): Promise<any> {
    const awbNumber = payload.value;
    const branchId: number = payload.branchId;
    const result = new Object();
    const troubleDesc: String[] = [];

    let bagWeight: number = 0;
    let bagSeq: number = 0;

    // mapping
    let bagNumber: string = payload.bagNumber;
    let bagItemId: number = payload.bagItemId;
    let podScanInHubId: string = payload.podScanInHubId;

    let isTrouble: boolean = false;
    let isAllow: boolean = true;
    let message: string = 'ok';

    const awbItemAttr = await this.getAwbItem(awbNumber);
    // #region validation
    // handle awb number not found
    if (!awbItemAttr) {
      throw new BadRequestException('No resi tidak ditemukan / tidak valid');
    }

    // check awb status
    if (awbItemAttr.awbStatusIdLast !== 2600) {
      isTrouble = true;
      troubleDesc.push('Awb status tidak sesuai');
    }
    // #endregion

    // construct data detail
    // NOTE: change totalWeightFinalRounded : awb.totalWeightRealRounded
    const detail = {
      awbNumber: awbItemAttr.awbNumber,
      totalWeightRealRounded: awbItemAttr.totalWeightRealRounded,
      totalWeightFinalRounded: awbItemAttr.totalWeightRealRounded,
      consigneeName: awbItemAttr.consigneeName,
      consigneeNumber: awbItemAttr.consigneeNumber,
      awbItemId: awbItemAttr.awbItemId,
      customerId: awbItemAttr.customerAccountId,
      pickupMerchant: awbItemAttr.pickupMerchant,
      shipperName: awbItemAttr.refReseller,
      consigneeAddress: awbItemAttr.consigneeAddress,
      isTrouble,
    };

    if (awbItemAttr.isPackageCombined) {
      isAllow = false;
      // throw new BadRequestException('Nomor resi sudah digabung sortir');
      // check data bag item awb
      const bagItemAwb = await BagItemAwb.findOne({
        awbItemId: awbItemAttr.awbItemId,
        isSortir: true,
      });
      if (bagItemAwb) {
        const bagItem = await BagService.getBagNumber(bagItemAwb.bagItemId);
        if (bagItem) {
          bagNumber =
            bagItem.bag.bagNumber + bagItem.bagSeq.toString().padStart(3, '0');
          bagItemId = bagItem.bagItemId;
          bagWeight = bagItem.weight;
          bagSeq = bagItem.bagSeq;
          message = `Nomor resi sudah digabung sortir di ${bagNumber}`;
        }
      }
    } else {
      // assign data payload
      assign(payload, {
        awbItemId: awbItemAttr.awbItemId,
        awbDetail: awbItemAttr,
        isTrouble,
        troubleDesc,
      });

      // NOTE: critical path
      // get data bag / create new data bag
      if (payload.podScanInHubId) {
        const bagItem = await this.insertDetailAwb(payload);
        bagWeight = bagItem.weight;
        bagSeq = bagItem.bagSeq;
      } else {
        // NOTE: first scan in
        // generate podScanInHubId
        const podHub = await this.firstPodScanInHub(payload);
        podScanInHubId = podHub.podScanInHubId;
        bagItemId = podHub.bagItemId;
        bagWeight = podHub.weight;
        bagSeq = podHub.bagSeq;
      }
    }

    // #region insert data trouble
    // NOTE: feature disable
    // if (isTrouble) {
    // const dataTrouble = {
    //   awbNumber: awb.awbNumber,
    //   troubleDesc: join(troubleDesc, ' dan '),
    // };
    // console.error('TROUBLE SCAN GAB SORTIR :: ', dataTrouble);
    // await this.insertAwbTrouble(dataTrouble);
    // }
    // #endregion

    // construct response data
    assign(result, {
      bagNumber,
      isAllow,
      podScanInHubId,
      bagItemId,
      branchId,
      data: detail,
      bagWeight,
      bagSeq,
      message,
    });
    return result;
  }

  private static async insertDetailAwb(payload): Promise<BagItem> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // TODO: add payload.bagId
    // const bagDetail = await BagService.validBagNumber(payload.bagNumber);
    // find data to bagItemId
    const bagDetail = await BagItem.findOne({
      where: {
        bagItemId: payload.bagItemId,
        isDeleted: false,
      },
    });

    if (!bagDetail) {
      throw new BadRequestException('No gabungan sortir tidak ditemukan');
    }

    // update weight in bag item
    // issue delay get data from replication
    // TODO: change method update data weight bag ??
    if (bagDetail) {
      const totalWeightRealRounded = Number(
        payload.awbDetail.totalWeightRealRounded,
      );

      await RedisService.incrbyfloat(
        `package:combine:bagItemId:${payload.bagItemId}`,
        parseFloat(totalWeightRealRounded.toFixed(5)),
      );

      try {
        // console.log('DEBUG: GAB SORTIR : AWB :: ', payload.awbDetail.awbNumber);
        // #region sending background process
        CreateBagAwbScanHubQueueService.perform(
          bagDetail.bagId,
          bagDetail.bagItemId,
          payload.bagNumber,
          payload.awbItemId,
          payload.awbDetail.awbNumber,
          payload.podScanInHubId,
          payload.awbDetail.totalWeightRealRounded,
          authMeta.userId,
          permissonPayload.branchId,
          moment().toDate(),
        );
        // #endregion

        // TODO: need refactoring update total weight
        // await BagItem.update({
        //   bagItemId: bagDetail.bagItemId,
        // }, {
        //   weight: bagWeightFinalFloat,
        // });
        const getBagWeight = await RedisService.get(
          `package:combine:bagItemId:${payload.bagItemId}`,
        );

        bagDetail.weight = getBagWeight;
        return bagDetail;
      } catch (error) {
        console.error(error);
        throw new BadRequestException(
          'Problem Server, Coba beberapa saat lagi!',
        );
      }
    } else {
      throw new BadRequestException(
        `Bag Number ${payload.bagNumber}, tidak ditemukan`,
      );
    }
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

  private static async getAwbItem(
    awbNumber: string,
  ): Promise<AwbScanPackageDetailVm> {
    const qb = createQueryBuilder();
    qb.addSelect('t1.awb_item_id', 'awbItemId');
    qb.addSelect('t1.awb_number', 'awbNumber');
    qb.addSelect('t1.awb_status_id_last', 'awbStatusIdLast');
    qb.addSelect('t1.is_package_combined', 'isPackageCombined');

    qb.addSelect('t2.to_id', 'toId');
    qb.addSelect('t2.total_weight_real_rounded', 'totalWeightRealRounded');
    qb.addSelect('t2.consignee_name', 'consigneeName');
    qb.addSelect('t2.consignee_phone', 'consigneeNumber');
    qb.addSelect('t2.customer_account_id', 'customerAccountId');
    qb.addSelect('t2.pickup_merchant', 'pickupMerchant');
    qb.addSelect('t2.ref_reseller', 'refReseller');
    qb.addSelect('t2.consignee_address', 'consigneeAddress');

    qb.from('awb_item_attr', 't1');
    qb.innerJoin('awb', 't2', 't1.awb_id = t2.awb_id');
    qb.where('t1.awb_number = :awbNumber', { awbNumber });
    qb.andWhere('t1.is_deleted = false');

    const awbDetail = await qb.getRawOne();
    return awbDetail;
  }
}
