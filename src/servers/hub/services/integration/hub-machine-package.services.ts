import {createQueryBuilder, EntityManager, getConnection, In} from 'typeorm';

import { HttpStatus } from '@nestjs/common';
import { Awb } from '../../../../shared/orm-entity/awb';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { Branch } from '../../../../shared/orm-entity/branch';
import { District } from '../../../../shared/orm-entity/district';
import { PodScanInHub } from '../../../../shared/orm-entity/pod-scan-in-hub';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import {
  BagItemHistoryQueueService,
} from '../../../queue/services/bag-item-history-queue.service';
import { MachinePackageResponseVm } from '../../models/hub-gabungan.response.vm';
import moment = require('moment');
import { BranchSortir } from '../../../../shared/orm-entity/branch-sortir';
import { AwbService } from '../../../main/services/v1/awb.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { flatMap, chunk, sampleSize, chain, result } from 'lodash';
// import { DoPodDetailPostMetaQueueService } from '../../../../servers/queue/services/do-pod-detail-post-meta-queue.service';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
// import { HubSummaryAwb } from '../../../../shared/orm-entity/hub-summary-awb';
import { PodScanInHubBag } from '../../../../shared/orm-entity/pod-scan-in-hub-bag';
import { PodScanInHubDetail } from '../../../../shared/orm-entity/pod-scan-in-hub-detail';
import { DoPodDetailPostMetaInQueueService } from '../../../../servers/queue/services/do-pod-detail-post-meta-in-queue.service';
import { UpsertHubSummaryBagSortirQueueService } from '../../../queue/services/upsert-hub-summary-bag-sortir-queue.service';
import { TempStt } from '../../../../shared/orm-entity/temp-stt';
import { UpdateBranchSortirLogSummaryQueueService } from '../../../queue/services/update-branch-sortir-log-summary-queue.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import {BagNumberService} from "../../../../shared/services/bag-number.service";

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
        isDeleted : false,
        isActive : true,
      },
    })) as any;

    if (data) {
      // cache 30 minutes
      // @ts-ignore
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
      // @ts-ignore
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
      // @ts-ignore
      RedisService.setex(cacheKey, data, 60 * 60 * 6, true).then();
      return data;
    }

    return null;
  }

  public static async getRepresentative(branchId: number): Promise<any> {
    const cacheKey = `cache:sorting-machine:representative:${branchId}`;
    let data = await RedisService.get(cacheKey, true);
    if (data) { return data; }

    const qb = createQueryBuilder();
    qb.addSelect('r.representative_code', 'representativeCode');
    qb.addSelect('r.representative_id', 'representativeId');
    qb.from('representative', 'r');
    qb.innerJoin(
        'branch',
        'b',
        'r.representative_id = b.representative_id AND r.is_deleted = false',
    );
    qb.where('b.branch_id = :branchId', { branchId });
    data = (await qb.getRawOne()) as any;

    if (data) {
      // cache 30 minutes
      // @ts-ignore
      RedisService.setex(cacheKey, data, 60 * 60 * 6, true).then();
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

    const results = flatMap(pResults, (x) => x);
    return results;
  }

  public static async getTempStts(awbNumbers: string[]): Promise<TempStt[]> {
    // chunk to 20 records to avoid long query
    const chunks = chunk(awbNumbers, 20);
    const pResults = await Promise.all(chunks.map(x => {
      return TempStt.find({
        where: { nostt: In(x), isDeleted: false },
        take: 1000,
      });
    }));

    const results = flatMap(pResults, (x) => x);
    return results;
  }

  public static async getAwbItemAttrs(awbNumbers: string[]): Promise<AwbItemAttr[]> {
    // chunk to 20 records to avoid long query
    const chunks = chunk(awbNumbers, 20);
    const pResults: AwbItemAttr[][] = await Promise.all(chunks.map(x => {
      return AwbService.validAwbNumbers(x);
    }));

    const results = flatMap(pResults, (x: AwbItemAttr[]) => x);
    return results;
  }

  //#endregion

  static async processMachineBagging(
    payload,
    cacheKey: string,
    api: string,
  ): Promise<MachinePackageResponseVm> {

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
      // tslint:disable-next-line:radix
      this.getBranchSortir(payload.sorting_branch_id, (payload.chute_number) ? parseInt(payload.chute_number) : null),
    ]);

    const branch = branchResults[0];
    const branchSortir = branchResults[1];

    if (!branch) {
      return generateErrorResult(`Branch not found`);
    }

    const representative = await this.getRepresentative(branchSortir.branchIdLastmile);

    if (!representative) {
      return generateErrorResult(`Representative not found`);
    }

    const awbNumbers: string[] = chain(payload.reference_numbers)
      .groupBy(g => g)
      // tslint:disable-next-line:no-shadowed-variable
      .reduce((result, value) => {
        result.push(value[0]);
        return result;
      }, []).value();

    // const awbs = await this.getAwbs(awbNumbers);
    const awbs = await this.getTempStts(awbNumbers);
    const awbItemAttrs = await this.getAwbItemAttrs(awbNumbers);

    let totalWeight = 0;
    for (const refNumber of awbNumbers) {
      const awb = awbs.find(x => x.nostt === refNumber);
      const awbItemAttr = awbItemAttrs.find(x => x.awbNumber === refNumber);

      // validate valid awb numbers in the bag
      if (!awb || !awbItemAttr) {
        return generateErrorResult(`No resi tidak ditemukan / tidak valid`);
      }

      // if (awbItemAttr.isPackageCombined === true) {
      //   return generateErrorResult(`Nomor resi sudah digabung sortir`);
      // }

      totalWeight += Number(awb.berat);
    }

    // Process Create GS
    // const redlockKey = `redlock:createMachineGS:${payload.sorting_branch_id}-${payload.chute_number}`;
    // const redlock = await RedisService.redlock(redlockKey, 10);
    const redlockKey = (api === 'seal') ? `redlock:createMachineGS:${payload.tag_seal_number}` : `redlock:createMachineGS:${payload.sorting_branch_id}-${payload.chute_number}`;
    const redlock = await RedisService.redlock(redlockKey, 15);
    const tagSeal = (api === 'seal') ? payload.tag_seal_number :  '';
    const chuteNumber = (payload.chute_number) ? payload.chute_number : '';
    if (!redlock) {
      return generateErrorResult(`Nomor resi sedang di PROSESS !`);
    }

    const mCurrentTime = moment.utc().add(7, 'hours');
    // const currentDateStr = mCurrentTime.format('YYYY-MM-DD');
    const currentTimeStr = mCurrentTime.format('YYYY-MM-DD HH:mm:ss');

    try {
      const trxResults = await getConnection().transaction(async transactionManager => {
        const createBagResult = await this.createBagV2(transactionManager, branch, branchSortir, representative, tagSeal, totalWeight, mCurrentTime, chuteNumber);

        const bagAwbBatch: CreateBagFirstScanHubQueueServiceBatch = {
          bagId: createBagResult.bag.bagId,
          bagItemId: createBagResult.bagItem.bagItemId,
          bagNumber: createBagResult.bag.bagNumber,
          podScanInHubId: createBagResult.podScanInHub.podScanInHubId,
          userId: 1,
          branchId: branch.branchId,
          timestamp: currentTimeStr,
          awbs: [],
          tagSeal,
        };

        for (const awbNumber of awbNumbers) {
          const awb = awbs.find(x => x.nostt === awbNumber);
          const awbItemAttr = awbItemAttrs.find(x => x.awbNumber === awbNumber);

          bagAwbBatch.awbs.push({
            awbItemId: awbItemAttr.awbItemId,
            awbNumber: awb.nostt,
            awbItemAttr,
            totalWeight: awb.berat,
          });
        }

        await this.createOrUpdateDetailDatas(transactionManager, bagAwbBatch);

        return createBagResult;
      });

      // get print sticker
      const [{ cnt: bagItemAwbsTotal }] = await RawQueryService.exec(
        `SELECT COUNT(1) as cnt FROM bag_item_awb WHERE bag_item_id=:bagItemId`,
        { bagItemId: trxResults.bagItem.bagItemId },
      );

      const getBranchTo = await this.getBranch(trxResults.bag.branchIdTo);
      const printSticker = {
        // koli: trxResults.fullBagNumber.slice(-3),
        koli: '001',
        berat: trxResults.bagItem.weight.toFixed(2).toString(),
        isi: bagItemAwbsTotal,
        print_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        branch_code: getBranchTo ? getBranchTo.branchCode : '',
        branch_name: getBranchTo ? getBranchTo.branchName : '',
        tag_seal_number: payload.tag_seal_number,
        chute_number: chuteNumber,
        branch_id_lastmile: getBranchTo ? Number(getBranchTo.branchId) : null,
      };

      // tslint:disable-next-line:no-shadowed-variable
      const result = new MachinePackageResponseVm();

      result.statusCode = HttpStatus.OK;
      result.message = `Success Upload`;
      result.data = [{
        state: 0,
        no_gabung_sortir: trxResults.fullBagNumber,
        ...printSticker,
      }];

      PinoLoggerService.log(result);

      // Cache For 3 Days
      // @ts-ignore
      RedisService.setex(cacheKey, result, 60 * 60 * 24 * 3, true).then();

      // create background process
      try {
        // background job to insert bag item history
        BagItemHistoryQueueService.addData(trxResults.bagItem.bagItemId, 500, branch.branchId, 1, -1);
        BagItemHistoryQueueService.addData(trxResults.bagItem.bagItemId, 3000, branch.branchId, 1);

        for (const awbNumber of awbNumbers) {
          const awbItemAttr = awbItemAttrs.find(x => x.awbNumber === awbNumber);

          // background job to insert awb history
          DoPodDetailPostMetaInQueueService.createJobByAwbFilter(
            awbItemAttr.awbItemId,
            branch.branchId,
            1,
          );
        }
      } catch (error) {

        PinoLoggerService.log(error);
      }

      return result;
    } catch (error) {
      const errMessage = `ERROR MESIN SORTIR CATCH: ${error.message}`;
      PinoLoggerService.log(errMessage);
      PinoLoggerService.log(error);
      return generateErrorResult(errMessage);
      // throw error;
    } finally {
      // release lock
      // RedisService.del(redlockKey).then();
    }
  }

  private static async createBagV2(transactionManager, branch: Branch, branchSortir: BranchSortir, representative, sealNumber: string, totalWeight: number, mCurrentTime: moment.Moment, chuteNumber: string): Promise<CreateBagResult> {
    const currentDateStr = mCurrentTime.format('YYYY-MM-DD');
    const currentTimeStr = mCurrentTime.format('YYYY-MM-DD HH:mm:ss');

    // generate bag number
    // Prefix ZA for tangerang, ZB for BDO
    // const randomBagNumber = 'ZA' + sampleSize('012345678900123456789001234567890ABCDEFGHIJKLMNOPQRSTUVWXYZZYWVUTSRQPONMLKJIHGFEDCBA', 8).join('');
    const randomBagNumber = BagNumberService.createBagNumber('ZA').toString();
    const refBranchCode = branch ? branch.branchCode : '';

    const bagQueryData = Bag.create({
      bagNumber: randomBagNumber,
      branchIdTo: branchSortir.branchIdLastmile,
      refRepresentativeCode: representative.representativeCode,
      representativeIdTo: representative.representativeId,
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
      chuteNumber,
    });

    const bag = await transactionManager.getRepository(Bag).save(bagQueryData);
    const bagId = bag.bagId;
    const sequence = 1;

    const bagSeq: string = sequence.toString().padStart(3, '0');

    // INSERT INTO TABLE BAG ITEM
    const bagItemQueryData = BagItem.create({
      bagId,
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

    return {
      randomBagNumber,
      fullBagNumber: `${randomBagNumber}`,
      bagSeq: sequence,
      bag,
      bagItem,
      podScanInHub,
    };
  }

  // private static async createBag(transactionManager, branch: Branch, branchSortir: BranchSortir, district: District, sealNumber: string, totalWeight: number, mCurrentTime: moment.Moment): Promise<CreateBagResult> {
  //   const currentDateStr = mCurrentTime.format('YYYY-MM-DD');
  //   const currentTimeStr = mCurrentTime.format('YYYY-MM-DD HH:mm:ss');
  //
  //   // generate bag number
  //   const randomBagNumber = 'Z' + sampleSize('012345678900123456789001234567890ABCDEFGHIJKLMNOPQRSTUVWXYZZYWVUTSRQPONMLKJIHGFEDCBA', 6).join('');
  //   const refBranchCode = branch ? branch.branchCode : '';
  //   const representativeCode = district ? district.districtCode.substring(0, 3) : null;
  //   const representative = await this.getRepresentative(representativeCode);
  //
  //   const bagQueryData = Bag.create({
  //     bagNumber: randomBagNumber,
  //     branchIdTo: branchSortir.branchIdLastmile,
  //     refRepresentativeCode: representative ? representative.representativeCode : null,
  //     representativeIdTo: representative ? representative.representativeId : null,
  //     refBranchCode,
  //     bagType: 'branch',
  //     branchId: branch.branchId,
  //     bagDate: currentDateStr,
  //     bagDateReal: currentTimeStr,
  //     createdTime: currentTimeStr,
  //     updatedTime: currentTimeStr,
  //     userIdCreated: 1,
  //     userIdUpdated: 1,
  //     isSortir: true,
  //     isManual: false,
  //     sealNumber,
  //   });
  //
  //   const bag = await transactionManager.getRepository(Bag).save(bagQueryData);
  //   const bagId = bag.bagId;
  //   const sequence = 1;
  //
  //   const bagSeq: string = sequence.toString().padStart(3, '0');
  //
  //   // INSERT INTO TABLE BAG ITEM
  //   const bagItemQueryData = BagItem.create({
  //     bagId,
  //     bagSeq: sequence,
  //     branchIdLast: branch.branchId,
  //     bagItemStatusIdLast: 3000,
  //     userIdCreated: 1,
  //     weight: totalWeight,
  //     createdTime: currentTimeStr,
  //     updatedTime: currentTimeStr,
  //     userIdUpdated: 1,
  //     isSortir: true,
  //   });
  //
  //   const bagItem = await transactionManager.getRepository(BagItem).save(bagItemQueryData);
  //
  //   // insert into pod scan in hub
  //   // 100 = inprogress, 200 = done
  //   const podScanInHubQueryData = transactionManager.getRepository(PodScanInHub).create({
  //     branchId: branch.branchId,
  //     scanInType: 'BAG',
  //     transactionStatusId: 200,
  //     userIdCreated: 1,
  //     createdTime: currentTimeStr,
  //     updatedTime: currentTimeStr,
  //     userIdUpdated: 1,
  //   });
  //
  //   const podScanInHub = await transactionManager.getRepository(PodScanInHub).save(podScanInHubQueryData);
  //
  //   return {
  //     randomBagNumber,
  //     fullBagNumber: `${randomBagNumber}${bagSeq}`,
  //     bagSeq: sequence,
  //     bag,
  //     bagItem,
  //     podScanInHub,
  //   };
  // }

  private static async createOrUpdateDetailDatas(
    transactionManager: EntityManager,
    batchData: CreateBagFirstScanHubQueueServiceBatch,
  ) {
    // const dateNow = moment().toDate();

    // const awbNumbers = batchData.awbs.filter(x => x.awbNumber).map(x => x.awbNumber);
    // const awbItemIds = batchData.awbs.filter(x => x.awbItemId).map(x => x.awbItemId);
    // const awbItemAttrIds = batchData.awbs.filter(x => x.awbItemAttr).map(x => x.awbItemAttr.awbItemAttrId);

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
        isMachine: true,
      });
    });

    const podScanInHubDetailSaveDatas = batchData.awbs.filter(x => x.awbItemAttr).map(x => {
      UpsertHubSummaryBagSortirQueueService.perform(
        batchData.bagId,
        batchData.bagItemId,
        batchData.bagNumber,
        x.awbItemId,
        x.awbNumber,
        batchData.userId,
        batchData.branchId,
        moment(batchData.timestamp).toDate(),
        null,
        false,
        true,
      );

      UpdateBranchSortirLogSummaryQueueService.perform(
        batchData.branchId,
        x.awbNumber,
        batchData.tagSeal,
        0,
      );

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
    // CANCELLED. Already Updated in DB Trigger
    // const chunkAwbItemAttrs = chunk(awbItemAttrIds, 30);
    // for (const c of chunkAwbItemAttrs) {
    //   await transactionManager.update(AwbItemAttr,
    //     { awbItemAttrId: In(c) },
    //     {
    //       bagItemIdLast: batchData.bagItemId,
    //       updatedTime: batchData.timestamp,
    //       isPackageCombined: true,
    //       awbStatusIdLast: 4500,
    //       userIdLast: batchData.userId,
    //     },
    //   );
    // }

    // UPDATE STATUS IN HUB IN AWB SUMMARY
    // const chunkAwbNumbers = chunk(awbNumbers, 30);
    // for (const c of chunkAwbNumbers) {
    //   await transactionManager.update(
    //     HubSummaryAwb,
    //     { awbNumber: In(c) },
    //     {
    //       scanDateInHub: dateNow,
    //       inHub: true,
    //       bagItemIdIn: batchData.bagItemId,
    //       bagIdIn: batchData.bagId,
    //       userIdUpdated: batchData.userId,
    //       updatedTime: batchData.timestamp,
    //     },
    //   );
    // }
  }
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
  tagSeal: string;
}

interface CreateBagFirstScanHubQueueServiceBatchAwb {
  awbItemId: number;
  awbNumber: string;
  awbItemAttr?: AwbItemAttr;
  totalWeight: number;
}
