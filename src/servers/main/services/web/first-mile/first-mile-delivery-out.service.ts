// #region import
import { WebScanOutCreateVm, WebScanOutEditHubVm, WebScanOutEditVm } from '../../../models/web-scan-out.vm';
import { WebScanOutCreateResponseVm } from '../../../models/web-scan-out-response.vm';
import { DoPod } from '../../../../../shared/orm-entity/do-pod';
import { AuthService } from '../../../../../shared/services/auth.service';
import moment = require('moment');
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { BagService } from '../../v1/bag.service';
import { DoPodDetailBag } from '../../../../../shared/orm-entity/do-pod-detail-bag';
import { IsNull, createQueryBuilder } from 'typeorm';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { AwbService } from '../../v1/awb.service';
import { DeliveryService } from '../../../../../shared/services/delivery.service';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
// #endregion

export class FirstMileDeliveryOutService {

  /**
   * Create DO POD
   * with type: Transit (Internal/3PL) and Criss Cross
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  static async scanOutCreate(
    payload: WebScanOutCreateVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const result = new WebScanOutCreateResponseVm();

    // create do_pod (Surat Jalan)
    const doPod = DoPod.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const doPodDateTime = moment(payload.doPodDateTime).toDate();

    doPod.doPodCode = await CustomCounterCode.doPod(doPodDateTime);
    doPod.doPodType = payload.doPodType;
    const method =
      payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000;
    doPod.doPodMethod = method; // internal or 3PL/Third Party
    payload.doPodMethod && payload.doPodMethod == '3pl'
      ? (doPod.partnerLogisticId = payload.partnerLogisticId || 1)
      : (doPod.partnerLogisticId = null);
    // doPod.partnerLogisticId = payload.partnerLogisticId || null;
    doPod.branchIdTo = payload.branchIdTo || null;
    doPod.userIdDriver = payload.userIdDriver || null;
    doPod.doPodDateTime = doPodDateTime;
    doPod.vehicleNumber = payload.vehicleNumber || null;
    doPod.description = payload.desc || null;

    doPod.branchId = permissonPayload.branchId;
    doPod.transactionStatusId = 800; // BRANCH

    // await for get do pod id
    await DoPod.save(doPod);

    // TODO: insert table audit history

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodId = doPod.doPodId;

    return result;
  }

  /**
   * Edit DO POD AWB
   * with type: Transit (Internal/3PL) and Criss Cross
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutEdit(
    payload: WebScanOutEditVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebScanOutCreateResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    let totalAdd = 0;
    let totalRemove = 0;
    // edit do_pod (Surat Jalan)
    const doPod = await DoPod.findOne({
      where: {
        doPodId: payload.doPodId,
        totalScanIn: IsNull(),
        isDeleted: false,
      },
    });
    if (doPod) {
      // looping data list add awb number
      if (payload.addAwbNumber && payload.addAwbNumber.length) {
        for (const addAwb of payload.addAwbNumber) {
          // find awb_item_attr
          const awb = await AwbService.validAwbNumber(addAwb);

          const doPodDetail = DoPodDetail.create();
          doPodDetail.doPodId = payload.doPodId;
          doPodDetail.awbItemId = awb.awbItemId;
          doPodDetail.transactionStatusIdLast = 800;
          doPodDetail.isScanOut = true;
          doPodDetail.scanOutType = 'awb';
          await DoPodDetail.save(doPodDetail);

          // awb_item_attr and awb_history ??
          await AwbService.updateAwbAttr(
            awb.awbItemId,
            doPod.branchIdTo,
            AWB_STATUS.OUT_BRANCH,
          );

          // TODO: need refactoring
          // NOTE: queue by Bull
          DoPodDetailPostMetaQueueService.createJobByScanOutAwb(
            doPodDetail.doPodDetailId,
          );
        }
        totalAdd = payload.addAwbNumber.length;
      }

      // looping data list remove awb number
      if (payload.removeAwbNumber && payload.removeAwbNumber.length) {
        for (const addAwb of payload.removeAwbNumber) {
          const awb = await AwbService.validAwbNumber(addAwb);
          const doPodDetail = await DoPodDetail.findOne({
            where: {
              doPodId: payload.doPodId,
              awbItemId: awb.awbItemId,
              isDeleted: false,
            },
          });

          if (doPodDetail) {
            DoPodDetail.update(doPodDetail.doPodDetailId, {
              isDeleted: true,
            });
            // NOTE: update awb_item_attr and awb_history
            await AwbService.updateAwbAttr(
              awb.awbItemId,
              doPod.branchIdTo,
              AWB_STATUS.IN_BRANCH,
            );
            // TODO: need refactoring
            // NOTE: queue by Bull
            DoPodDetailPostMetaQueueService.createJobByScanInAwb(
              doPodDetail.doPodDetailId,
            );
          }
        }
        totalRemove = payload.removeAwbNumber.length;
      }

      const totalItem = await FirstMileDeliveryOutService.getTotalDetailById(doPod.doPodId);
      const totalScanOut = doPod.totalScanOutAwb + totalAdd - totalRemove;
      // update data
      // NOTE: (current status) (next feature, ada scan berangkat dan tiba)
      const updateDoPod = {
        doPodMethod:
          payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000,
        partnerLogisticId: payload.partnerLogisticId,
        branchIdTo: payload.branchIdTo,
        userIdDriver: payload.userIdDriver,
        vehicleNumber: payload.vehicleNumber,
        description: payload.desc,
        transcationStatusIdLast: 1100,
        branchId: permissonPayload.branchId,
        userId: authMeta.userId,
        totalItem,
        totalScanOut,
      };
      await DoPod.update(doPod.doPodId, updateDoPod);

      // TODO: insert table audit history

      result.status = 'ok';
      result.message = 'success';
    } else {
      result.status = 'error';
      result.message = 'Surat Jalan tidak valid/Sudah pernah Scan In';
    }
    result.doPodId = payload.doPodId;
    return result;
  }

  /**
   * Edit DO POD BAG
   * with type: Transit (Internal/3PL) and Criss Cross
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutEditBag(
    payload: WebScanOutEditHubVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebScanOutCreateResponseVm();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    let totalAdd = 0;
    let totalRemove = 0;

    // edit do_pod (Surat Jalan)
    const doPod = await DoPod.findOne({
      where: {
        doPodId: payload.doPodId,
        totalScanIn: IsNull(),
        isDeleted: false,
      },
    });
    if (doPod) {
      // looping data list add bag number
      if (payload.addBagNumber && payload.addBagNumber.length) {
        for (const addBag of payload.addBagNumber) {
          // find bag
          const bagData = await BagService.validBagNumber(addBag);
          if (bagData) {
            // NOTE: create DoPodDetailBag
            const doPodDetailBag = DoPodDetailBag.create();
            doPodDetailBag.doPodId = doPod.doPodId;
            doPodDetailBag.bagId = bagData.bagId;
            doPodDetailBag.bagItemId = bagData.bagItemId;
            doPodDetailBag.transactionStatusIdLast = 1000;
            await DoPodDetailBag.save(doPodDetailBag);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            const bagItem = await BagItem.findOne({
              where: {
                bagItemId: bagData.bagItemId,
              },
            });
            if (bagItem) {
              BagItem.update(bagItem.bagItemId, {
                bagItemStatusIdLast: 1000,
                branchIdLast: doPod.branchId,
                branchIdNext: doPod.branchIdTo,
                updatedTime: timeNow,
                userIdUpdated: authMeta.userId,
              });

              // NOTE: Loop data bag_item_awb for update status awb
              // and create do_pod_detail (data awb on bag)
              // TODO: need to refactor
              await BagService.statusOutBranchAwbBag(
                bagData.bagId,
                bagData.bagItemId,
                doPod.doPodId,
                doPod.branchIdTo,
                doPod.userIdDriver,
                doPod.doPodType,
              );
            }
            // #endregion
          }
        }
        totalAdd = payload.addBagNumber.length;
      }
      // looping data list remove bag number
      if (payload.removeBagNumber && payload.removeBagNumber.length) {
        for (const removeBag of payload.removeBagNumber) {
          const bagData = await BagService.validBagNumber(removeBag);

          if (bagData) {
            const doPodDetailBag = await DoPodDetailBag.findOne({
              where: {
                doPodId: payload.doPodId,
                bagItemId: bagData.bagItemId,
                isDeleted: false,
              },
            });

            if (doPodDetailBag) {
              DoPodDetailBag.update(doPodDetailBag.doPodDetailBagId, {
                isDeleted: true,
              });

              // TODO: need reviewed
              // NOTE: Loop data bag_item_awb for update status awb
              // const bagItemsAwb = await BagItemAwb.find({
              //   where: {
              //     bagItemId: bag.bagItemId,
              //     isDeleted: false,
              //   },
              // });
              // if (bagItemsAwb && bagItemsAwb.length) {
              //   for (const itemAwb of bagItemsAwb) {
              //     if (itemAwb.awbItemId) {
              //       // TODO: update awb_item_attr and awb_history ??
              //       //==========================================================
              //     }
              //   }
              // }
            }
          }
        }
        totalRemove = payload.removeBagNumber.length;
      }

      const totalItem = await FirstMileDeliveryOutService.getTotalDetailById(doPod.doPodId);
      const totalScanOut = doPod.totalScanOutAwb + totalAdd - totalRemove;
      // update data
      // NOTE: (current status) (next feature, ada scan berangkat dan tiba)
      const updateDoPod = {
        doPodMethod:
          payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000,
        partnerLogisticId: payload.partnerLogisticId,
        branchIdTo: payload.branchIdTo,
        userIdDriver: payload.userIdDriver,
        vehicleNumber: payload.vehicleNumber,
        description: payload.desc,
        transcationStatusIdLast: 1100,
        branchId: permissonPayload.branchId,
        userId: authMeta.userId,
        totalItem,
        totalScanOut,
      };
      await DoPod.update(doPod.doPodId, updateDoPod);

      // TODO: insert table audit history

      result.status = 'ok';
      result.message = 'success';
    } else {
      result.status = 'error';
      result.message = 'Surat Jalan tidak valid';
    }
    result.doPodId = payload.doPodId;
    return result;
  }

  // private
  private static async getTotalDetailById(doPodId: string) {
    const qb = createQueryBuilder();
    qb.from('do_pod_detail', 'do_pod_detail');
    qb.where('do_pod_detail.do_pod_id = :doPodId', {
      doPodId,
    });
    return await qb.getCount();
  }
}
