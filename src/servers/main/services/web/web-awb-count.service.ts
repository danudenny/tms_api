import { Injectable } from '@nestjs/common';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { WebScanInBranchVm, WebVerificationAwbVm, WebVerificationBagVm } from '../../models/web-scanin-branch.vm';
import { WebScanInBranchResponseVm, VerificationAwbResponseVm, WebScanInBranchResponseNewVm } from '../../models/web-scanin-branch.response.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import moment = require('moment');
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { PodFilter } from '../../../../shared/orm-entity/pod-filter';
import { WebScanInValidateBagVm } from '../../models/web-scanin-bag.vm';
import { WebScanInValidateBagResponseVm } from '../../models/web-scanin-awb.response.vm';
import { PodFilterDetail } from '../../../../shared/orm-entity/pod-filter-detail';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { User } from '../../../../shared/orm-entity/user';
import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { DropoffSortation } from '../../../../shared/orm-entity/dropoff_sortation';
import { DropoffSortationDetail } from '../../../../shared/orm-entity/dropoff_sortation_detail';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { AwbAttr } from '../../../../shared/orm-entity/awb-attr';
import { BagItemHistoryQueueService } from '../../../queue/services/bag-item-history-queue.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';

@Injectable()
export class WebAwbCountService {
  constructor() {}

  public static async scanInBranch(
    payload: WebScanInBranchVm,
  ): Promise<WebScanInBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInBranchResponseVm();

    const representativeCode = payload.representativeCode;
    const representativeData = await DeliveryService.validBranchCode(representativeCode);
    const response = {
      reperesentativeTo: representativeData.representativeId,
      podFilterId: null,
      status: 'ok',
      trouble: false,
      message: 'Success',
    };

    if (representativeData) {
      const holdRedis = await RedisService.locking(
        `hold:branchscanin:${representativeData.representativeId}`,
        'locking',
      );
      if (holdRedis) {
        // AFTER Scan ===============================================

        // #region after scan
        // save data to table pod_filter
        // TODO: to be review
        const podFilter = PodFilter.create();
        podFilter.podFilterCode = await CustomCounterCode.podFilter(timeNow);
        podFilter.startDateTime = timeNow;
        podFilter.endDateTime = timeNow;
        podFilter.isActive = true;
        podFilter.userIdScan = authMeta.userId;
        podFilter.branchIdScan = permissonPayload.branchId;
        podFilter.totalBagItem = 0;
        podFilter.userIdCreated = authMeta.userId;
        podFilter.createdTime = timeNow;
        podFilter.updatedTime = timeNow;
        podFilter.isDeleted = false;
        podFilter.representativeIdFilter = representativeData.representativeId;
        await PodFilter.save(podFilter);
        // #endregion after scanin

        // remove key holdRedis
        RedisService.del(`hold:branchscanin:${representativeData.representativeId}`);

        const podFilterData = await DeliveryService.getPodFilter(podFilter.podFilterCode);
        response.podFilterId = podFilterData.podFilterId;
      }
    } else {
      response.status = 'error';
      response.message = `Perwakilan "${representativeCode}" Tidak di Temukan`;
    }
    dataItem.push({
      ...response,
    });
    result.data = dataItem;

    return result;
  }

  public static async scanInValidateBag(
    payload: WebScanInValidateBagVm,
  ): Promise<WebScanInValidateBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInValidateBagResponseVm();

    const response = {
      bagNumber: payload.bagNumber,
      totalBagItem: 0,
      podFilterDetail: null,
      status: 'ok',
      trouble: false,
      message: 'Success',
    };

    const bagData = await DeliveryService.validBagNumber(payload.bagNumber);
    const representativeData = await DeliveryService.validBranchId(bagData.bag.representativeIdTo);
    const PodFilterData = await DeliveryService.validBagPodFilterId(bagData.bagItemId);

    if (PodFilterData) {
      response.status = 'error';
      response.message = `Gabung Paket "${payload.bagNumber}" sudah pernah di Scan !`;
    } else {
      if (bagData.bag.representativeIdTo !== payload.representativeIdTo) {
        response.status = 'error';
        response.message = `Gabung Paket Tidak sesuai, Gabung Paket ini untuk Perwakilan "${representativeData.representativeName}" !`;
      } else {
        const holdRedis = await RedisService.locking(
          `hold:bagscaninvalidate:${bagData.bagItemId}`,
          'locking',
        );
        if (holdRedis) {
          // AFTER Scan ===============================================

          // #region after scan
          // save data to table pod_filter
          // TODO: to be review
          const getTotalItemAwb = await BagItemAwb.findAndCount({
            where: {
              bagItemId: bagData.bagItemId,
            },
          });
          response.totalBagItem = getTotalItemAwb[1];

          const podFilterDetail = PodFilterDetail.create();
          podFilterDetail.podFilterId = payload.podFilterId;
          podFilterDetail.scanDateTime = timeNow;
          podFilterDetail.isActive = true;
          podFilterDetail.bagItemId = bagData.bagItemId;
          podFilterDetail.userIdCreated = authMeta.userId;
          podFilterDetail.createdTime = timeNow;
          podFilterDetail.userIdUpdated = authMeta.userId;
          podFilterDetail.updatedTime = timeNow;
          podFilterDetail.isDeleted = false;
          podFilterDetail.totalAwbItem = getTotalItemAwb[1];
          podFilterDetail.totalAwbFiltered = 0;
          podFilterDetail.totalAwbNotInBag = 0;
          podFilterDetail.startDateTime = timeNow;
          podFilterDetail.endDateTime = timeNow;
          await PodFilterDetail.save(podFilterDetail);

          response.podFilterDetail = podFilterDetail.podFilterDetailId;

          // update bagItem
          const bagItem = await BagItem.findOne({
            where: {
              bagItemId: bagData.bagItemId,
            },
          });
          bagItem.bagItemStatusIdLast = 4000;
          bagItem.updatedTime = timeNow;
          bagItem.userIdUpdated = authMeta.userId;
          BagItem.save(bagItem);

          // update PodFilter
          const podFilter = await PodFilter.findOne({
            where: {
              podFilterId: payload.podFilterId,
            },
          });
          podFilter.totalBagItem += 1;
          podFilter.endDateTime = timeNow;
          podFilter.updatedTime = timeNow;
          podFilter.userIdUpdated = authMeta.userId;
          PodFilter.save(podFilter);

          // #endregion after scanin

          // remove key holdRedis
          RedisService.del(`hold:bagscaninvalidate:${bagData.bagItemId}`);
        }
      }
    }

    dataItem.push({
      ...response,
    });
    result.data = dataItem;

    return result;
  }

  public static async verificationAwb(
    payload: WebVerificationAwbVm,
  ): Promise<VerificationAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new VerificationAwbResponseVm();

    const totalAwbInput = payload.totalAwb;
    const desc = payload.description;
    const isMatch = payload.isMatch;
    const podFilterDetail = payload.podFilterDetailId;
    const nik = payload.nik;
    const podFilterIds = payload.podFilterId;
    const bagNumbers: string = payload.bagNumber.substring(0, 7);

    const response = {
      status: 'ok',
      trouble: false,
      message: 'Success',
    };

    if (isMatch) {
      // update PodFilterDetail
      const podFilterDetailData = await PodFilterDetail.findOne({
        where: {
          podFilterDetailId: podFilterDetail,
        },
      });
      podFilterDetailData.totalAwbFiltered = totalAwbInput;
      podFilterDetailData.endDateTime = timeNow;
      podFilterDetailData.userIdUpdated = authMeta.userId;
      podFilterDetailData.updatedTime = timeNow;
      PodFilterDetail.save(podFilterDetailData);
    } else {
      const userData = await User.findOne({
        where: {
          employee_id: nik,
        },
      });
      if (userData) {
        const getUserId = userData.userId;
        const podFilter = await PodFilter.findOne({
          where: {
            podFilterId: podFilterIds,
          },
        });
        if (podFilter.userIdScan === (getUserId)) {
          // update PodFilterDetail
          const podFilterDetailData = await PodFilterDetail.findOne({
            where: {
              podFilterDetailId: podFilterDetail,
            },
          });
          const totalAwbItem = podFilterDetailData.totalAwbItem;
          podFilterDetailData.totalAwbFiltered = totalAwbInput;
          podFilterDetailData.totalAwbNotInBag = totalAwbItem - totalAwbInput;
          podFilterDetailData.endDateTime = timeNow;
          podFilterDetailData.userIdUpdated = authMeta.userId;
          podFilterDetailData.updatedTime = timeNow;
          PodFilterDetail.save(podFilterDetailData);

          // insert bagTrouble
          const bagTrouble = BagTrouble.create();
          bagTrouble.bagStatusId = 4000;
          bagTrouble.bagNumber = bagNumbers;
          bagTrouble.employeeId = (userData.userId);
          bagTrouble.branchId = permissonPayload.branchId;
          bagTrouble.userIdCreated = authMeta.userId;
          bagTrouble.createdTime = timeNow;
          bagTrouble.userIdUpdated = authMeta.userId;
          bagTrouble.updatedTime = timeNow;
          bagTrouble.isDeleted = false;
          bagTrouble.description = desc;
          bagTrouble.bagTroubleStatus = 100;
          bagTrouble.bagTroubleCode = await CustomCounterCode.bagTrouble(timeNow);
        } else {
          response.status = 'error';
          response.message = `Code Verifikasi Tidak Sesuai !`;
        }
      } else {
        response.status = 'error';
        response.message = `Code Verifikasi Tidak Ditemukan !`;
      }
    }
    dataItem.push({
      ...response,
    });
    result.data = dataItem;

    return result;
  }

  public static async scanInValidateBranch(
    payload: WebScanInBranchVm,
  ): Promise<WebScanInBranchResponseNewVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanInBranchResponseNewVm();

    const representativeCode = payload.representativeCode;
    const representativeData = await DeliveryService.validBranchCode(representativeCode);
    const response = {
      reperesentativeTo: null,
      status: 'ok',
      trouble: false,
      message: 'Success',
    };

    if (!representativeData) {
      response.status = 'error';
      response.message = `Perwakilan "${representativeCode}" Tidak di Temukan`;
    } else {
      response.reperesentativeTo = representativeData.representativeId;
    }
    dataItem.push({
      ...response,
    });
    result.data = dataItem;

    return result;
  }

  public static async verificationBag(
    payload: WebVerificationBagVm,
  ): Promise<VerificationAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new VerificationAwbResponseVm();

    const representativeId = payload.representativeIdTo;

    const bagData = await DeliveryService.validBagNumber(payload.bagNumber);

    const response = {
      status: 'ok',
      trouble: false,
      message: 'Success',
    };

    if (bagData) {
      const representativeIdTo = bagData.bag.representativeIdTo;
      const representativeData = await DeliveryService.validBranchId(representativeIdTo);

      if (representativeId === representativeIdTo) {
        const holdRedis = await RedisService.locking(
          `hold:bagscanverification:${bagData.bagItemId}`,
          'locking',
        );
        if (holdRedis) {
          // AFTER Scan ===============================================

          // #region after scan
          // update bagItem
          const bagItem = await BagItem.findOne({
            where: {
              bagItemId: bagData.bagItemId,
            },
          });
          bagItem.bagItemStatusIdLast = 4000;
          bagItem.updatedTime = timeNow;
          bagItem.userIdUpdated = authMeta.userId;
          BagItem.save(bagItem);

          // NOTE: background job for insert bag item history
          BagItemHistoryQueueService.addData(
            bagItem.bagItemId,
            4000,
            permissonPayload.branchId,
            authMeta.userId,
          );

          // get BagItemAwb and Count
          const getAllBagAwb = await BagItemAwb.findAndCount({
            where: {
              bagItemId: bagData.bagItemId,
            },
          });

          // insert DropOffSortation
          const dropoffSortation = DropoffSortation.create();
          dropoffSortation.branchId = permissonPayload.branchId;
          dropoffSortation.representativeId = representativeId;
          dropoffSortation.bagId = bagData.bag.bagId;
          dropoffSortation.bagItemId = bagData.bagItemId;
          dropoffSortation.bagNumber = payload.bagNumber;
          dropoffSortation.userIdUpdated = authMeta.userId;
          dropoffSortation.updatedTime = timeNow;
          dropoffSortation.userIdCreated = authMeta.userId;
          dropoffSortation.createdTime = timeNow;
          dropoffSortation.isDeleted = false;
          await DropoffSortation.save(dropoffSortation);

          const dropOffId = dropoffSortation.dropoffSortationId;

          // TODO: to be refactoring
          // Insert All BagAwbItem to DropOffSortationDetail
          getAllBagAwb[0].forEach(async data => {
            const awbAttr = await AwbAttr.findOne({
              where: {
                awbNumber: data.awbNumber,
              },
            });

            // insert DropOffSortationDetail
            const dropoffSortationDetail = DropoffSortationDetail.create();
            dropoffSortationDetail.dropoffSortationId = dropOffId;
            dropoffSortationDetail.awbId = awbAttr.awbId;
            dropoffSortationDetail.awbItemId = data.awbItemId;
            dropoffSortationDetail.awbNumber = data.awbNumber;
            dropoffSortationDetail.userIdUpdated = authMeta.userId;
            dropoffSortationDetail.updatedTime = timeNow;
            dropoffSortationDetail.userIdCreated = authMeta.userId;
            dropoffSortationDetail.createdTime = timeNow;
            dropoffSortationDetail.isDeleted = false;
            await DropoffSortationDetail.save(dropoffSortationDetail);

            // TODO: to be fix
            // const awbItemAttr = await AwbItemAttr.findOne({
            //   where: {
            //     awbItemId: data.awbItemId,
            //   },
            // });
            // // update status AwbItemAttr
            // awbItemAttr.awbStatusIdLast = 2600;
            // awbItemAttr.updatedTime = timeNow;
            // await AwbItemAttr.save(awbItemAttr);

            // add awb history with background process
            DoPodDetailPostMetaQueueService.createJobByDoSortBag(
              data.awbItemId,
              permissonPayload.branchId,
              authMeta.userId,
            );
          });

          // #endregion after scanin

          // remove key holdRedis
          RedisService.del(`hold:bagscanverification:${bagData.bagItemId}`);
        }
      } else {
        response.status = 'error';
        response.message = `Gabung Paket Tidak sesuai, Gabung Paket ini untuk Perwakilan "${representativeData.representativeName}" !`;
      }
    } else {
      response.status = 'error';
      response.message = `Gabung Paket "${payload.bagNumber}" Tidak Ditemukan !`;
    }

    dataItem.push({
      ...response,
    });
    result.data = dataItem;

    return result;
  }
}
