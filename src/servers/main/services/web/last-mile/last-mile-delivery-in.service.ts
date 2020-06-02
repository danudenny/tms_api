// #region import
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../../shared/orm-entity/bag-item-awb';
import { DoPod } from '../../../../../shared/orm-entity/do-pod';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { PodScanInBranch } from '../../../../../shared/orm-entity/pod-scan-in-branch';
import { PodScanInBranchBag } from '../../../../../shared/orm-entity/pod-scan-in-branch-bag';
import { PodScanInBranchDetail } from '../../../../../shared/orm-entity/pod-scan-in-branch-detail';
import {
    DoPodDetailBagRepository,
} from '../../../../../shared/orm-repository/do-pod-detail-bag.repository';
import { AuthService } from '../../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../../shared/services/awb-trouble.service';
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
// #endregion
export class LastMileDeliveryInService {

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

    const regexNumber = /^[0-9]+$/;

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
      // Check type scan value number
      inputNumber = inputNumber.trim();
      if (inputNumber.length == 12 && regexNumber.test(inputNumber)) {
        // awb number
        const resultAwb = await this.scanInAwbBranch(
          inputNumber,
          payload.bagNumber,
          payload.podScanInBranchId,
        );
        const dataItem = new ScanInputNumberBranchVm();
        dataItem.awbNumber = resultAwb.awbNumber;
        dataItem.status = resultAwb.status;
        dataItem.message = resultAwb.message;
        dataItem.trouble = resultAwb.trouble;
        data.push(dataItem);

        dataBag = resultAwb.dataBag;
      } else if (
        inputNumber.length == 10 && regexNumber.test(inputNumber.substring(7, 10))
      ) {
        // check valid bag
        const bagData = await BagService.validBagNumber(inputNumber);
        const resultBag = await this.scanInBagBranch(
          bagData,
          inputNumber,
          payload.podScanInBranchId,
        );
        if (resultBag) {
          isBag = true;
          data = resultBag.data;
          dataBag = resultBag.dataBag;
        }
      } else {
        const dataItem = new ScanInputNumberBranchVm();
        dataItem.awbNumber = inputNumber;
        dataItem.status = 'error';
        dataItem.message = 'Nomor tidak valid';
        dataItem.trouble = true;
        data.push(dataItem);
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

  static async scanInBagBranch(
    bagData: BagItem,
    bagNumber: string,
    podScanInBranchId: string,
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
        const statusCode = await AwbService.awbStatusGroup(
          awb.awbStatusIdLast,
        );
        if (statusCode != 'OUT') {
          // TODO: AUTO UPDATE STATUS ??
          result.status = 'warning';
          // save data to awb_trouble
          const branchName = awb.branchLast ? awb.branchLast.branchName : '';
          await AwbTroubleService.fromScanOut(
            awbNumber,
            branchName,
            awb.awbStatusIdLast,
          );
        }

        // save data to table pod_scan_id
        // TODO: find by check data
        let bagId = 0;
        let bagItemId = 0;

        const podScanInBranchDetail = await PodScanInBranchDetail.findOne({
          where: {
            podScanInBranchId,
            awbItemId: awb.awbItemId,
            isDeleted: false,
          },
        });

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
            // ONLY SCAN AWB NUMBER ===========================================
            // NOTE: if awb item attr bagItemLast not null
            // find bag if lazy scan bag number
            // #region check bag if null
            // bagId = awb.bagItemLast ? awb.bagItemLast.bagItemId : 0;
            // bagItemId = awb.bagItemLast ? awb.bagItemLast.bagItemId : 0;
            // const podScanInBranchBag = await PodScanInBranchBag.findOne({
            //   where: {
            //     podScanInBranchId,
            //     bagId,
            //     bagItemId,
            //     isDeleted: false,
            //   },
            // });

            // if (podScanInBranchBag) {
            //   // set data bag
            //   bagId = podScanInBranchBag.bagId;
            //   bagItemId = podScanInBranchBag.bagItemId;

            //   // NOTE: check doPodDetail ====================================
            //   const doPodDetail = await DoPodDetail.findOne({
            //     where: {
            //       awbItemId: awb.awbItemId,
            //       isScanIn: false,
            //       isDeleted: false,
            //     },
            //   });
            //   if (doPodDetail) {
            //     // Update Data doPodDetail
            //     await DoPodDetail.update(doPodDetail.doPodDetailId, {
            //       isScanIn: true,
            //       updatedTime: moment().toDate(),
            //       userIdUpdated: authMeta.userId,
            //     });
            //   }
            //   // ============================================================

            //   dataBag.bagId = bagId;
            //   dataBag.bagItemId = bagItemId;
            //   dataBag.status = 'ok';
            //   dataBag.message = 'Success';
            //   dataBag.trouble = false;

            //   result.dataBag = dataBag;
            // } else {
            //   result.status = 'warning';
            //   result.message = `Resi ${awbNumber} tidak ada dalam gabung paket`;
            // }
            // #endregion check bag if null

            // handle awb number only with not have bag number
            result.status = 'warning';
            result.message = `Resi ${awbNumber} tidak ada dalam gabung paket`;
          }

          // Create Awb Trouble if status warning
          if (result.status == 'warning') {
            await AwbTroubleService.fromScanIn(
              awbNumber,
              awb.awbStatusIdLast,
              result.message,
            );
            result.trouble = true;
          }

          const podScanInBranchDetailObj = PodScanInBranchDetail.create();
          podScanInBranchDetailObj.podScanInBranchId = podScanInBranchId;
          podScanInBranchDetailObj.bagId = bagId;
          podScanInBranchDetailObj.bagItemId = bagItemId;
          podScanInBranchDetailObj.awbId = awb.awbItem.awbId;
          podScanInBranchDetailObj.awbItemId = awb.awbItemId;
          podScanInBranchDetailObj.awbNumber = awbNumber;
          podScanInBranchDetailObj.bagNumber = bagNumber;
          podScanInBranchDetailObj.isTrouble = result.trouble;
          await PodScanInBranchDetail.save(podScanInBranchDetailObj);

          // AFTER Scan IN ===============================================
          // #region after scanin
          await AwbService.updateAwbAttr(
            awb.awbItemId,
            AWB_STATUS.IN_BRANCH,
            null,
          );

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
