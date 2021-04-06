// //#region
import _, { assign, join, sampleSize } from 'lodash';
import { createQueryBuilder, getManager } from 'typeorm';

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
// //#endregion

export class HubMachineService {
  constructor() {}

  static async awbPackage(
    payload: PackageMachinePayloadVm,
  ): Promise<MachinePackageResponseVm> {
    const regexNumber = /^[0-9]+$/;
    // const value = payload.value;
    // const valueLength = value.length;
    const result = new MachinePackageResponseVm();

    // result.branchId = 0;
    // result.branchName = null;
    let paramBagItemId = null;
    let paramBagNumber = null;
    let paramPodScanInHubId = null;
    let scanResultMachine;

    if (!payload.sorting_branch_id) {
      const data = [];
      data.push({
        state: 1,
        no_gabung_sortir: null,
      });
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = `Sorting Branch ID Null`;
      result.data = data;
      // throw new BadRequestException('Sorting Branch ID Null');
    } else {
      const branch = await Branch.findOne({
        where: {
          branchId: payload.sorting_branch_id,
        },
      });

      const branchSortir = await BranchSortir.findOne({
        where: {
          branchId: payload.sorting_branch_id,
          noChute: payload.chute_number,
        },
      });
      if(branch){
        if (branchSortir) {

          for(let i = 0; i < payload.reference_numbers.length; i++) {
            const awbItemAttr = await AwbService.validAwbNumber(payload.reference_numbers[i]);
            // NOTE: check destination awb with awb.toId
            const awb = await Awb.findOne({
              where: { awbNumber: payload.reference_numbers[i], isDeleted: false },
            });
            if (!awbItemAttr || !awb) {
              const data = [];
              data.push({
                state: 1,
                no_gabung_sortir: null,
              });
              result.statusCode = HttpStatus.BAD_REQUEST;
              result.message = `No resi tidak ditemukan / tidak valid`;
              result.data = data;
              return result;
            } else if (awbItemAttr.isPackageCombined) {
              const data = [];
              data.push({
                state: 1,
                no_gabung_sortir: null,
              });
              result.statusCode = HttpStatus.BAD_REQUEST;
              result.message = `Nomor resi sudah digabung sortir`;
              result.data = data;
              return result;
            }
          }
          // Process Create GS
          for(let i = 0; i < payload.reference_numbers.length; i++) {
            scanResultMachine = await this.machineAwbScan(payload.reference_numbers[i],branch.branchId, paramBagItemId, paramBagNumber, paramPodScanInHubId, branchSortir.branchIdLastmile, payload.tag_seal_number);
            if(scanResultMachine) {
              paramBagItemId = scanResultMachine.bagItemId;
              paramBagNumber = scanResultMachine.bagNumber;
              paramPodScanInHubId = scanResultMachine.podScanInHubId;
            }
          }
          if(scanResultMachine) {
            const data = [];
            data.push({
              state: 0,
              no_gabung_sortir: scanResultMachine.bagNumber,
            });
            result.statusCode = HttpStatus.OK;
            result.message = `Success Upload`;
            result.data = data;
          }
          
        } else {
          const data = [];
          data.push({
            state: 1,
            no_gabung_sortir: null,
          });
          result.statusCode = HttpStatus.BAD_REQUEST;
          result.message = `Branch Sortir not found`;
          result.data = data;
        }
      } else {
        const data = [];
        data.push({
          state: 1,
          no_gabung_sortir: null,
        });
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.message = `Branch not found`;
        result.data = data;
      }
    }
    return result;
  }

  private static async machineAwbScan(paramawbNumber: string, paramBranchId: number, paramBagItemId: number, paramBagNumber: string, paramPodScanInHubId: string, paramBranchIdLastmile: number, paramSealNumber: string): Promise<any> {
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
      // use data district from branch
      if (branch && districtId) {
        districtDetail = await District.findOne({
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
        const bagItem = await this.MachineInsertDetailAwb(paramBagNumber, awb, podScanInHubId, awbItemAttr.awbItemId, paramBranchId);
        if (bagItem) {
          bagWeight = bagItem.weight;
          bagSeq = bagItem.bagSeq;
        }
      } else {
        // Generate Bag Number
        const genBagNumber = await this.MachineCreateBagNumber(paramBranchId, awbItemAttr.awbItemId, districtDetail, branch, awb, paramBranchIdLastmile, paramSealNumber);
        bagNumber = genBagNumber.bagNumber;
        podScanInHubId = genBagNumber.podScanInHubId;
        bagItemId = genBagNumber.bagItemId;
        bagWeight = genBagNumber.weight;
        bagSeq = genBagNumber.bagSeq;
      }

      // insert data trouble
      // TODO: feature disable
      if (isTrouble) {
        // const dataTrouble = {
        //   awbNumber: awb.awbNumber,
        //   troubleDesc: join(troubleDesc, ' dan '),
        // };
        // console.error('TROUBLE SCAN GAB SORTIR :: ', dataTrouble);
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

  private static async MachineInsertDetailAwb(paramBagNumber: string, paramAwbDetail, paramPodScanInHubId: string, paramAwbItemId: number, paramBranchId: number): Promise<BagItem> {
    // const authMeta = AuthService.getAuthData();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
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

  private static async MachineCreateBagNumber(paramBranchId: number, paramAwbItemId, districtDetail, branchDetail, paramAwbDetail, paramBranchIdLastmile, paramSealNumber ): Promise<CreateBagNumberResponseVM> {
    const result = new CreateBagNumberResponseVM();
    // const authMeta = AuthService.getAuthData();
    // const permissonPayload = AuthService.getPermissionTokenPayload();
    const branchId = paramBranchId;

    let bagId: number;
    let sequence: number;
    let randomBagNumber;

    if (!paramAwbItemId || paramAwbItemId.length < 1) {
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
        isManual : false,
        sealNumber: paramSealNumber,
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
    const bagItem = await BagItem.save(bagItemDetail);

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
    const podScanInHubData = PodScanInHub.create({
      branchId: branchId,
      scanInType: 'BAG',
      transactionStatusId: 100,
      userIdCreated: 1,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: 1,
    });
    const podScanInHub = await PodScanInHub.save(podScanInHubData);

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
