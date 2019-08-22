// #region import
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, IsNull } from 'typeorm';
import moment = require('moment');

import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDetail } from '../../../../shared/orm-entity/do-pod-detail';
import { DoPodRepository } from '../../../../shared/orm-repository/do-pod.repository';
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../shared/services/awb-trouble.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { DoPodDetailPostMetaQueueService } from '../../../queue/services/do-pod-detail-post-meta-queue.service';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import {
  WebScanOutAwbListResponseVm,
  WebScanOutAwbResponseVm,
  WebScanOutBagResponseVm,
  WebScanOutCreateResponseVm,
  WebScanOutDeliverListResponseVm,
  ScanAwbVm,
  ScanBagVm,
  WebScanOutResponseForEditVm,
  WebScanOutResponseForPrintVm,
} from '../../models/web-scan-out-response.vm';
import {
  WebScanOutAwbVm,
  WebScanOutBagVm,
  WebScanOutCreateDeliveryVm,
  WebScanOutCreateVm,
  WebScanOutAwbValidateVm,
  WebScanOutEditVm,
  WebScanOutEditHubVm,
  WebScanOutBagValidateVm,
  WebScanOutLoadForEditVm,
  WebScanOutBagForPrintVm,
} from '../../models/web-scan-out.vm';
// #endregion

@Injectable()
export class WebDeliveryOutService {
  constructor(
    @InjectRepository(DoPodRepository)
    private readonly doPodRepository: DoPodRepository,
  ) {}

  /**
   * Create DO POD
   * with type: Transit (Internal/3PL) and Criss Cross
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutCreate(
    payload: WebScanOutCreateVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebScanOutCreateResponseVm();

    // create do_pod (Surat Jalan)
    const doPod = this.doPodRepository.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const doPodDateTime = moment(payload.doPodDateTime).toDate();

    doPod.doPodCode = await CustomCounterCode.doPod(doPodDateTime);
    doPod.doPodType = payload.doPodType;
    const method =
      payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000;
    doPod.doPodMethod = method; // internal or 3PL/Third Party
    payload.doPodMethod && payload.doPodMethod == '3pl' ? doPod.partnerLogisticId = payload.partnerLogisticId || 1 : doPod.partnerLogisticId = null;
    // doPod.partnerLogisticId = payload.partnerLogisticId || null;
    doPod.branchIdTo = payload.branchIdTo || null;

    // doPod.userIdDriver = payload.
    doPod.employeeIdDriver = payload.employeeIdDriver || null;
    doPod.doPodDateTime = doPodDateTime;

    doPod.vehicleNumber = payload.vehicleNumber || null;
    doPod.description = payload.desc || null;

    // NOTE: (current status) (next feature, ada scan berangkat dan tiba)
    doPod.doPodStatusIdLast = 1000; // created
    doPod.branchId = permissonPayload.branchId;
    doPod.userId = authMeta.userId;

    // await for get do pod id
    await this.doPodRepository.save(doPod);

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodId = Number(doPod.doPodId);

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
          const awb = await DeliveryService.validAwbNumber(addAwb);
          // add data do_pod_detail
          const doPodDetail = DoPodDetail.create();
          doPodDetail.doPodId = payload.doPodId;
          doPodDetail.awbItemId = awb.awbItemId;
          doPodDetail.doPodStatusIdLast = 1000;
          doPodDetail.isScanOut = true;
          doPodDetail.scanOutType = 'awb';
          await DoPodDetail.save(doPodDetail);

          // awb_item_attr and awb_history ??
          await DeliveryService.updateAwbAttr(
            awb.awbItemId,
            doPod.branchIdTo,
            AWB_STATUS.OUT_BRANCH,
          );

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
          const awb = await DeliveryService.validAwbNumber(addAwb);
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
            await DeliveryService.updateAwbAttr(
              awb.awbItemId,
              doPod.branchIdTo,
              AWB_STATUS.IN_BRANCH,
            );
            // NOTE: queue by Bull
            DoPodDetailPostMetaQueueService.createJobByScanInAwb(
              doPodDetail.doPodDetailId,
            );
          }
        }
        totalRemove = payload.removeAwbNumber.length;
      }

      const totalItem = await this.getTotalDetailById(doPod.doPodId);
      const totalScanOut = doPod.totalScanOut + totalAdd - totalRemove;
      // update data
      // NOTE: (current status) (next feature, ada scan berangkat dan tiba)
      const updateDoPod = {
        doPodMethod:
          payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000,
        partnerLogisticId: payload.partnerLogisticId,
        branchIdTo: payload.branchIdTo,
        employeeIdDriver: payload.employeeIdDriver,
        vehicleNumber: payload.vehicleNumber,
        description: payload.desc,
        doPodStatusIdLast: 1100,
        branchId: permissonPayload.branchId,
        userId: authMeta.userId,
        totalItem,
        totalScanOut,
      };
      await DoPod.update(doPod.doPodId, updateDoPod);

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
  async scanOutEditHub(
    payload: WebScanOutEditHubVm,
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
      // looping data list add bag number
      if (payload.addBagNumber && payload.addBagNumber.length) {
        for (const addBag of payload.addBagNumber) {
          // find bag
          const bag = await DeliveryService.validBagNumber(addBag);
          // add data do_pod_detail
          const doPodDetail = DoPodDetail.create();
          doPodDetail.doPodId = payload.doPodId;
          doPodDetail.bagItemId = bag.bagItemId;
          doPodDetail.doPodStatusIdLast = 1000;
          doPodDetail.isScanOut = true;
          doPodDetail.scanOutType = 'bag';
          await DoPodDetail.save(doPodDetail);

          // NOTE: Loop data bag_item_awb for update status awb
          const bagItemsAwb = await BagItemAwb.find({
            where: {
              bagItemId: bag.bagItemId,
              isDeleted: false,
            },
          });

          if (bagItemsAwb && bagItemsAwb.length) {
            for (const itemAwb of bagItemsAwb) {
              if (itemAwb.awbItemId) {
                await DeliveryService.updateAwbAttr(
                  itemAwb.awbItemId,
                  doPod.branchIdTo,
                  AWB_STATUS.OUT_HUB,
                );
                // NOTE: queue by Bull
                DoPodDetailPostMetaQueueService.createJobByScanOutBag(
                  doPodDetail.doPodDetailId,
                  itemAwb.awbItemId,
                );
              }
            }
          }
        }
        totalAdd = payload.addBagNumber.length;
      }
      // looping data list remove bag number
      if (payload.removeBagNumber && payload.removeBagNumber.length) {
        for (const removeBag of payload.removeBagNumber) {
          const bag = await DeliveryService.validBagNumber(removeBag);
          const doPodDetail = await DoPodDetail.findOne({
            where: {
              doPodId: payload.doPodId,
              bagItemId: bag.bagItemId,
              isDeleted: false,
            },
          });

          if (doPodDetail) {
            DoPodDetail.update(doPodDetail.doPodDetailId, {
              isDeleted: true,
            });

            // NOTE: Loop data bag_item_awb for update status awb
            const bagItemsAwb = await BagItemAwb.find({
              where: {
                bagItemId: bag.bagItemId,
                isDeleted: false,
              },
            });
            if (bagItemsAwb && bagItemsAwb.length) {
              for (const itemAwb of bagItemsAwb) {
                if (itemAwb.awbItemId) {
                  // TODO: update awb_item_attr and awb_history ??
                  // await DeliveryService.updateAwbAttr(
                  //   itemAwb.awbItemId,
                  //   doPod.branchIdTo,
                  //   AWB_STATUS.DO_HUB,
                  // );
                  // // NOTE: queue by Bull
                  // DoPodDetailPostMetaQueueService.createJobByScanInBag(
                  //   itemAwb.awbItemId,
                  //   permissonPayload.branchId,
                  //   authMeta.userId,
                  // );
                }
              }
            }
          }
        }
        totalRemove = payload.removeBagNumber.length;
      }

      const totalItem = await this.getTotalDetailById(doPod.doPodId);
      const totalScanOut = doPod.totalScanOut + totalAdd - totalRemove;
      // update data
      // NOTE: (current status) (next feature, ada scan berangkat dan tiba)
      const updateDoPod = {
        doPodMethod:
          payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000,
        partnerLogisticId: payload.partnerLogisticId,
        branchIdTo: payload.branchIdTo,
        employeeIdDriver: payload.employeeIdDriver,
        vehicleNumber: payload.vehicleNumber,
        description: payload.desc,
        doPodStatusIdLast: 1100,
        branchId: permissonPayload.branchId,
        userId: authMeta.userId,
        totalItem,
        totalScanOut,
      };
      await DoPod.update(doPod.doPodId, updateDoPod);
      // await DoPod.save(doPod);

      result.status = 'ok';
      result.message = 'success';
    } else {
      result.status = 'error';
      result.message = 'Surat Jalan tidak valid';
    }
    result.doPodId = payload.doPodId;
    return result;
  }

  /**
   * Create DO POD Deliver
   * with type: Deliver (Sigesit)
   * @param {WebScanOutCreateDeliveryVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutCreateDelivery(
    payload: WebScanOutCreateDeliveryVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthData();
    const result = new WebScanOutCreateResponseVm();

    // create do_pod_deliver (Surat Jalan Antar sigesit)
    const doPod = DoPodDeliver.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const doPodDateTime = moment(payload.doPodDateTime).toDate();

    // NOTE: Tipe surat (jalan Antar Sigesit)
    doPod.doPodDeliverCode = await CustomCounterCode.doPodDeliver(
      doPodDateTime,
    ); // generate code

    // doPod.userIdDriver = payload.
    doPod.employeeIdDriver = payload.employeeIdDriver || null;
    doPod.doPodDeliverDateTime = doPodDateTime;
    doPod.description = payload.desc || null;

    doPod.branchId = permissonPayload.branchId;
    doPod.userId = authMeta.userId;

    // await for get do pod id
    await DoPodDeliver.save(doPod);

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodId = Number(doPod.doPodDeliverId);

    return result;
  }

  /**
   * Create DO POD Detail
   * with scan awb number
   * @param {WebScanOutAwbVm} payload
   * @returns {Promise<WebScanOutAwbResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutAwb(payload: WebScanOutAwbVm): Promise<WebScanOutAwbResponseVm> {
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };

      const awb = await DeliveryService.validAwbNumber(awbNumber);
      if (awb) {
        const statusCode = await DeliveryService.awbStatusGroup(
          awb.awbStatusIdLast,
        );
        switch (statusCode) {
          case 'OUT':
            // check condition, not scan in yet
            if (awb.branchIdLast == permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah pernah scan out`;
            } else {
              // save data to awb_trouble
              await AwbTroubleService.fromScanOut(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message = `Resi ${awbNumber} belum scan in, mohon untuk` +
              `melakukan scan in terlebih dahulu di gerai` +
              ` - ${awb.branchLast.branchName}`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'IN':
            if (awb.branchIdLast == permissonPayload.branchId) {
              // Add Locking setnx redis
              const holdRedis = await RedisService.locking(
                `hold:scanout:${awb.awbItemId}`,
                'locking',
              );
              if (holdRedis) {
                // NOTE: create data do pod detail per awb number
                const doPodDetail = DoPodDetail.create();
                doPodDetail.doPodId = payload.doPodId;
                doPodDetail.awbItemId = awb.awbItemId;
                doPodDetail.doPodStatusIdLast = 1000;
                doPodDetail.isScanOut = true;
                doPodDetail.scanOutType = 'awb';
                await DoPodDetail.save(doPodDetail);

                // AFTER Scan OUT ===============================================
                // #region after scanout
                const doPod = await DoPod.findOne({
                  where: {
                    doPodId: payload.doPodId,
                    isDeleted: false,
                  },
                });

                // counter total scan in
                doPod.totalScanOut = doPod.totalScanOut + 1;
                if (doPod.totalScanOut == 1) {
                  doPod.firstDateScanOut = timeNow;
                  doPod.lastDateScanOut = timeNow;
                } else {
                  doPod.lastDateScanOut = timeNow;
                }
                await DoPod.save(doPod);
                await DeliveryService.updateAwbAttr(
                  awb.awbItemId,
                  doPod.branchIdTo,
                  AWB_STATUS.OUT_BRANCH,
                );

                // NOTE: queue by Bull
                DoPodDetailPostMetaQueueService.createJobByScanOutAwb(
                  doPodDetail.doPodDetailId,
                );
                // #endregion after scanout
                totalSuccess += 1;
                // remove key holdRedis
                RedisService.del(`hold:scanout:${awb.awbItemId}`);
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = 'Server Busy';
              }
            } else {
              // save data to awb_trouble
              // find scanin before -> (awb_item_attr) unclear
              // trigger current user
              // from do_pod before in ??
              await AwbTroubleService.fromScanOut(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message = `Resi ${awbNumber} milik gerai, ` +
              `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
            }
            break;

          default:
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} tidak dapat SCAN OUT, Harap hubungi kantor pusat`;
            break;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        awbNumber,
        ...response,
      });
    } // end of loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  /**
   * Create DO POD Detail Deliver
   * with scan awb number
   * @param {WebScanOutAwbVm} payload
   * @returns {Promise<WebScanOutAwbResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutAwbDeliver(
    payload: WebScanOutAwbVm,
  ): Promise<WebScanOutAwbResponseVm> {
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const result = new WebScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const awbNumber of payload.awbNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };

      const awb = await DeliveryService.validAwbNumber(awbNumber);
      if (awb) {
        const statusCode = await DeliveryService.awbStatusGroup(
          awb.awbStatusIdLast,
        );

        switch (statusCode) {
          case 'OUT':
            // check condition
            if (awb.branchIdLast == permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah pernah scan out`;
            } else {
              // save data to awb_trouble
              await AwbTroubleService.fromScanOut(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message = `Resi ${awbNumber} belum scan in, mohon untuk` +
              `melakukan scan in terlebih dahulu di gerai` +
              ` - ${awb.branchLast.branchName}`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'IN':
            if (awb.branchIdLast == permissonPayload.branchId) {
              // Add Locking setnx redis
              const holdRedis = await RedisService.locking(
                `hold:scanoutant:${awb.awbItemId}`,
                'locking',
              );
              if (holdRedis) {
                // save table do_pod_detail
                // NOTE: create data do pod detail per awb number
                const doPodDeliverDetail = DoPodDeliverDetail.create();
                doPodDeliverDetail.doPodDeliverId = payload.doPodId;
                doPodDeliverDetail.awbItemId = awb.awbItemId;
                doPodDeliverDetail.awbStatusIdLast = AWB_STATUS.ANT;
                await DoPodDeliverDetail.save(doPodDeliverDetail);

                // AFTER Scan OUT ===============================================
                // #region after scanout

                // Update do_pod
                const doPodDeliver = await DoPodDeliver.findOne({
                  select: ['doPodDeliverId', 'totalAwb'],
                  where: {
                    doPodDeliverId: payload.doPodId,
                    isDeleted: false,
                  },
                });

                // counter total scan out
                doPodDeliver.totalAwb = doPodDeliver.totalAwb + 1;
                await DoPodDeliver.save(doPodDeliver);
                await DeliveryService.updateAwbAttr(
                  awb.awbItemId,
                  null,
                  AWB_STATUS.ANT,
                );

                // NOTE: queue by Bull
                DoPodDetailPostMetaQueueService.createJobByScanOutAwbDeliver(
                  doPodDeliverDetail.doPodDeliverDetailId,
                );
                // #endregion after scanout

                totalSuccess += 1;
                // remove key holdRedis
                RedisService.del(`hold:scanoutant:${awb.awbItemId}`);
              } else {
                totalError += 1;
                response.status = 'error';
                response.message = 'Server Busy';
              }
            } else {
              // save data to awb_trouble
              await AwbTroubleService.fromScanOut(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message = `Resi ${awbNumber} milik gerai, ` +
              `${awb.branchLast.branchCode} - ${awb.branchLast.branchName}.`;
            }
            break;

          default:
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} tidak dapat SCAN OUT, Harap hubungi kantor pusat`;
            break;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        awbNumber,
        ...response,
      });
    } // end of loop

    // Populate return value
    result.totalData = payload.awbNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  /**
   * Create DO POD Detail
   * with scan bag number
   * @param {WebScanOutBagVm} payload
   * @returns {Promise<WebScanOutBagResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutBag(payload: WebScanOutBagVm): Promise<WebScanOutBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanOutBagResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    for (const bagNumber of payload.bagNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };
      const bagData = await DeliveryService.validBagNumber(bagNumber);
      if (bagData) {
        if (bagData.branchIdLast == permissonPayload.branchId) {
          if (
            bagData.bagItemStatusIdLast == 2000 ||
            bagData.bagItemStatusIdLast == 500
          ) {
            const holdRedis = await RedisService.locking(
              `hold:bagscanout:${bagData.bagItemId}`,
              'locking',
            );
            if (holdRedis) {
              const doPodDetail = DoPodDetail.create();
              doPodDetail.doPodId = payload.doPodId;
              doPodDetail.bagItemId = bagData.bagItemId;
              doPodDetail.doPodStatusIdLast = 1000;
              doPodDetail.isScanOut = true;
              doPodDetail.scanOutType = 'bag';

              await DoPodDetail.save(doPodDetail);

              // AFTER Scan OUT ===============================================
              // #region after scanout
              // Update do_pod
              const doPod = await DoPod.findOne({
                where: {
                  doPodId: payload.doPodId,
                  isDeleted: false,
                },
              });
              // Update bag_item set bag_item_status_id = 1000
              const bagItem = await BagItem.findOne({
                where: {
                  bagItemId: bagData.bagItemId,
                },
              });
              bagItem.bagItemStatusIdLast = 1000;
              bagItem.branchIdLast = doPod.branchId;
              bagItem.branchIdNext = doPod.branchIdTo;
              bagItem.updatedTime = timeNow;
              bagItem.userIdUpdated = authMeta.userId;
              BagItem.save(bagItem);

              // counter total scan in
              doPod.totalScanOut = doPod.totalScanOut + 1;
              if (doPod.totalScanOut == 1) {
                doPod.firstDateScanOut = timeNow;
                doPod.lastDateScanOut = timeNow;
              } else {
                doPod.lastDateScanOut = timeNow;
              }
              await DoPod.save(doPod);

              // NOTE: Loop data bag_item_awb for update status awb
              const bagItemsAwb = await BagItemAwb.find({
                where: {
                  bagItemId: bagData.bagItemId,
                  isDeleted: false,
                },
              });
              if (bagItemsAwb && bagItemsAwb.length) {
                for (const itemAwb of bagItemsAwb) {
                  if (itemAwb.awbItemId) {
                    await DeliveryService.updateAwbAttr(
                      itemAwb.awbItemId,
                      doPod.branchIdTo,
                      AWB_STATUS.OUT_HUB,
                    );
                    // NOTE: queue by Bull
                    DoPodDetailPostMetaQueueService.createJobByScanOutBag(
                      doPodDetail.doPodDetailId,
                      itemAwb.awbItemId,
                    );
                  }
                }
              }
              // #endregion after scanout

              totalSuccess += 1;
              // remove key holdRedis
              RedisService.del(`hold:bagscanout:${bagData.bagItemId}`);
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = 'Server Busy';
            }
          } else {
            totalSuccess += 1;
            response.message = `Gabung paket ${bagNumber} sudah pernah scan out`;
            if (bagData.bagItemStatusIdLast == 1000) {
              response.message = `Gabung paket belum scan in, mohon untuk melakukan scan in terlebih dahulu`;
            }
          }
        } else {
          // NOTE: create data bag trouble
          const bagTroubleCode = await CustomCounterCode.bagTrouble(timeNow);
          const bagTrouble = BagTrouble.create({
            bagNumber,
            bagTroubleCode,
            bagTroubleStatus: 100,
            bagStatusId: 1000,
            employeeId: authMeta.employeeId,
            branchId: permissonPayload.branchId,
          });
          await BagTrouble.save(bagTrouble);

          totalError += 1;
          response.status = 'error';
          response.message = `Gabung paket ${bagNumber} bukan milik gerai ini`;
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `Gabung paket ${bagNumber} Tidak di Temukan`;
      }

      // push item
      dataItem.push({
        bagNumber,
        ...response,
      });
    } // end of loop

    // Populate return value
    result.totalData = payload.bagNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  async findAllScanOutList(
    payload: BaseMetaPayloadVm,
    isHub = false,
  ): Promise<WebScanOutAwbListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDateTime'] = 't1.do_pod_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['branchTo'] = 't1.branch_id_to';
    payload.fieldResolverMap['doPodCode'] = 't1.do_pod_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';
    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDateTime',
      },
      {
        field: 'doPodCode',
      },
      {
        field: 'description',
      },
      {
        field: 'nickname',
      },
    ];

    const repo = new OrionRepositoryService(DoPod, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_id', 'doPodId'],
      ['t1.do_pod_code', 'doPodCode'],
      ['t1.do_pod_date_time', 'doPodDateTime'],
      ['t1.description', 'description'],
      ['t1.percen_scan_in_out', 'percenScanInOut'],
      ['t1.total_scan_in', 'totalScanIn'],
      ['t1.total_scan_out', 'totalScanOut'],
      ['t1.last_date_scan_in', 'lastDateScanIn'],
      ['t1.last_date_scan_out', 'lastDateScanOut'],
      ['t1.employee_id_driver', 'employeeIdDriver'],
      ['t1.partner_logistic_id', 'partnerLogisticId'],
      ['t1.do_pod_method', 'doPodMethod'],
      ['t1.vehicle_number', 'vehicleNumber'],
      ['t1.branch_id_to', 'branchIdTo'],
      ['t2.nickname', 'nickname'],
      ['t3.branch_name', 'branchTo'],
    );

    q.innerJoin(e => e.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branchTo, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    if (isHub) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.TRANSIT_HUB));
      q.andWhere(e => e.totalScanOut, w => w.greaterThan(0));
    } else {
      q.andWhere(e => e.doPodType, w => w.notEquals(POD_TYPE.TRANSIT_HUB));
      q.andWhere(e => e.totalScanOut, w => w.greaterThan(0));
    }

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutAwbListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async findAllScanOutDeliverList(
    payload: BaseMetaPayloadVm,
  ): Promise<WebScanOutDeliverListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDeliverDateTime'] =
      't1.do_pod_deliver_date_time';
    payload.fieldResolverMap['branchFrom'] = 't1.branch_id';
    payload.fieldResolverMap['doPodDeliverCode'] = 't1.do_pod_deliver_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';
    if (payload.sortBy === '') {
      payload.sortBy = 'doPodDeliverDateTime';
    }

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDeliverDateTime',
      },
      {
        field: 'doPodDeliverCode',
      },
      {
        field: 'description',
      },
      {
        field: 'nickname',
      },
    ];

    const repo = new OrionRepositoryService(DoPodDeliver, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.do_pod_deliver_id', 'doPodDeliverId'],
      ['t1.do_pod_deliver_code', 'doPodDeliverCode'],
      ['t1.do_pod_deliver_date_time', 'doPodDeliverDateTime'],
      ['t1.description', 'description'],
      ['t1.total_delivery', 'totalDelivery'],
      ['t1.total_problem', 'totalProblem'],
      ['COUNT (t3.*)', 'totalAwb'],
      ['t2.nickname', 'nickname'],
      [
        `CONCAT(CAST(SUM(t4.total_cod_value) AS NUMERIC(20,2)))`,
        'totalCodValue',
      ],
    );

    q.innerJoin(e => e.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awbItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awbItem.awb, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.doPodDeliverDetails.awbStatus.isFinalStatus, w => w.isFalse());
    q.groupByRaw('t1.do_pod_deliver_id, t2.nickname');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutDeliverListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  /**
   *
   *
   * @param {BaseMetaPayloadVm} payload
   * @returns {Promise<WebDeliveryListResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async awbDetailDelivery(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodId'] = 't1.do_pod_id';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodId',
      },
    ];

    const repo = new OrionRepositoryService(DoPodDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t2.awb_number', 'awbNumber'],
      [`CONCAT(CAST(t2.total_weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
      ['t2.consignee_name', 'consigneeName'],
    );

    q.innerJoin(e => e.awbItem.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  /**
   *
   *
   * @param {BaseMetaPayloadVm} payload
   * @returns {Promise<WebDeliveryListResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async detailDelivery(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDeliverId'] = 't1.do_pod_deliver_id';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodDeliverId',
      },
    ];

    const repo = new OrionRepositoryService(DoPodDeliverDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t2.awb_number', 'awbNumber'],
      [`CONCAT(CAST(t2.total_weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
      ['t2.consignee_name', 'consigneeName'],
      ['t3.awb_status_title', 'awbStatusTitle'],
      ['CONCAT(CAST(t2.total_cod_value AS NUMERIC(20,2)))', 'totalCodValue'],
    );

    q.innerJoin(e => e.awbItem.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.awbItem.awbAttr.awbStatus, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  /**
   *
   *
   * @param {BaseMetaPayloadVm} payload
   * @returns {Promise<WebDeliveryListResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async bagDetailDelivery(
    payload: BaseMetaPayloadVm,
  ): Promise<WebDeliveryListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodId'] = 't1.do_pod_id';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodId',
      },
    ];

    const repo = new OrionRepositoryService(DoPodDetail, 't1');
    const q = repo.findAllRaw();

    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      [
        `CASE LENGTH (CAST(t2.bag_seq AS varchar(10)))
          WHEN 1 THEN
            CONCAT (t3.bag_number,'00',t2.bag_seq)
          WHEN 2 THEN
            CONCAT (t3.bag_number,'0',t2.bag_seq)
          ELSE
            CONCAT (t3.bag_number,t2.bag_seq) END`,
        'bagNumber',
      ],
      ['COUNT (t4.*)', 'totalAwb'],
      ['t5.representative_name', 'representativeIdTo'],
      [`CONCAT(CAST(t2.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
    );

    q.innerJoin(e => e.bagItem, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItem.bag, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItem.bagItemAwbs, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItem.bag.representative, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(
      't3.bag_number, t2.bag_seq, t2.weight, t5.representative_name',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async scanOutAwbValidate(
    payload: WebScanOutAwbValidateVm,
  ): Promise<ScanAwbVm> {
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const awbNumber = payload.awbNumber;
    let result = new ScanAwbVm();
    const response = {
      status: 'error',
      trouble: false,
      message: 'Resi Bermasalah',
    };

    const awb = await DeliveryService.validAwbNumber(awbNumber);
    if (awb) {
      const statusCode = await DeliveryService.awbStatusGroup(
        awb.awbStatusIdLast,
      );

      if (statusCode == 'IN' && awb.branchIdLast == permissonPayload.branchId) {
        response.status = 'ok';
        response.trouble = false;
        response.message = 'success';
      }
    }
    result = { awbNumber, ...response };
    return result;
  }

  async scanOutBagValidate(
    payload: WebScanOutBagValidateVm,
  ): Promise<ScanBagVm> {
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const bagNumber = payload.bagNumber;
    let result = new ScanBagVm();
    const response = {
      status: 'error',
      trouble: false,
      message: 'Bag Bermasalah',
    };

    const bag = await DeliveryService.validBagNumber(bagNumber);
    if (bag) {
      if (bag.branchIdLast == permissonPayload.branchId) {
        response.status = 'ok';
        response.trouble = false;
        response.message = 'success';
      }
    }
    result = { bagNumber, ...response };
    return result;
  }

  private async getTotalDetailById(doPodId: number) {
    const qb = createQueryBuilder();
    qb.from('do_pod_detail', 'do_pod_detail');
    qb.where('do_pod_detail.do_pod_id = :doPodId', {
      doPodId,
    });
    return await qb.getCount();
  }

  async scanOutLoadForEdit(
    payload: WebScanOutLoadForEditVm,
    isHub = false,
  ): Promise<WebScanOutResponseForEditVm> {
    const doPodId = payload.doPodId;
    const doPodMethod = payload.doPodMethod;

    // Get Data from do_pod scanout start
    const repo = new OrionRepositoryService(DoPod, 't1');
    const q = repo.findAllRaw();

    if (doPodMethod === '3000') {
      // Get Data for 3pl Method
      q.selectRaw(
        ['t1.do_pod_id', 'doPodId'],
        ['t1.employee_id_driver', 'employeeIdDriver'],
        ['t1.partner_logistic_id', 'partnerLogisticId'],
        ['t4.partner_logistic_name', 'partnerLogisticName'],
        ['t1.do_pod_method', 'doPodMethod'],
        ['t1.vehicle_number', 'vehicleNumber'],
        ['t1.branch_id_to', 'branchIdTo'],
        ['t2.fullname', 'employeeName'],
        ['t2.nik', 'nik'],
        ['t3.branch_name', 'branchTo'],
        ['t3.branch_code', 'branchCode'],
      );

      q.innerJoin(e => e.employee, 't2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.innerJoin(e => e.branchTo, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.innerJoin(e => e.partner_logistic, 't4', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.andWhere(e => e.doPodId, w => w.equals(doPodId));
    } else {
      // Get Data for internal Method
      q.selectRaw(
        ['t1.do_pod_id', 'doPodId'],
        ['t1.employee_id_driver', 'employeeIdDriver'],
        ['t1.do_pod_method', 'doPodMethod'],
        ['t1.vehicle_number', 'vehicleNumber'],
        ['t1.branch_id_to', 'branchIdTo'],
        ['t2.fullname', 'employeeName'],
        ['t2.nik', 'nik'],
        ['t3.branch_name', 'branchTo'],
        ['t3.branch_code', 'branchCode'],
      );

      q.innerJoin(e => e.employee, 't2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.innerJoin(e => e.branchTo, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q.andWhere(e => e.doPodId, w => w.equals(doPodId));
    }

    const data = await q.exec();
    // Get Data from do_pod scanout end

    // Get Data for scanout detail start
    const repo2 = new OrionRepositoryService(DoPodDetail, 'tb1');
    const q2 = repo2.findAllRaw();

    if (isHub) {
      // Get Data for scanout for bag detail
      q2.selectRaw(
        [
          `CASE LENGTH (CAST(t2.bag_seq AS varchar(10)))
            WHEN 1 THEN
              CONCAT (t3.bag_number,'00',t2.bag_seq)
            WHEN 2 THEN
              CONCAT (t3.bag_number,'0',t2.bag_seq)
            ELSE
              CONCAT (t3.bag_number,t2.bag_seq) END`,
          'bagNumber',
        ],
        ['COUNT (t4.*)', 'totalAwb'],
        ['t5.representative_name', 'representativeIdTo'],
        [`CONCAT(CAST(t2.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
      );

      q2.innerJoin(e => e.bagItem, 't2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q2.leftJoin(e => e.bagItem.bag, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q2.leftJoin(e => e.bagItem.bagItemAwbs, 't4', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q2.leftJoin(e => e.bagItem.bag.representative, 't5', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q2.andWhere(e => e.isDeleted, w => w.isFalse());
      q2.groupByRaw(
        't3.bag_number, t2.bag_seq, t2.weight, t5.representative_name',
      );
      q2.andWhere(e => e.doPodId, w => w.equals(doPodId));
      q2.andWhere(e => e.isDeleted, w => w.isFalse());
    } else {
      // Get Data for scanout for awb detail
      q2.selectRaw(
        ['tb2.awb_number', 'awbNumber'],
        [`CONCAT(CAST(tb2.total_weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
        ['tb2.consignee_name', 'consigneeName'],
      );

      q2.innerJoin(e => e.awbItem.awb, 'tb2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );
      q2.andWhere(e => e.doPodId, w => w.equals(doPodId));
      q2.andWhere(e => e.isDeleted, w => w.isFalse());
    }

    const data2 = await q2.exec();
    // Get Data for scanout detail end

    const result = new WebScanOutResponseForEditVm();

    result.data = data;
    result.data_detail = data2;

    return result;
  }

  async getBagItemId(
    payload: WebScanOutBagForPrintVm,
  ): Promise<WebScanOutResponseForPrintVm> {
    const doPodId = payload.doPodId;

    const repo = new OrionRepositoryService(DoPod, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t2.bag_item_id', 'bagItemId'],
    );

    q.innerJoin(e => e.doPodDetails, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.doPodId, w => w.equals(doPodId));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    const data = await q.exec();

    const result = new WebScanOutResponseForPrintVm();

    result.bagItemId = data[0].bagItemId;

    return result;
  }
}
