import { WebAwbScanPriorityResponse } from './../../models/web-awb-scan-priority-response.vm';
// #region import
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { PodScanInBranch } from '../../../../shared/orm-entity/pod-scan-in-branch';
import { PodScanInBranchBag } from '../../../../shared/orm-entity/pod-scan-in-branch-bag';
import { PodScanInBranchDetail } from '../../../../shared/orm-entity/pod-scan-in-branch-detail';
import { DoPodDetailBagRepository } from '../../../../shared/orm-repository/do-pod-detail-bag.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { BagTroubleService } from '../../../../shared/services/bag-trouble.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { BagItemHistoryQueueService } from '../../../queue/services/bag-item-history-queue.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
  ScanBranchAwbVm,
  ScanBranchBagVm,
  ScanInputNumberBranchVm,
  V2ScanInputNumberBranchVm,
  MobileScanInBagBranchResponseVm,
  MobileScanInBagBranchVm,
  MobileScanInBranchResponseVm,
  V2MobileScanInBranchResponseVm,
} from '../../models/mobile-scanin.vm';
import { AwbService } from '../v1/awb.service';
import { BagService } from '../v1/bag.service';
import moment = require('moment');
import { getManager, createQueryBuilder } from 'typeorm';
import { WebAwbScanPriorityService } from '../web/web-awb-scan-priority.service';
// #endregion

export class LastMileDeliveryInService {
  private static async resultBag(
    inputNumber: string,
    podScanInBranchId: string,
  ): Promise<MobileScanInBagBranchResponseVm> {
    let bagData;

    bagData = await BagService.validBagNumber(inputNumber); // check valid bagNumber

    return await this.scanInBagBranch(
      bagData,
      inputNumber,
      podScanInBranchId,
    );
  }

  // NOTE: scan in package on branch
  // 1. scan bag number / scan awb number
  // 2. create session per branch with insert table on pod scan in branch
  // 2. scan awb number on bag and calculate

  // TODO: need refactoring
  static async scanInBranch(
    payload: MobileScanInBagBranchVm,
  ): Promise<MobileScanInBranchResponseVm> {
    const isBag: boolean = false;
    const data = new ScanInputNumberBranchVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();
    const regexNumber = /^[0-9]+$/;

    const qb = createQueryBuilder();

    // Total barang belum scan masuk
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');

    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id',
    );
    qb.innerJoin('awb_item_attr', 'aia', 'aia.awb_id = awb.awb_id');
    qb.andWhere('awb.awb_number = :awbNumber', {
      awbNumber: payload.scanValue,
    });
    const res = await qb.getRawOne();

    if (res) {
      let podScanInBranch = await PodScanInBranch.findOne({
        where: {
          branchId: permissonPayload.branchId,
          transactionStatusId: 600,
          isDeleted: false,
          userIdCreated: authMeta.userId,
        },
      });

      if (podScanInBranch) {
        payload.podScanInBranchId = podScanInBranch.podScanInBranchId;
      } else {
        podScanInBranch = PodScanInBranch.create();
        podScanInBranch.branchId = permissonPayload.branchId;
        podScanInBranch.scanInType = 'bag'; // default
        podScanInBranch.transactionStatusId = 600;
        podScanInBranch.totalBagScan = 0;

        await PodScanInBranch.save(podScanInBranch);
        payload.podScanInBranchId = podScanInBranch.podScanInBranchId;
      }

      // for (let inputNumber of payload.scanValue) {
      let inputNumber = payload.scanValue;
      // Check type scan value number
      inputNumber = inputNumber.trim();
      if (regexNumber.test(inputNumber)) {
        // awb number
        const resultAwb = await this.scanInAwbBranch(
          inputNumber,
          payload.bagNumber,
          payload.podScanInBranchId,
          false,
        );
        data.awbNumber = resultAwb.awbNumber;
        data.status = resultAwb.status;
        data.message = resultAwb.message;
        data.trouble = resultAwb.trouble;
      } else {
        data.awbNumber = inputNumber;
        data.status = 'error';
        data.message = 'Nomor tidak valid';
        data.trouble = true;
      }
      const result = new MobileScanInBranchResponseVm();
      result.data = data;

      result.service = res.service;
      result.awbNumber = res.awbNumber;
      result.consigneeName = res.consigneeName;
      result.consigneeAddress = res.consigneeAddress;
      result.consigneePhone = res.consigneePhone;
      result.totalCodValue = res.totalCodValue;
      result.dateTime = moment().format('YYYY-MM-DD HH:mm:ss');

      result.podScanInBranchId = payload.podScanInBranchId;

      return result;
    }
    data.awbNumber = payload.scanValue;
    data.status = 'error';
    data.message = `Resi ${payload.scanValue} tidak ditemukan`;
    data.trouble = true;
    const result = new MobileScanInBranchResponseVm();
    result.data = data;
    return result;
  }

  static async scanInBagBranch(
    bagData: BagItem,
    bagNumber: string,
    podScanInBranchId: string,
  ): Promise<MobileScanInBagBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new MobileScanInBagBranchResponseVm();

    let totalSuccess = 0;
    let totalError = 0;
    let response = new ScanBranchBagVm();
    response = {
      bagId: null,
      bagItemId: null,
      status: 'ok',
      trouble: false,
      message: 'Success',
    };

    if (bagData) {
      // NOTE: check condition disable on check branchIdNext
      const holdRedis = await RedisService.locking(
        `hold:bag-scanin-branch:${bagData.bagItemId}`,
        'locking',
      );
      const notScan =
        bagData.bagItemStatusIdLast != BAG_STATUS.IN_BRANCH ? true : false;
      if (notScan && holdRedis) {
        const notScanBranch =
          bagData.branchIdNext != permissonPayload.branchId ? true : false;
        if (
          bagData.bagItemStatusIdLast != BAG_STATUS.OUT_HUB ||
          notScanBranch
        ) {
          const desc = notScanBranch
            ? 'Gerai tidak sesuai'
            : 'Status bag tidak sesuai';
          response.status = 'warning';
          BagTroubleService.create(
            bagNumber,
            bagData.bagItemStatusIdLast,
            600, // IN BRANCH
            desc,
          );
        }

        // AFTER Scan IN ===============================================
        // #region after scanin
        // pod_scan_in_branch_bag;
        const podScanInBranchBag = await PodScanInBranchBag.findOne({
          where: {
            podScanInBranchId,
            bagId: bagData.bagId,
            bagItemId: bagData.bagItemId,
            isDeleted: false,
          },
        });

        if (podScanInBranchBag) {
          totalError += 1;
          response.status = 'error';
          response.message = 'Gabungan paket sudah discan sebelumnya';
        } else {
          const bagItem = await BagItem.findOne({
            where: {
              bagItemId: bagData.bagItemId,
              isDeleted: false,
            },
          });
          if (bagItem) {
            // update bagItem
            await BagItem.update(bagItem.bagItemId, {
              bagItemStatusIdLast: BAG_STATUS.IN_BRANCH,
              branchIdLast: permissonPayload.branchId,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            });
            // update first scan in do pod
            const doPodDetailBag = await DoPodDetailBagRepository.getDataByBagItemIdAndBagStatus(
              bagData.bagItemId,
              BAG_STATUS.IN_BRANCH,
            );
            if (doPodDetailBag) {
              // counter total scan in
              doPodDetailBag.doPod.totalScanInBag += 1;
              if (doPodDetailBag.doPod.totalScanInBag == 1) {
                await DoPod.update(doPodDetailBag.doPodId, {
                  firstDateScanIn: timeNow,
                  lastDateScanIn: timeNow,
                  totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
                  updatedTime: timeNow,
                  userIdUpdated: authMeta.userId,
                });
              } else {
                await DoPod.update(doPodDetailBag.doPodId, {
                  lastDateScanIn: timeNow,
                  totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
                  updatedTime: timeNow,
                  userIdUpdated: authMeta.userId,
                });
              }
            }

            // NOTE: background job for insert bag item history
            BagItemHistoryQueueService.addData(
              bagData.bagItemId,
              BAG_STATUS.IN_BRANCH,
              permissonPayload.branchId,
              authMeta.userId,
            );

            // get data awb on bag
            const bagItemsAwb = await BagItemAwb.find({
              where: {
                bagItemId: bagData.bagItemId,
                isDeleted: false,
              },
            });

            if (bagItemsAwb && bagItemsAwb.length > 0) {
              for (const itemAwb of bagItemsAwb) {
                if (itemAwb.awbItemId) {
                  const dataAwb = new ScanInputNumberBranchVm();
                  dataAwb.awbNumber = itemAwb.awbNumber;
                  dataAwb.status = 'ok';
                  dataAwb.message = 'Success';
                  dataAwb.trouble = false;
                  dataItem.push(dataAwb);
                }
              } // end of loop
            } else {
              console.log('### Data tidak ditemukan !!');
            }

            // transaction
            await getManager().transaction(async transactionEntityManager => {
              // NOTE: create podScanInBranchBag
              const podScanInBranchBagObj = PodScanInBranchBag.create();
              podScanInBranchBagObj.podScanInBranchId = podScanInBranchId;
              podScanInBranchBagObj.branchId = permissonPayload.branchId;
              podScanInBranchBagObj.bagId = bagData.bagId;
              podScanInBranchBagObj.bagItemId = bagData.bagItemId;
              podScanInBranchBagObj.bagNumber = bagNumber;
              podScanInBranchBagObj.totalAwbItem = bagItemsAwb.length;
              podScanInBranchBagObj.totalAwbScan = 0;
              podScanInBranchBagObj.totalDiff = 0;
              await PodScanInBranchBag.save(podScanInBranchBagObj);

              // update total bag scan on pod_scan_in_branch
              await transactionEntityManager.increment(
                PodScanInBranch,
                {
                  podScanInBranchId,
                  isDeleted: false,
                },
                'totalBagScan',
                1,
              );
            });
          }
        }

        // #endregion after scanin
        totalSuccess += 1;
        // remove key holdRedis
        RedisService.del(`hold:bag-scanin-branch:${bagData.bagItemId}`);
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Gabung paket ${bagNumber} sudah di proses`;
      }
      response.bagId = bagData.bagId;
      response.bagItemId = bagData.bagItemId;
    } else {
      totalError += 1;
      response.status = 'error';
      response.message = `Gabung paket ${bagNumber} Tidak di Temukan`;
    }

    // TODO: refactoring
    result.totalData = dataItem.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.dataBag = response;
    result.data = dataItem;

    return result;
  }

  static async scanInAwbBranch(
    awbNumber: string,
    bagNumber: string,
    podScanInBranchId: string,
    usePriority: boolean = false,
  ): Promise<ScanBranchAwbVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // init result
    const dataBag = new ScanBranchBagVm();
    const result = new ScanBranchAwbVm();
    result.awbNumber = awbNumber;
    result.dataBag = null;
    result.trouble = false;
    result.status = 'error';
    result.message = 'Pending';

    const awb = await AwbService.validAwbBagNumber(awbNumber);
    if (awb) {
      // TODO: validation need improvement
      let notScanIn = true;
      // handle if awb.awbStatusIdLast is null
      const finalStatusIn = [AWB_STATUS.IN_BRANCH, AWB_STATUS.ANT, AWB_STATUS.DLV];
      if (awb.awbStatusIdLast && awb.awbStatusIdLast != 0) {
        // check exclude final status in
        notScanIn = !finalStatusIn.includes(awb.awbStatusIdLast) ? true : false;
      }
      // Add Locking setnx redis
      const holdRedis = await RedisService.locking(
        `hold:scanin-awb-branch:${awb.awbItemId}`,
        'locking',
      );

      if (notScanIn && holdRedis) {
        // save data to table pod_scan_id
        // TODO: find by check data
        let bagId = 0;
        let bagItemId = 0;
        var podScanInBranchDetail;
        var routeInfo = new WebAwbScanPriorityResponse;

        if (usePriority) {
          [podScanInBranchDetail, routeInfo] = await Promise.all([
            PodScanInBranchDetail.findOne({
              where: {
                podScanInBranchId,
                awbItemId: awb.awbItemId,
                isDeleted: false,
              },
            }),
            WebAwbScanPriorityService.scanPriority(awbNumber)
          ])

        } else {
          podScanInBranchDetail = await PodScanInBranchDetail.findOne({
            where: {
              podScanInBranchId,
              awbItemId: awb.awbItemId,
              isDeleted: false,
            },
          });
        }

        if (podScanInBranchDetail) {
          result.status = 'error';
          result.trouble = true;
          result.message = `Resi ${awbNumber} sudah scan in`;
          // TODO: update data podScanInBranchDetail
        } else {
          result.status = 'ok';
          result.message = 'Success';

          if (bagNumber != '') {
            const bagData = await BagService.validBagNumber(bagNumber);
            if (bagData) {
              const bagItemAwb = await BagItemAwb.findOne({
                where: {
                  bagItemId: bagData.bagItemId,
                  awbItemId: awb.awbItemId,
                  isDeleted: false,
                },
              });

              if (!bagItemAwb) {
                result.status = 'warning';
                result.message = `Resi ${awbNumber} tidak ada dalam gabung paket`;
              }
              // set data bag
              bagId = bagData.bagId;
              bagItemId = bagData.bagItemId;

              dataBag.bagId = bagId;
              dataBag.bagItemId = bagItemId;
              dataBag.status = 'ok';
              dataBag.message = 'Success';
              dataBag.trouble = false;
              result.dataBag = dataBag;
            } else {
              result.status = 'warning';
              result.message = `Resi ${awbNumber} tidak ada dalam gabung paket`;
            }
          } else {
            // handle awb number only with not have bag number
            result.status = 'warning';
            result.message = `Resi ${awbNumber} tidak ada dalam gabung paket`;
          }

          const podScanInBranchDetailObj = PodScanInBranchDetail.create();
          podScanInBranchDetailObj.podScanInBranchId = podScanInBranchId;
          podScanInBranchDetailObj.bagId = bagId;
          podScanInBranchDetailObj.bagItemId = bagItemId;
          podScanInBranchDetailObj.awbId = awb.awbId;
          podScanInBranchDetailObj.awbItemId = awb.awbItemId;
          podScanInBranchDetailObj.awbNumber = awbNumber;
          podScanInBranchDetailObj.bagNumber = bagNumber;
          podScanInBranchDetailObj.isTrouble = result.trouble;
          if (usePriority) {
            if (routeInfo) {
              if(routeInfo.status == 'ok'){
                result.routePriority = routeInfo.routeAndPriority;
                result.kelurahan = routeInfo.kelurahan;
              }else{
                result.status = 'warning';
                result.trouble = false;
                result.message = `Resi ${awbNumber} belum pernah di MANIFESTED`;
                result.routePriority = routeInfo.routeAndPriority;
              }
              podScanInBranchDetailObj.routePriority = routeInfo.routeAndPriority;
            }
          }
          await PodScanInBranchDetail.save(podScanInBranchDetailObj);

          // AFTER Scan IN ===============================================
          // #region after scanin

          // NOTE: queue by Bull add awb history with status scan in branch
          DoPodDetailPostMetaQueueService.createJobByScanInAwbBranch(
            awb.awbItemId,
            permissonPayload.branchId,
            authMeta.userId,
          );
          // #endregion after scanin
        }

        // remove key holdRedis
        RedisService.del(`hold:scanin-awb-branch:${awb.awbItemId}`);
      } else {
        result.message = `Resi ${awbNumber} sudah di proses.`;
        result.trouble = true;
      }
    } else {
      result.trouble = true;
      result.message = `Resi ${awbNumber} Tidak di Temukan`;
    }

    return result;
  }


  static async scanInBranchV2(
    payload: MobileScanInBagBranchVm,
  ): Promise<V2MobileScanInBranchResponseVm> {
    const isBag: boolean = false;
    const data = new V2ScanInputNumberBranchVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();
    const regexNumber = /^[0-9]+$/;

    const qb = createQueryBuilder();
    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.consignee_name', 'consigneeName');
    qb.addSelect('awb.consignee_address', 'consigneeAddress');
    qb.addSelect('awb.consignee_phone', 'consigneePhone');
    qb.addSelect('awb.total_cod_value', 'totalCodValue');
    qb.addSelect('pt.package_type_code', 'service');

    qb.from('awb', 'awb');
    qb.innerJoin(
      'package_type',
      'pt',
      'pt.package_type_id = awb.package_type_id',
    );
    qb.innerJoin('awb_item_attr', 'aia', 'aia.awb_id = awb.awb_id');
    qb.andWhere('awb.awb_number = :awbNumber', {
      awbNumber: payload.scanValue,
    });
    const res = await qb.getRawOne();

    if (res) {
      let podScanInBranch = await PodScanInBranch.findOne({
        where: {
          branchId: permissonPayload.branchId,
          transactionStatusId: 600,
          isDeleted: false,
          userIdCreated: authMeta.userId,
        },
      });

      if (podScanInBranch) {
        payload.podScanInBranchId = podScanInBranch.podScanInBranchId;
      } else {
        podScanInBranch = PodScanInBranch.create();
        podScanInBranch.branchId = permissonPayload.branchId;
        podScanInBranch.scanInType = 'bag'; // default
        podScanInBranch.transactionStatusId = 600;
        podScanInBranch.totalBagScan = 0;

        await PodScanInBranch.save(podScanInBranch);
        payload.podScanInBranchId = podScanInBranch.podScanInBranchId;
      }

      let inputNumber = payload.scanValue;
      let resultBag;

      if (regexNumber.test(inputNumber)) {
        const resultAwb = await this.scanInAwbBranch(
          inputNumber,
          payload.bagNumber,
          payload.podScanInBranchId,
          true,
        );
        data.awbNumber = inputNumber;
        data.status = resultAwb.status;
        data.message = resultAwb.message;
        data.trouble = resultAwb.trouble;
        data.routeAndPriority = resultAwb.routePriority;
      } else if (await BagService.isBagNumberLenght(inputNumber)) {
        resultBag = await this.resultBag(inputNumber, payload.podScanInBranchId);
      } else {
        data.awbNumber = inputNumber;
        data.status = 'error';
        data.message = 'Nomor tidak valid';
        data.trouble = true;
      }
    }

    const result = new V2MobileScanInBranchResponseVm();
    result.podScanInBranchId = payload.podScanInBranchId;
    result.data = data;
    result.service = res.service;
    result.awbNumber = res.awbNumber;
    result.consigneeName = res.consigneeName;
    result.consigneeAddress = res.consigneeAddress;
    result.consigneePhone = res.consigneePhone;
    result.totalCodValue = res.totalCodValue;
    result.dateTime = moment().format('YYYY-MM-DD HH:mm:ss');

    return result;
  }
}
