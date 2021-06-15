import { EntityManager, getConnection, In } from 'typeorm';

import { HttpStatus } from '@nestjs/common';
import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { Branch } from '../../../../shared/orm-entity/branch';
import { District } from '../../../../shared/orm-entity/district';
import { PodScanInHub } from '../../../../shared/orm-entity/pod-scan-in-hub';
import { Representative } from '../../../../shared/orm-entity/representative';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import {
  BagItemHistoryQueueService,
} from '../../../queue/services/bag-item-history-queue.service';
import { MachinePackageResponseVm } from '../../models/hub-gabungan.response.vm';
import moment = require('moment');
import { PackageMachinePayloadVm } from '../../models/hub-gabungan-mesin-payload.vm';
import { BranchSortir } from '../../../../shared/orm-entity/branch-sortir';
import { AwbService } from '../../../main/services/v1/awb.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { flatMap, chunk, sampleSize, chain } from 'lodash';
import _ from 'lodash';
import { DoPodDetailPostMetaQueueService } from '../../../../servers/queue/services/do-pod-detail-post-meta-queue.service';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { HubSummaryAwb } from '../../../../shared/orm-entity/hub-summary-awb';
import { PodScanInHubBag } from '../../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../../shared/orm-entity/pod-scan-in-hub-detail';

export class HubMachineService {
  constructor() { }

  //#region HELPERS

  public static async getBranch(branchId: number): Promise<Branch> {
    const cacheKey = `cache:sorting-machine:branch:${branchId}`;
    let data: Branch = await RedisService.get(cacheKey, true);
    if (data) { return data; }

    data = (await Branch.findOne({
      where: {
        branchId,
        isDeleted: false,
      },
    })) as any;

    if (data) {
      // cache 30 minutes
      RedisService.setex(cacheKey, data, 60 * 30, true).then();
      return data;
    }

    return null;
  }

  public static async getBranchSortir(branchId: number, chuteNumber: number): Promise<BranchSortir> {
    const cacheKey = `cache:sorting-machine:branch_sortir_chute:${branchId}/${chuteNumber}`;
    let data: BranchSortir = await RedisService.get(cacheKey, true);
    if (data) { return data; }

    data = (await BranchSortir.findOne({
      where: {
        branchId,
        noChute: chuteNumber,
        isDeleted: false,
      },
    })) as any;

    if (data) {
      // cache 30 minutes
      RedisService.setex(cacheKey, data, 60 * 30, true).then();
      return data;
    }

    return null;
  }

  public static async getDistrict(districtId: number): Promise<District> {
    const cacheKey = `cache:sorting-machine:district:${districtId}`;
    let data: District = await RedisService.get(cacheKey, true);
    if (data) { return data; }

    data = (await District.findOne({
      where: {
        districtId,
        isDeleted: false,
      },
    })) as any;

    if (data) {
      // cache 6 hours
      RedisService.setex(cacheKey, data, 60 * 60 * 6, true).then();
      return data;
    }

    return null;
  }

  public static async getRepresentative(representativeCode: string): Promise<Representative> {
    const cacheKey = `cache:sorting-machine:representative:${representativeCode}`;
    let data: Representative = await RedisService.get(cacheKey, true);
    if (data) { return data; }

    data = (await Representative.findOne({
      where: {
        representativeCode,
        isDeleted: false,
      },
    })) as any;

    if (data) {
      // cache 30 minutes
      RedisService.setex(cacheKey, data, 60 * 30, true).then();
      return data;
    }

    return null;
  }

  public static async getAwbs(awbNumbers: string[]): Promise<Awb[]> {
    // chunk to 20 records to avoid long query
    const chunks = chunk(awbNumbers, 20);
    const pResults = await Promise.all(chunks.map(x => {
      return Awb.find({
        where: { awbNumber: In(x), isDeleted: false },
        take: 1000,
      });
    }));

    const results = flatMap(pResults, (x) => x );
    return results;
  }

  public static async getAwbItemAttrs(awbNumbers: string[]): Promise<AwbItemAttr[]> {
    // chunk to 20 records to avoid long query
    const chunks = chunk(awbNumbers, 20);
    const pResults: AwbItemAttr[][] = await Promise.all(chunks.map(x => {
      return AwbService.validAwbNumbers(x);
    }));

    const results = flatMap(pResults, (x: AwbItemAttr[]) => x  );
    return results;
  }

  //#endregion

  static async processMachineBagging(
    payload: PackageMachinePayloadVm,
    cacheKey: string,
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

      PinoLoggerService.log(`ERROR MESIN SORTIR: ${message}`);
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

    const district = (branch.districtId)
      ? await this.getDistrict(branch.districtId)
      : null;

    const awbNumbers: string[] = chain(payload.reference_numbers)
      .groupBy(g => g)
      .reduce((result, value) => {
        result.push(value[0]);
        return result;
      }, []).value();

    const awbs = await this.getAwbs(awbNumbers);
    const awbItemAttrs = await this.getAwbItemAttrs(awbNumbers);

    let totalWeight = 0;
    for (const refNumber of awbNumbers) {
      // const awbItemAttr = await AwbService.validAwbNumber(refNumber);
      // // NOTE: check destination awb with awb.toId
      // const awb = await Awb.findOne({
      //   where: { awbNumber: refNumber, isDeleted: false },
      // });

      const awb = awbs.find(x => x.awbNumber === refNumber);
      const awbItemAttr = awbItemAttrs.find(x => x.awbNumber === refNumber);

      // validate valid awb numbers in the bag
      if (!awb || !awbItemAttr) {
        return generateErrorResult(`No resi tidak ditemukan / tidak valid`);
      }

      // if (awbItemAttr.isPackageCombined === true) {
      //   return generateErrorResult(`Nomor resi sudah digabung sortir`);
      // }

      totalWeight += Number(awb.totalWeightRealRounded);
    }

    // Process Create GS
    const redlockKey = `redlock:createMachineGS:${payload.sorting_branch_id}-${payload.chute_number}`;
    const redlock = await RedisService.redlock(redlockKey, 10);

    if (!redlock) {
      return generateErrorResult(`Nomor resi sedang di PROSESS !`);
    }

    const mCurrentTime = moment.utc().add(7, 'hours');
    const currentDateStr = mCurrentTime.format('YYYY-MM-DD');
    const currentTimeStr = mCurrentTime.format('YYYY-MM-DD HH:mm:ss');

    try {
      const trxResults = await getConnection().transaction(async transactionManager => {
        const createBagResult = await this.createBag(transactionManager, branch, branchSortir, district, payload.tag_seal_number, totalWeight, mCurrentTime);

        // export interface CreateBagFirstScanHubQueueServiceBatch {
        //   bagId: number;
        //   bagItemId: number;
        //   bagNumber: string;
        //   podScanInHubId: string;
        //   userId: number;
        //   branchId: number;
        //   timestamp: Date;
        //   awbs: CreateBagFirstScanHubQueueServiceBatchAwb[];
        // }

        // export interface CreateBagFirstScanHubQueueServiceBatchAwb {
        //   awbItemId: number;
        //   awbNumber: string;
        //   awbItemAttr?: AwbItemAttr;
        //   totalWeight: number;
        // }

        const bagAwbBatch: CreateBagFirstScanHubQueueServiceBatch = {
            bagId: createBagResult.bag.bagId,
          bagItemId: createBagResult.bagItem.bagItemId,
          bagNumber: createBagResult.bag.bagNumber,
          podScanInHubId: createBagResult.podScanInHub.podScanInHubId,
          userId: 1,
          branchId: branch.branchId,
          timestamp: currentTimeStr,
          awbs: [],
        };

        for (const awbNumber of awbNumbers) {
          const awb = awbs.find(x => x.awbNumber === awbNumber);
          const awbItemAttr = awbItemAttrs.find(x => x.awbNumber === awbNumber);

          bagAwbBatch.awbs.push({
            awbItemId: awbItemAttr.awbItemId,
          awbNumber: awb.awbNumber,
          awbItemAttr,
          totalWeight: awb.totalWeightRealRounded,
          });
        }

        await this.performDirect(transactionManager, bagAwbBatch);

        return createBagResult;
      });

      const result = new MachinePackageResponseVm();

      result.statusCode = HttpStatus.OK;
      result.message = `Success Upload`;
      result.data = [{
        state: 0,
        no_gabung_sortir: trxResults.fullBagNumber,
      }];

      PinoLoggerService.log(result);

      // cache for 3 Hours
      RedisService.setex(cacheKey, result, 60 * 60 * 3, true).then();

      // create background process
      try {
        // sending background process
        // NOTE: background job for insert bag item history

        BagItemHistoryQueueService.addData(trxResults.bagItem.bagItemId, 500, branch.branchId, 1);
        BagItemHistoryQueueService.addData(trxResults.bagItem.bagItemId, 3000, branch.branchId, 1);
      } catch (error) {
        console.log(error);
        PinoLoggerService.log(error);
      }

      return result;
    } catch (error) {
      PinoLoggerService.log(`ERROR MESIN SORTIR CATCH: ${error.message }`);
      PinoLoggerService.log(error);
      throw error;
    } finally {
      // release lock
      RedisService.del(redlockKey).then();
    }
  }

  private static async performDirect(
    transactionManager: EntityManager,
    batchData: CreateBagFirstScanHubQueueServiceBatch,
  ) {
    const dateNow = moment().toDate();

    const awbNumbers = batchData.awbs.filter(x => x.awbNumber).map(x => x.awbNumber);
    const awbItemIds = batchData.awbs.filter(x => x.awbItemId).map(x => x.awbItemId);
    const awbItemAttrIds = batchData.awbs.filter(x => x.awbItemAttr).map(x => x.awbItemAttr.awbItemAttrId);
    

    const bagItemAwbSaveDatas = batchData.awbs.filter(x => x.awbItemAttr).map(x => {
      return BagItemAwb.create({
        bagItemId: batchData.bagItemId,
        awbNumber: x.awbNumber,
        weight: x.totalWeight,
        awbItemId: x.awbItemId,
        userIdCreated: batchData.userId,
        createdTime: batchData.timestamp,
        updatedTime: batchData.timestamp,
        userIdUpdated: batchData.userId,
        isSortir: true,
      });
    });

    const podScanInHubDetailSaveDatas = batchData.awbs.filter(x => x.awbItemAttr).map(x => {
      return PodScanInHubDetail.create({
        podScanInHubId: batchData.podScanInHubId,
        bagId: batchData.bagId,
        bagItemId: batchData.bagItemId,
        bagNumber: batchData.bagNumber,
        awbItemId: x.awbItemId,
        awbId: x.awbItemAttr.awbId,
        awbNumber: x.awbNumber,
        userIdCreated: batchData.userId,
        userIdUpdated: batchData.userId,
        createdTime: batchData.timestamp,
        updatedTime: batchData.timestamp,
      });
    });

    // BEGIN INSERT

    // insert into pod scan in hub bag
    const podScanInHubBagSaveData = PodScanInHubBag.create({
      podScanInHubId: batchData.podScanInHubId,
      branchId: batchData.branchId,
      bagId: batchData.bagId,
      bagNumber: batchData.bagNumber,
      bagItemId: batchData.bagItemId,
      totalAwbItem: bagItemAwbSaveDatas.length,
      totalAwbScan: bagItemAwbSaveDatas.length,
      userIdCreated: batchData.userId,
      userIdUpdated: batchData.userId,
      createdTime: batchData.timestamp,
      updatedTime: batchData.timestamp,
    });

    await transactionManager.insert(PodScanInHubBag, podScanInHubBagSaveData);

    // INSERT INTO TABLE BAG ITEM AWB
    await transactionManager.insert(BagItemAwb, bagItemAwbSaveDatas);

    // insert into pod scan in hub detail
    await transactionManager.insert(PodScanInHubDetail, podScanInHubDetailSaveDatas);        

    // update awb item attr
    const chunkAwbItemAttrs = chunk(awbItemAttrIds, 30);
    for (const c of chunkAwbItemAttrs) {
      await transactionManager.update(AwbItemAttr,
        { awbItemAttrId: In(c) },
        {
          bagItemIdLast: batchData.bagItemId,
          updatedTime: batchData.timestamp,
          isPackageCombined: true,
          awbStatusIdLast: 4500,
          userIdLast: batchData.userId,
        },
      );    
    }
    
    // UPDATE STATUS IN HUB IN AWB SUMMARY    
    const chunkAwbNumbers = chunk(awbNumbers, 30);
    for (const c of chunkAwbNumbers) {
      await transactionManager.update(
        HubSummaryAwb,
        { awbNumber: In(c) },
        {
          scanDateInHub: dateNow,
          inHub: true,
          bagItemIdIn: batchData.bagItemId,
          bagIdIn: batchData.bagId,
          userIdUpdated: batchData.userId,
          updatedTime: batchData.timestamp,
        },
      );
    }    

    for (const awbItemId of awbItemIds) {
      // update status awb
      DoPodDetailPostMetaQueueService.createJobByAwbFilter(
        awbItemId,
        batchData.branchId,
        batchData.userId,
      );
    }    
  }

  // private static async machineAwbScan(
  //   transactionManager,
  //   paramAwbNumber: string,
  //   paramAwb: Awb,
  //   paramAwbItemAttr: AwbItemAttr,
  //   paramBranch: Branch,
  //   paramBagItemId: number,
  //   paramBagNumber: string,
  //   paramPodScanInHubId: string,
  //   paramBranchIdLastmile: number,
  //   paramSealNumber: string
  // ): Promise<any> {
  //   const result = new Object();
  //   const troubleDesc: String[] = [];

  //   let branchId = paramBranch?.branchId;
  //   let bagWeight: number = null;
  //   let bagSeq: number = null;
  //   let districtDetail: District = null;
  //   let branchName = null;
  //   let branchCode = null;

  //   let bagItemId: number = paramBagItemId;
  //   let bagNumber: string = paramBagNumber;
  //   let podScanInHubId: string = paramPodScanInHubId;

  //   let isTrouble: boolean = false;
  //   let isAllow: boolean = true;
  //   let districtId = null;

  //   if (paramAwbItemAttr.awbStatusIdLast !== 2600) {
  //     isTrouble = true;
  //     troubleDesc.push('Awb status tidak sesuai');
  //   }

  //   if (paramAwb.toId) {
  //     // NOTE: Validate branch
  //     if (!paramBranch) {
  //       isAllow = false;
  //       troubleDesc.push('Gerai tidak ditemukan');
  //     } else {
  //       branchCode = paramBranch.branchCode;
  //       branchName = paramBranch.branchName;
  //       districtId = paramBranch.districtId;
  //     }
  //   } else {
  //     isTrouble = true;
  //     troubleDesc.push('Tidak ada tujuan');
  //   }

  //   if (isAllow) {
  //     // use data district from branch
  //     if (paramBranch && districtId) {
  //       districtDetail = await this.getDistrict(districtId);
  //     }

  //     // construct data detail
  //     // NOTE: change totalWeightFinalRounded : awb.totalWeightRealRounded
  //     const detail = {
  //       awbNumber: paramAwb.awbNumber,
  //       totalWeightRealRounded: paramAwb.totalWeightRealRounded,
  //       totalWeightFinalRounded: paramAwb.totalWeightRealRounded,
  //       consigneeName: paramAwb.consigneeName,
  //       consigneeNumber: paramAwb.consigneeNumber,
  //       awbItemId: paramAwbItemAttr.awbItemId,
  //       customerId: paramAwb.customerAccountId,
  //       pickupMerchant: paramAwb.pickupMerchant,
  //       shipperName: paramAwb.refReseller,
  //       consigneeAddress: paramAwb.consigneeAddress,
  //       isTrouble,
  //     };

  //     // NOTE: critical path
  //     // get data bag / create new data bag
  //     if (!paramBagNumber) {
  //       // Generate Bag Number
  //       const genBagNumber = await this.createMachineBagNumber(transactionManager, branchId, paramAwbItemAttr.awbItemId, districtDetail, paramBranch, paramAwb, paramBranchIdLastmile, paramSealNumber);
  //       bagNumber = genBagNumber.fullBagNumber;
  //       podScanInHubId = genBagNumber.podScanInHubId;
  //       bagItemId = genBagNumber.bagItemId;
  //       bagWeight = genBagNumber.weight;
  //       bagSeq = genBagNumber.bagSeq;
  //     } else {
  //       const bagItem = await this.insertMachineAwb(transactionManager, paramBagNumber, paramAwb, podScanInHubId, paramAwbItemAttr.awbItemId, branchId);
  //       if (bagItem) {
  //         bagWeight = bagItem.weight;
  //         bagSeq = bagItem.bagSeq;
  //       }
  //     }

  //     // construct response data
  //     assign(result, {
  //       bagNumber,
  //       isAllow,
  //       podScanInHubId,
  //       bagItemId,
  //       branchId,
  //       data: detail,
  //       branchName,
  //       branchCode,
  //       bagWeight,
  //       bagSeq,
  //     });

  //   } else {
  //     assign(result, {
  //       isAllow,
  //       bagNumber,
  //       podScanInHubId,
  //       bagItemId,
  //       data: [],
  //       branchId,
  //       branchName,
  //       branchCode,
  //       bagWeight,
  //       bagSeq,
  //     });
  //   }

  //   return result;
  // }

  private static async createBag(transactionManager, branch: Branch, branchSortir: BranchSortir, district: District, sealNumber: string, totalWeight: number, mCurrentTime: moment.Moment): Promise<CreateBagResult> {
    // const result = new CreateBagNumberResponseVM();
    // const branchId = branchId;

    const currentDateStr = mCurrentTime.format('YYYY-MM-DD');
    const currentTimeStr = mCurrentTime.format('YYYY-MM-DD HH:mm:ss');

    // generate bag number
    const randomBagNumber = 'Z' + sampleSize('012345678900123456789001234567890ABCDEFGHIJKLMNOPQRSTUVWXYZZYWVUTSRQPONMLKJIHGFEDCBA', 6).join('');
    const refBranchCode = branch ? branch.branchCode : '';
    const representativeCode = district ? district.districtCode.substring(0, 3) : null;
    const representative = await this.getRepresentative(representativeCode);

    const bagQueryData = Bag.create({
      bagNumber: randomBagNumber,
      branchIdTo: branchSortir.branchIdLastmile,
      refRepresentativeCode: representative ? representative.representativeCode : null,
      representativeIdTo: representative ? representative.representativeId : null,
      refBranchCode,
      bagType: 'branch',
      branchId: branch.branchId,
      bagDate: currentDateStr,
      bagDateReal: currentTimeStr,
      createdTime: currentTimeStr,
      updatedTime: currentTimeStr,
      userIdCreated: 1,
      userIdUpdated: 1,
      isSortir: true,
      isManual: false,
      sealNumber,
    });

    const bag = await transactionManager.getRepository(Bag).save(bagQueryData);
    const bagId = bag.bagId;
    const sequence = 1;

    const bagSeq: string = sequence.toString().padStart(3, '0');
    
    // INSERT INTO TABLE BAG ITEM
    const bagItemQueryData = BagItem.create({
      bagId: bagId,
      bagSeq: sequence,
      branchIdLast: branch.branchId,
      bagItemStatusIdLast: 3000,
      userIdCreated: 1,
      weight: totalWeight,
      createdTime: currentTimeStr,
      updatedTime: currentTimeStr,
      userIdUpdated: 1,
      isSortir: true,
    });

    const bagItem = await transactionManager.getRepository(BagItem).save(bagItemQueryData);

    // insert into pod scan in hub
    // 100 = inprogress, 200 = done
    const podScanInHubQueryData = transactionManager.getRepository(PodScanInHub).create({
      branchId: branch.branchId,
      scanInType: 'BAG',
      transactionStatusId: 200,
      userIdCreated: 1,
      createdTime: currentTimeStr,
      updatedTime: currentTimeStr,
      userIdUpdated: 1,
    });

    const podScanInHub = await transactionManager.getRepository(PodScanInHub).save(podScanInHubQueryData);

    // #region send to background process

    // NOTE: background job for insert bag item history
    // BagItemHistoryQueueService.addData(
    //   bagItem.bagItemId,
    //   500,
    //   branchId,
    //   1,
    // );

    // BagItemHistoryQueueService.addData(
    //   bagItem.bagItemId,
    //   3000,
    //   branchId,
    //   1,
    // );

    // CreateBagFirstScanHubQueueService.perform(
    //   bagId,
    //   bagItem.bagItemId,
    //   randomBagNumber,
    //   paramAwbItemId,
    //   awbDetail.awbNumber,
    //   podScanInHub.podScanInHubId,
    //   parseFloat(awbDetail.totalWeightRealRounded),
    //   1,
    //   branchId,
    //   moment().toDate(),
    // );
    // #endregion send to background process

    // contruct data response
    // result.bagItemId = bagItem.bagItemId;
    // result.podScanInHubId = podScanInHub.podScanInHubId;
    // result.bagNumber = `${randomBagNumber}${bagSeq}`;
    // result.weight = bagItem.weight;
    // result.bagSeq = sequence;
    // throw new Error('Coba Gagal 1');
    return {
      randomBagNumber,
      fullBagNumber: `${randomBagNumber}${bagSeq}`,
      bagSeq: sequence,
      bag,
      bagItem,
      podScanInHub,
    };
  }

  // private static async insertMachineAwb(transactionManager, branch: Branch, bag: Bag, bagItem: BagItem, podScanInHub: podScanInHub, awbNumbers: string[], awbs: Awb[], awbItemAttrs: AwbItemAttr[]): Promise<BagItem> {
  //   const bagDetail = await BagService.validBagNumber(paramBagNumber);

  //   if (!bagDetail) {
  //     throw new BadRequestException('No gabungan sortir tidak ditemukan');
  //   }

  //   // update weight in bag item
  //   // delay get data from replication
  //   // TODO: change method update data weight bag ??
  //   const bagItem = await BagItem.findOne({
  //     where: { bagItemId: bagDetail.bagItemId },
  //   });
  //   if (bagItem) {
  //     const bagWeight = Number(bagItem.weight);
  //     const totalWeightRealRounded = Number(paramAwbDetail.totalWeightRealRounded);
  //     const bagWeightFinalFloat = parseFloat((bagWeight + totalWeightRealRounded).toFixed(5));
  //     PinoLoggerService.log('#### bagWeightFinalFloat :: ', bagWeightFinalFloat);

  //     await transactionManager.getRepository(BagItem).update({
  //       bagItemId: bagDetail.bagItemId,
  //     }, {
  //       weight: bagWeightFinalFloat,
  //     });
  //     bagItem.weight = bagWeightFinalFloat;
  //     // await bagItem.save();

  //     // //#region sending background process
  //     CreateBagAwbScanHubQueueService.perform(
  //       bagDetail.bagId,
  //       bagDetail.bagItemId,
  //       bagDetail.bag.bagNumber,
  //       paramAwbItemId,
  //       paramAwbDetail.awbNumber,
  //       paramPodScanInHubId,
  //       paramAwbDetail.totalWeightRealRounded,
  //       1,
  //       paramBranchId,
  //       moment().toDate(),
  //     );
  //     // //#endregion
  //   } else {
  //     // DEBUG: TypeError: Cannot read property 'weight' of undefined
  //     console.error('######## BAGITEM NOT FOUND :: BAG DETAIL :: ', bagDetail);
  //     // console.error('######## BAGITEM NOT FOUND :: PAYLOAD :: ', payload);
  //   }
  //   return bagItem;
  // }
}

interface CreateBagResult {
  randomBagNumber: string;
  fullBagNumber: string;
  bagSeq: number;
  bag: Bag;
  bagItem: BagItem;
  podScanInHub: PodScanInHub;
}

interface CreateBagFirstScanHubQueueServiceBatch {
  bagId: number;
  bagItemId: number;
  bagNumber: string;
  podScanInHubId: string;  
  userId: number;
  branchId: number;
  timestamp: Date | string;
  awbs: CreateBagFirstScanHubQueueServiceBatchAwb[];  
}

interface CreateBagFirstScanHubQueueServiceBatchAwb {
  awbItemId: number;
  awbNumber: string;
  awbItemAttr?: AwbItemAttr;
  totalWeight: number;
}
