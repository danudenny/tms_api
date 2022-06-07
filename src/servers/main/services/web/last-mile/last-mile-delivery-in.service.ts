import { WebAwbScanPriorityResponse } from './../../../models/web-awb-scan-priority-response.vm';
// #region import
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../../shared/orm-entity/bag-item-awb';
import { DoPod } from '../../../../../shared/orm-entity/do-pod';
import { PodScanInBranch } from '../../../../../shared/orm-entity/pod-scan-in-branch';
import { PodScanInBranchBag } from '../../../../../shared/orm-entity/pod-scan-in-branch-bag';
import { PodScanInBranchDetail } from '../../../../../shared/orm-entity/pod-scan-in-branch-detail';
import {
    DoPodDetailBagRepository,
} from '../../../../../shared/orm-repository/do-pod-detail-bag.repository';
import { AuthService } from '../../../../../shared/services/auth.service';
import { BagTroubleService } from '../../../../../shared/services/bag-trouble.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import {
    BagItemHistoryQueueService,
} from '../../../../queue/services/bag-item-history-queue.service';
import {
    DoPodDetailPostMetaQueueService,
} from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
    ScanBranchAwbVm, ScanBranchBagVm, ScanInputNumberBranchVm, WebScanInBagBranchResponseVm,
    WebScanInBagBranchVm, WebScanInBranchResponseVm,
} from '../../../models/web-scanin.vm';
import { AwbService } from '../../v1/awb.service';
import { BagService } from '../../v1/bag.service';
import moment = require('moment');
import { getManager } from 'typeorm';
import { V2WebScanInBranchResponseVm, V2ScanInputNumberBranchVm } from '../../../models/web-scanin-v2.vm';
import {WebAwbScanPriorityService} from '../../web/web-awb-scan-priority.service'

// #endregion
export class LastMileDeliveryInService {
  private static async resultBag(
    inputNumber: string,
    podScanInBranchId: string,
    isSealNumber: boolean,
  ): Promise<WebScanInBagBranchResponseVm> {
    let bagData;
    if (isSealNumber) {
      bagData = await BagService.findOneBySealNumber(inputNumber); // check valid sealNumber
    } else {
      bagData = await BagService.validBagNumber(inputNumber); // check valid bagNumber
    }
    return await this.scanInBagBranch(
        bagData,
        inputNumber,
        podScanInBranchId,
        isSealNumber,
      );
  }

  // NOTE: scan in package on branch
  // 1. scan bag number / scan awb number
  // 2. create session per branch with insert table on pod scan in branch
  // 2. scan awb number on bag and calculate
  static async scanInBranch(
    payload: WebScanInBagBranchVm,
  ): Promise<WebScanInBranchResponseVm> {
    let isBag: boolean = false;
    let data: ScanInputNumberBranchVm[] = [];
    let dataBag = new ScanBranchBagVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // find and create pod_scan_in_branch
    let podScanInBranch = await PodScanInBranch.findOne({
      where: {
        branchId: permissonPayload.branchId,
        transactionStatusId: 600,
        isDeleted: false,
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

    for (let inputNumber of payload.scanValue) {
      let resultBag;
      // Check type scan value number
      inputNumber = inputNumber.trim();
      if (await AwbService.isAwbNumberLenght(inputNumber)) {
        // awb number
        const resultAwb = await this.scanInAwbBranch(
          inputNumber,
          payload.bagNumber,
          payload.podScanInBranchId,
          false,
        );
        const dataItem = new ScanInputNumberBranchVm();
        dataItem.awbNumber = resultAwb.awbNumber;
        dataItem.status = resultAwb.status;
        dataItem.message = resultAwb.message;
        dataItem.trouble = resultAwb.trouble;
        data.push(dataItem);

        dataBag = resultAwb.dataBag;
      } else if (await BagService.isBagNumberLenght(inputNumber)) {
        resultBag = await this.resultBag(inputNumber, payload.podScanInBranchId, false);
      } else if (await BagService.isSealNumberLenght(inputNumber)) {
        resultBag = await this.resultBag(inputNumber, payload.podScanInBranchId, true);
      } else {
        const dataItem = new ScanInputNumberBranchVm();
        dataItem.awbNumber = inputNumber;
        dataItem.status = 'error';
        dataItem.message = 'Nomor tidak valid';
        dataItem.trouble = true;
        data.push(dataItem);
      }
      if (resultBag) {
          isBag = true;
          data = resultBag.data;
          dataBag = resultBag.dataBag;
        }
    }

    // get bag number
    if (dataBag && dataBag.bagItemId && payload.bagNumber == '') {
      const bagItem = await BagService.getBagNumber(dataBag.bagItemId);
      if (bagItem) {
        payload.bagNumber =
          bagItem.bag.bagNumber + bagItem.bagSeq.toString().padStart(3, '0');
      }
    }

    const result = new WebScanInBranchResponseVm();
    result.bagNumber = payload.bagNumber;
    result.podScanInBranchId = payload.podScanInBranchId;
    result.isBag = isBag;
    result.data = data;
    result.dataBag = dataBag;
    return result;
  }

  // additional call to priority service aka tms mono to get prioritazion data
  static async scanInBranchV2(
    payload: WebScanInBagBranchVm,
  ): Promise<WebScanInBranchResponseVm> {
    let isBag: boolean = false;
    let data: V2ScanInputNumberBranchVm[] = [];
    let dataBag = new ScanBranchBagVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    // find and create pod_scan_in_branch
    let podScanInBranch = await PodScanInBranch.findOne({
      where: {
        branchId: permissonPayload.branchId,
        transactionStatusId: 600,
        isDeleted: false,
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

    for (let inputNumber of payload.scanValue) {
      let resultBag;
      // Check type scan value number
      inputNumber = inputNumber.trim();
      if (await AwbService.isAwbNumberLenght(inputNumber)) {
        // check awb number
        const resultAwb = await this.scanInAwbBranch(
          inputNumber,
          payload.bagNumber,
          payload.podScanInBranchId,
          true
        );
        const dataItem = new V2ScanInputNumberBranchVm();
        dataItem.awbNumber = resultAwb.awbNumber;
        dataItem.status = resultAwb.status;
        dataItem.message = resultAwb.message;
        dataItem.trouble = resultAwb.trouble;
        dataItem.routeAndPriority = resultAwb.routePriority;
        data.push(dataItem);

        dataBag = resultAwb.dataBag;

      } else if (await BagService.isBagNumberLenght(inputNumber)) {
        resultBag = await this.resultBag(inputNumber, payload.podScanInBranchId, false);
      } else if (await BagService.isSealNumberLenght(inputNumber)) {
        resultBag = await this.resultBag(inputNumber, payload.podScanInBranchId, true);
      } else {
        const dataItem = new V2ScanInputNumberBranchVm();
        dataItem.awbNumber = inputNumber;
        dataItem.status = 'error';
        dataItem.message = 'Nomor tidak valid';
        dataItem.trouble = true;
        data.push(dataItem);
      }
      if (resultBag) {
          isBag = true;
          data = resultBag.data;
          dataBag = resultBag.dataBag;
        }
    }

    // get bag number
    if (dataBag && dataBag.bagItemId && payload.bagNumber == '') {
      const bagItem = await BagService.getBagNumber(dataBag.bagItemId);
      if (bagItem) {
        payload.bagNumber =
          bagItem.bag.bagNumber + bagItem.bagSeq.toString().padStart(3, '0');
      }
    }

    const result = new V2WebScanInBranchResponseVm();
    result.bagNumber = payload.bagNumber;
    result.podScanInBranchId = payload.podScanInBranchId;
    result.isBag = isBag;
    result.data = data;
    result.dataBag = dataBag;
    return result;
  }

  static async scanInBagBranch(
    bagData: BagItem,
    bagNumber: string,
    podScanInBranchId: string,
    isSealNumber: boolean,
  ): Promise<WebScanInBagBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInBagBranchResponseVm();

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
      const notScan = bagData.bagItemStatusIdLast != BAG_STATUS.IN_BRANCH ? true : false;
      if (notScan && holdRedis) {
        const notScanBranch = bagData.branchIdNext != permissonPayload.branchId ? true : false;
        if (
          bagData.bagItemStatusIdLast != BAG_STATUS.OUT_HUB ||
          notScanBranch
        ) {
          const desc = notScanBranch ? 'Gerai tidak sesuai' : 'Status bag tidak sesuai';
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
            await BagItem.update({ bagItemId: bagItem.bagItemId }, {
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
                await DoPod.update({ doPodId: doPodDetailBag.doPodId }, {
                  firstDateScanIn: timeNow,
                  lastDateScanIn: timeNow,
                  totalScanInBag: doPodDetailBag.doPod.totalScanInBag,
                  updatedTime: timeNow,
                  userIdUpdated: authMeta.userId,
                });
              } else {
                await DoPod.update({ doPodId: doPodDetailBag.doPodId }, {
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
              podScanInBranchBagObj.bagNumber = bagData.bag.bagNumber;
              podScanInBranchBagObj.totalAwbItem = bagItemsAwb.length;
              podScanInBranchBagObj.totalAwbScan = 0;
              podScanInBranchBagObj.totalDiff = 0;
              podScanInBranchBagObj.sealNumber = bagData.bag.sealNumber ? bagData.bag.sealNumber : null;
              podScanInBranchBagObj.isSealNumberScan = isSealNumber;
              await PodScanInBranchBag.save(podScanInBranchBagObj);

              if (isSealNumber) {
                // update total seal number scan on pod_scan_in_branch
                await transactionEntityManager.increment(
                PodScanInBranch,
                {
                  podScanInBranchId,
                  isDeleted: false,
                },
                'totalSealNumberScan',
                1);
              } else {
                // update total bag scan on pod_scan_in_branch
                await transactionEntityManager.increment(
                PodScanInBranch,
                {
                  podScanInBranchId,
                  isDeleted: false,
                },
                'totalBagScan',
                1);
              }
            });

          }
        }

        // #endregion after scanin
        totalSuccess += 1;
        // remove key holdRedis
        RedisService.del(
          `hold:bag-scanin-branch:${bagData.bagItemId}`,
        );

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
      if (isSealNumber) {
        response.message = `Gabung paket dengan nomor tagseal ${bagNumber} Tidak di Temukan`;
      }

    }

    // TODO: refactoring
    result.totalData = dataItem.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.dataBag = response;
    result.data = dataItem;

    return result;
  }

  // NOTE: new way scan in awb branch
  static async scanInAwbBranch(
    awbNumber: string,
    bagNumber: string,
    podScanInBranchId: string,
    usePriority: boolean = false
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
      const finalStatusIn = [AWB_STATUS.IN_BRANCH, AWB_STATUS.ANT];
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
          })
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
              }else{
                result.status = 'error';
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
      }
    } else {
      result.message = `Resi ${awbNumber} Tidak di Temukan`;
    }

    return result;
  }
}
