// //#region
import _, { assign, join, sampleSize } from 'lodash';
import { createQueryBuilder, getConnection, getManager, In } from 'typeorm';

import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { Branch } from '../../../../shared/orm-entity/branch';
import { District } from '../../../../shared/orm-entity/district';
import { PodScanInHub } from '../../../../shared/orm-entity/pod-scan-in-hub';
import { PodScanInHubBag } from '../../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../../shared/orm-entity/pod-scan-in-hub-detail';
import { Representative } from '../../../../shared/orm-entity/representative';
import { AuthService } from '../../../../shared/services/auth.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import {
  BagItemHistoryQueueService,
} from '../../../queue/services/bag-item-history-queue.service';
import {
  CreateBagAwbScanHubQueueService,
} from '../../../queue/services/create-bag-awb-scan-hub-queue.service';
import {
  CreateBagFirstScanHubQueueService,
} from '../../../queue/services/create-bag-first-scan-hub-queue.service';
import { MachinePackageResponseVm, PackageAwbResponseVm } from '../../models/hub-gabungan.response.vm';
import moment = require('moment');
import { PackageMachinePayloadVm } from '../../models/hub-gabungan-mesin-payload.vm';
import { BranchSortir } from '../../../../shared/orm-entity/branch-sortir';
import { AwbService } from '../../../main/services/v1/awb.service';
import { BagService } from '../../../main/services/v1/bag.service';
import { CreateBagNumberResponseVM } from '../../../main/models/package-payload.vm';
import { RedisService } from '../../../../shared/services/redis.service';
// //#endregion

export class HubMachineService {
  constructor() { }

  public static async getBranch(branchId: number): Promise<BranchCacheData> {
    const cacheKey = `cache:sortir:branch:${branchId}`;
    let data: BranchCacheData = await RedisService.get(cacheKey, true);
    if (data) return data;

    data = await Branch.findOne({
      select: ['branchId'],
      where: {
        branchId: branchId,
        isDeleted: false,
      },
    });

    if (data) {
      // cache 30 minutes
      RedisService.setex(cacheKey, data, 60 * 30, true).then();
      return data;
    }

    return null;
  }

  public static async getBranchSortir(branchId: number, chuteNumber: number): Promise<BranchSortirCacheData> {
    const cacheKey = `cache:sortir:branch_sortir_chute:${branchId}/${chuteNumber}`;
    let data: BranchSortirCacheData = await RedisService.get(cacheKey, true);
    if (data) return data;

    data = await BranchSortir.findOne({
      select: ['branchSortirId', 'branchIdLastmile', 'noChute'],
      where: {
        branchId: branchId,
        noChute: chuteNumber,
        isDeleted: false,
      },
    });

    if (data) {
      // cache 30 minutes
      RedisService.setex(cacheKey, data, 60 * 30, true).then();
      return data;
    }

    return null;

  }

  public static async getAwbs(awbNumbers: string[]): Promise<Awb[]> {
    // chunk to 20 records to avoid long query
    const chunks = _.chunk(awbNumbers, 20);
    const pResults = await Promise.all(chunks.map(x => {
      return Awb.find({
        where: { awbNumber: In(x), isDeleted: false },
        take: 1000,
      });
    }));

    const results = _.flatMap(pResults, x => x ?? []);
    return results;
  }

  public static async getAwbItemAttr(awbNumbers: string[]): Promise<AwbItemAttr[]> {
    // chunk to 20 records to avoid long query
    const chunks = _.chunk(awbNumbers, 20);
    const pResults = await Promise.all(chunks.map(x => {
      return AwbService.validAwbNumbers(x);
    }));

    const results = _.flatMap(pResults, x => x ?? []);
    return results;
  }

  static async awbPackage(
    payload: PackageMachinePayloadVm,
  ): Promise<MachinePackageResponseVm> {
    console.log('payload data', payload);

    const generateErrorResult = (message: string): MachinePackageResponseVm => {
      const errResult = new MachinePackageResponseVm();
      errResult.statusCode = HttpStatus.BAD_REQUEST;
      errResult.message = message;
      errResult.data = [{
        state: 1,
        no_gabung_sortir: null,
      }];

      PinoLoggerService.log(errResult);
      return errResult;
    };

    if (!payload.sorting_branch_id) {
      return generateErrorResult(`Sorting Branch ID Null`);
    }

    const branchResults = await Promise.all([
      this.getBranch(payload.sorting_branch_id),
      this.getBranchSortir(payload.sorting_branch_id, (payload.chute_number) ? parseInt(payload.chute_number) : null),
    ]);

    const branch = branchResults[0];
    const branchSortir = branchResults[1];

    if (!branch) {
      return generateErrorResult(`Branch not found`);
    }

    const awbNumbers: string[] = _(payload.reference_numbers)
      .groupBy(g => g)
      .reduce((result, value) => {
        result.push(value[0]);
        return result;
      }, []);

    const awbs = await this.getAwbs(awbNumbers);
    const awbItemAttrs = await this.getAwbItemAttr(awbNumbers);

    // validate valid awb numbers in the bag
    for (const refNumber of payload.reference_numbers) {
      // const awbItemAttr = await AwbService.validAwbNumber(refNumber);
      // // NOTE: check destination awb with awb.toId
      // const awb = await Awb.findOne({
      //   where: { awbNumber: refNumber, isDeleted: false },
      // });

      const awb = awbs.find(x => x.awbNumber === refNumber);
      const awbItemAttr = awbItemAttrs.find(x => x.awbNumber === refNumber);

      if (!awb || !awbItemAttr) {
        return generateErrorResult(`No resi tidak ditemukan / tidak valid`);
      }

      if (awbItemAttr.isPackageCombined === true) {
        return generateErrorResult(`Nomor resi sudah digabung sortir`);
      }
    }

    // Process Create GS
    const redlockKey = `redlock:createMachineGS:${payload.sorting_branch_id}-${payload.chute_number}`;
    const redlock = await RedisService.redlock(redlockKey, 10);

    if (!redlock) {
      return generateErrorResult(`Nomor resi sedang di PROSESS !`);
    }

    try {
      return await getConnection().transaction(async transactionManager => {
        let paramBagItemId = null;
        let paramBagNumber = null;
        let paramPodScanInHubId = null;
        let scanResultMachine;

        for (const refNumber of payload.reference_numbers) {
          scanResultMachine = await this.machineAwbScan(transactionManager, refNumber, branch.branchId, paramBagItemId, paramBagNumber, paramPodScanInHubId, branchSortir.branchIdLastmile, payload.tag_seal_number);
          if (scanResultMachine) {
            paramBagItemId = scanResultMachine.bagItemId;
            paramBagNumber = scanResultMachine.bagNumber;
            paramPodScanInHubId = scanResultMachine.podScanInHubId;
          }
          // if (i == 2) {
          //   throw new BadRequestException('Coba Gagal 1');
          // }
        }

        const result = new MachinePackageResponseVm();

        if (scanResultMachine) {
          // Status DONE 200 untuk PODSCANINHUB
          await PodScanInHub.update(
            { podScanInHubId: paramPodScanInHubId },
            {
              transactionStatusId: 200,
              updatedTime: moment().toDate(),
              userIdUpdated: 1,
            },
          );
          const data = [];
          data.push({
            state: 0,
            no_gabung_sortir: scanResultMachine.bagNumber,
          });
          result.statusCode = HttpStatus.OK;
          result.message = `Success Upload`;
          result.data = data;
          PinoLoggerService.log(result);
        }

        return result;
      });
    } catch (error) {
      throw error;
    } finally {
      // release lock
      RedisService.del(redlockKey).then();
    }
  }

  private static async machineAwbScan(transactionManager, paramawbNumber: string, paramBranchId: number, paramBagItemId: number, paramBagNumber: string, paramPodScanInHubId: string, paramBranchIdLastmile: number, paramSealNumber: string): Promise<any> {
    const awbNumber = paramawbNumber;
    const branchId: number = paramBranchId;
    const result = new Object();
    const troubleDesc: String[] = [];

    let bagWeight: number = null;
    let bagSeq: number = null;
    let branch: Branch = null;
    let districtDetail: District = null;
    let branchName = null;
    let branchCode = null;

    let bagItemId: number = paramBagItemId;
    let bagNumber: string = paramBagNumber;
    let podScanInHubId: string = paramPodScanInHubId;

    let isTrouble: boolean = false;
    let isAllow: boolean = true;
    let districtId = null;

    const awbItemAttr = await AwbService.validAwbNumber(awbNumber);
    // NOTE: check destination awb with awb.toId
    const awb = await Awb.findOne({
      where: { awbNumber, isDeleted: false },
    });
    // check awb status
    if (awbItemAttr.awbStatusIdLast !== 2600) {
      isTrouble = true;
      troubleDesc.push('Awb status tidak sesuai');
    }

    if (awb.toId) {
      // use cache data
      branch = await transactionManager.getRepository(Branch).findOne({ cache: true, where: { branchId } });
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
      // use data district from branch
      if (branch && districtId) {
        districtDetail = await transactionManager.getRepository(District).findOne({
          cache: true,
          where: { districtId, isDeleted: false },
        });
      }

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

      // NOTE: critical path
      // get data bag / create new data bag
      if (paramBagNumber) {
        const bagItem = await this.MachineInsertDetailAwb(transactionManager, paramBagNumber, awb, podScanInHubId, awbItemAttr.awbItemId, paramBranchId);
        if (bagItem) {
          bagWeight = bagItem.weight;
          bagSeq = bagItem.bagSeq;
        }
      } else {
        // Generate Bag Number
        const genBagNumber = await this.MachineCreateBagNumber(transactionManager, paramBranchId, awbItemAttr.awbItemId, districtDetail, branch, awb, paramBranchIdLastmile, paramSealNumber);
        bagNumber = genBagNumber.bagNumber;
        podScanInHubId = genBagNumber.podScanInHubId;
        bagItemId = genBagNumber.bagItemId;
        bagWeight = genBagNumber.weight;
        bagSeq = genBagNumber.bagSeq;
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

  private static async MachineInsertDetailAwb(transactionManager, paramBagNumber: string, paramAwbDetail, paramPodScanInHubId: string, paramAwbItemId: number, paramBranchId: number): Promise<BagItem> {
    const bagDetail = await BagService.validBagNumber(paramBagNumber);

    if (!bagDetail) {
      throw new BadRequestException('No gabungan sortir tidak ditemukan');
    }

    // update weight in bag item
    // delay get data from replication
    // TODO: change method update data weight bag ??
    const bagItem = await BagItem.findOne({
      where: { bagItemId: bagDetail.bagItemId },
    });
    if (bagItem) {
      const bagWeight = Number(bagItem.weight);
      const totalWeightRealRounded = Number(paramAwbDetail.totalWeightRealRounded);
      const bagWeightFinalFloat = parseFloat((bagWeight + totalWeightRealRounded).toFixed(5));
      PinoLoggerService.log('#### bagWeightFinalFloat :: ', bagWeightFinalFloat);

      await transactionManager.getRepository(BagItem).update({
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
        paramAwbItemId,
        paramAwbDetail.awbNumber,
        paramPodScanInHubId,
        paramAwbDetail.totalWeightRealRounded,
        1,
        paramBranchId,
        moment().toDate(),
      );
      // //#endregion
    } else {
      // DEBUG: TypeError: Cannot read property 'weight' of undefined
      console.error('######## BAGITEM NOT FOUND :: BAG DETAIL :: ', bagDetail);
      // console.error('######## BAGITEM NOT FOUND :: PAYLOAD :: ', payload);
    }
    return bagItem;
  }

  private static async MachineCreateBagNumber(transactionManager, paramBranchId: number, paramAwbItemId, districtDetail, branchDetail, paramAwbDetail, paramBranchIdLastmile, paramSealNumber): Promise<CreateBagNumberResponseVM> {
    const result = new CreateBagNumberResponseVM();
    const branchId = paramBranchId;

    let bagId: number;
    let sequence: number;
    let randomBagNumber;

    if (!paramAwbItemId || paramAwbItemId.length < 1) {
      throw new BadRequestException('Tidak ada nomor resi');
    }

    // generate bag number
    randomBagNumber =
      'MS' + sampleSize('012345678900123456789001234567890', 5).join('');
    const representativeCode = districtDetail
      ? districtDetail.districtCode.substring(0, 3)
      : null;
    const representative = await Representative.findOne({
      where: { isDeleted: false, representativeCode },
    });
    const refBranchCode = branchDetail ? branchDetail.branchCode : '';
    const bagDetail = Bag.create({
      bagNumber: randomBagNumber,
      branchIdTo: paramBranchIdLastmile,
      refRepresentativeCode: representative
        ? representative.representativeCode
        : null,
      representativeIdTo: representative
        ? representative.representativeId
        : null,
      refBranchCode,
      bagType: 'branch',
      branchId: branchId,
      bagDate: moment().format('YYYY-MM-DD'),
      bagDateReal: moment().toDate(),
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdCreated: 1,
      userIdUpdated: 1,
      isSortir: true,
      isManual: false,
      sealNumber: paramSealNumber,
    });

    const bag = await transactionManager.getRepository(Bag).save(bagDetail);
    bagId = bag.bagId;
    sequence = 1;
    assign(result, { bagNumber: randomBagNumber });
    const bagSeq: string = sequence.toString().padStart(3, '0');
    const awbDetail = paramAwbDetail;

    // INSERT INTO TABLE BAG ITEM
    const bagItemDetail = BagItem.create({
      bagId,
      bagSeq: sequence,
      branchIdLast: branchId,
      bagItemStatusIdLast: 3000,
      userIdCreated: 1,
      weight: awbDetail.totalWeightRealRounded,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: 1,
      isSortir: true,
    });
    const bagItem = await transactionManager.getRepository(BagItem).save(bagItemDetail);

    // NOTE: background job for insert bag item history
    BagItemHistoryQueueService.addData(
      bagItem.bagItemId,
      500,
      branchId,
      1,
    );

    BagItemHistoryQueueService.addData(
      bagItem.bagItemId,
      3000,
      branchId,
      1,
    );

    // insert into pod scan in hub
    // 100 = inprogress, 200 = done
    const podScanInHubData = transactionManager.getRepository(PodScanInHub).create({
      branchId: branchId,
      scanInType: 'BAG',
      transactionStatusId: 100,
      userIdCreated: 1,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: 1,
    });
    const podScanInHub = await transactionManager.getRepository(PodScanInHub).save(podScanInHubData);

    // #region send to background process
    CreateBagFirstScanHubQueueService.perform(
      bagId,
      bagItem.bagItemId,
      randomBagNumber,
      paramAwbItemId,
      awbDetail.awbNumber,
      podScanInHub.podScanInHubId,
      parseFloat(awbDetail.totalWeightRealRounded),
      1,
      branchId,
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

}

interface BranchCacheData {
  branchId: number;
}

interface BranchSortirCacheData {
  branchSortirId: number;
  branchIdLastmile: number;
  noChute: number;
}

interface AwbItemAttrData {
  awbItemId: number;
  awbNumber: string;
  isPackageCombined: boolean;
  awbStatusIdLast: number | null;
}