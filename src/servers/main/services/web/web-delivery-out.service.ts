// #region import
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, IsNull } from 'typeorm';
import moment = require('moment');

import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
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
import { DoPodDetailBag } from '../../../../shared/orm-entity/do-pod-detail-bag';
import { BagService } from '../v1/bag.service';
import { BagItemHistoryQueueService } from '../../../queue/services/bag-item-history-queue.service';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { BagOrderResponseVm, BagDetailResponseVm, AuditHistVm, PhotoResponseVm, BagDeliveryDetailResponseVm } from '../../models/bag-order-detail-response.vm';
import { BagAwbVm, BagDetailVm, PhotoDetailVm, BagDeliveryDetailVm } from '../../models/bag-order-response.vm';
import { AuditHistory } from '../../../../shared/orm-entity/audit-history';
import { AwbService } from '../v1/awb.service';
import { DoPodDeliverRepository } from '../../../../shared/orm-repository/do-pod-deliver.repository';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { BagTroubleService } from '../../../../shared/services/bag-trouble.service';
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
    payload.doPodMethod && payload.doPodMethod == '3pl'
      ? (doPod.partnerLogisticId = payload.partnerLogisticId || 1)
      : (doPod.partnerLogisticId = null);
    // doPod.partnerLogisticId = payload.partnerLogisticId || null;
    doPod.branchIdTo = payload.branchIdTo || null;

    // doPod.userIdDriver = payload.
    doPod.userIdDriver = payload.userIdDriver || null;
    doPod.doPodDateTime = doPodDateTime;

    doPod.vehicleNumber = payload.vehicleNumber || null;
    doPod.description = payload.desc || null;

    doPod.branchId = permissonPayload.branchId;
    // doPod.userId = authMeta.userId;

    if (payload.base64Image) {
      const attachment = await AttachmentService.uploadFileBase64(
        payload.base64Image,
        'do-pod',
      );
      if (attachment) {
        doPod.photoId = attachment.attachmentTmsId;
      }
      doPod.transactionStatusId = 300; // HUB
    } else {
      doPod.transactionStatusId = 800; // BRANCH
    }

    // await for get do pod id
    await this.doPodRepository.save(doPod);

    await this.createAuditHistory(doPod.doPodId, false);

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
  async scanOutUpdateAwb(
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
            await AwbService.updateAwbAttr(
              awb.awbItemId,
              AWB_STATUS.IN_BRANCH,
              null,
            );
            // NOTE: queue by Bull
            DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
              awb.awbItemId,
              AWB_STATUS.IN_BRANCH,
              permissonPayload.branchId,
              authMeta.userId,
            );
            totalRemove += 1;
          }
        } // end of loop
      }
      // looping data list add awb number
      if (payload.addAwbNumber && payload.addAwbNumber.length) {
        for (const addAwb of payload.addAwbNumber) {
          // find awb_item_attr
          const awb = await DeliveryService.validAwbNumber(addAwb);
          if (awb) {
            // add data do_pod_detail
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
              AWB_STATUS.OUT_BRANCH,
              doPod.branchIdTo,
            );

            // NOTE: queue by Bull
            DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
              awb.awbItemId,
              AWB_STATUS.OUT_BRANCH,
              permissonPayload.branchId,
              authMeta.userId,
            );
            totalAdd += 1;
          }
        } // end of loop
      }

      // const totalItem = await this.getTotalDetailById(doPod.doPodId);
      const totalScanOutAwb = doPod.totalScanOutAwb + totalAdd - totalRemove;
      // update data
      const updateDoPod = {
        doPodMethod:
          payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000,
        partnerLogisticId: Number(payload.partnerLogisticId),
        branchIdTo: payload.branchIdTo,
        userIdDriver: payload.userIdDriver,
        vehicleNumber: payload.vehicleNumber,
        totalScanOutAwb,
      };
      await DoPod.update(doPod.doPodId, updateDoPod);
      await this.createAuditHistory(doPod.doPodId);

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
  async scanOutUpdateBag(
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
      // looping data list remove bag number
      if (payload.removeBagNumber && payload.removeBagNumber.length) {
        for (const removeBag of payload.removeBagNumber) {
          const bagData = await DeliveryService.validBagNumber(removeBag);

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

              // TODO: reverse data ???
              const bagItem = await BagItem.findOne({
                where: {
                  bagItemId: bagData.bagItemId,
                },
              });
              if (bagItem) {
                BagItem.update(bagItem.bagItemId, {
                  bagItemStatusIdLast: 2000,
                  branchIdLast: doPod.branchId,
                  branchIdNext: null,
                  updatedTime: timeNow,
                  userIdUpdated: authMeta.userId,
                });

                // loop reverse status update to IN
                BagService.statusInAwbBag(
                  doPod.doPodId,
                  bagItem.bagItemId,
                  doPod.doPodType,
                );
                // reverse bag history
                BagItemHistoryQueueService.addData(
                  bagData.bagItemId,
                  2000,
                  permissonPayload.branchId,
                  authMeta.userId,
                );
              }
            }
            totalRemove += 1;
          }
        } // end of loop
      }
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
              // NOTE: background job for insert bag item history
              BagItemHistoryQueueService.addData(
                bagData.bagItemId,
                1000,
                permissonPayload.branchId,
                authMeta.userId,
              );
            }
            // #endregion
            totalAdd += 1;
          }
        } // end of loop
      }

      // const totalItem = await this.getTotalDetailById(doPod.doPodId);
      const totalScanOutBag = doPod.totalScanOutBag + totalAdd - totalRemove;
      // update data
      const updateDoPod = {
        doPodMethod:
          payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000,
        partnerLogisticId: Number(payload.partnerLogisticId),
        branchIdTo: payload.branchIdTo,
        userIdDriver: payload.userIdDriver,
        vehicleNumber: payload.vehicleNumber,
        totalScanOutBag,
      };
      await DoPod.update(doPod.doPodId, updateDoPod);
      await this.createAuditHistory(doPod.doPodId);

      result.status = 'ok';
      result.message = 'success';
    } else {
      result.status = 'error';
      result.message = 'Surat Jalan tidak valid';
    }
    result.doPodId = payload.doPodId;
    return result;
  }

  // TODO: need refactoring
  /**
   * Create DO POD Detail
   * with scan awb number
   * @param {WebScanOutAwbVm} payload
   * @returns {Promise<WebScanOutAwbResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutAwb(payload: WebScanOutAwbVm): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
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
              response.message =
                `Resi ${awbNumber} belum scan in, mohon untuk` +
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
                doPodDetail.transactionStatusIdLast = 800;
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
                doPod.totalScanOutAwb = doPod.totalScanOutAwb + 1;
                if (doPod.totalScanOutAwb == 1) {
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
                DoPodDetailPostMetaQueueService.createJobByAwbUpdateStatus(
                  awb.awbItemId,
                  AWB_STATUS.OUT_BRANCH,
                  permissonPayload.branchId,
                  authMeta.userId,
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
              response.message =
                `Resi ${awbNumber} milik gerai, ` +
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

  // TODO: need refactoring
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
      const bagData = await BagService.validBagNumber(bagNumber);
      if (bagData) {
        // NOTE: validate bag branch id last
        // TODO: validation need improvement
        let stageBag = BAG_STATUS.OUT_HUB;
        const doPod = await DoPod.findOne({
          where: {
            doPodId: payload.doPodId,
            isDeleted: false,
          },
        });

        // Branch
        if (doPod.doPodType == 3005) {
          stageBag = BAG_STATUS.OUT_BRANCH;
        }
        const notScan =  bagData.bagItemStatusIdLast != stageBag ? true : false;

        if (notScan) {
          // create bag trouble
          if (
            bagData.bagItemStatusIdLast != BAG_STATUS.IN_BRANCH ||
            bagData.bagItemStatusIdLast != BAG_STATUS.IN_HUB
          ) {
            BagTroubleService.create(
              bagNumber,
              bagData.bagItemStatusIdLast,
            );
          }

          const holdRedis = await RedisService.locking(
            `hold:bagscanout:${bagData.bagItemId}`,
            'locking',
          );

          if (holdRedis) {
            // bag status scan out by doPodType (3005 Branch/ 3010 and 3020 HUB)
            const bagStatus = doPod.doPodType == 3005 ? 1000 : 4500 ;
            // counter total scan in
            doPod.totalScanOutBag = doPod.totalScanOutBag + 1;
            if (doPod.totalScanOutBag == 1) {
              doPod.firstDateScanOut = timeNow;
              doPod.lastDateScanOut = timeNow;
            } else {
              doPod.lastDateScanOut = timeNow;
            }
            await DoPod.save(doPod);

            // TODO: need refactoring ??
            // NOTE: create DoPodDetailBag
            const doPodDetailBag = DoPodDetailBag.create();
            doPodDetailBag.doPodId = doPod.doPodId;
            doPodDetailBag.bagId = bagData.bagId;
            doPodDetailBag.bagItemId = bagData.bagItemId;
            doPodDetailBag.transactionStatusIdLast = 1000;
            await DoPodDetailBag.save(doPodDetailBag);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // Update bag_item set bag_item_status_id = 1000
            const bagItem = await BagItem.findOne({
              where: {
                bagItemId: bagData.bagItemId,
              },
            });
            if (bagItem) {
              BagItem.update(bagItem.bagItemId, {
                bagItemStatusIdLast: bagStatus,
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

              // TODO: if isTransit auto IN
              if (doPod.doPodType == 3020) {
                // NOTE: background job for insert bag item history
                BagItemHistoryQueueService.addData(
                  bagData.bagItemId,
                  3000,
                  permissonPayload.branchId,
                  authMeta.userId,
                );
              }

              // TODO: need refactoring
              // NOTE: background job for insert bag item history
              BagItemHistoryQueueService.addData(
                bagData.bagItemId,
                bagStatus,
                permissonPayload.branchId,
                authMeta.userId,
              );
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
          totalError += 1;
          response.status = 'error';
          response.message = `Gabung paket ${bagNumber} sudah di proses`;
          // if (bagData.bagItemStatusIdLast == 1000) {
          //   response.message = `Gabung paket belum scan in, mohon untuk melakukan scan in terlebih dahulu`;
          // }
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
    isHubTransit = false,
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
      ['t1.total_scan_in_bag', 'totalScanIn'],
      ['t1.total_scan_out_bag', 'totalScanOut'],
      ['t1.last_date_scan_in', 'lastDateScanIn'],
      ['t1.last_date_scan_out', 'lastDateScanOut'],
      ['t2.employee_id', 'employeeIdDriver'],
      ['t1.partner_logistic_id', 'partnerLogisticId'],
      ['t1.do_pod_method', 'doPodMethod'],
      ['t1.vehicle_number', 'vehicleNumber'],
      ['t1.branch_id_to', 'branchIdTo'],
      ['t1.photo_id', 'PhotoId'],
      ['t2.fullname', 'nickname'],
      ['t3.branch_name', 'branchTo'],
      ['t4.url', 'url'],
    );
    // TODO: relation userDriver to Employee Driver

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branchTo, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.attachment, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    if (isHub) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_HUB));
      q.andWhere(e => e.totalScanOutBag, w => w.greaterThan(0));
    } else if (isHubTransit) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.HUB_TRANSIT));
      q.andWhere(e => e.totalScanOutBag, w => w.greaterThan(0));
    } else {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.OUT_BRANCH));
      q.andWhere(e => e.totalScanOutBag, w => w.greaterThan(0));
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
      ['COUNT (t3.*) FILTER (WHERE t5.awb_status_id_last = 14000)', 'totalAwb'],
      ['COUNT (t3.*)', 'totalAssigned'],
      ['t2.fullname', 'nickname'],
      ['t4.is_cod', 'isCod'],
      [
        `CONCAT(CAST(SUM(t4.total_cod_value) AS NUMERIC(20,2)))`,
        'totalCodValue',
      ],
    );

    q.innerJoin(e => e.userDriver.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awbItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awbItem.awb, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    // q.andWhereIsolated(qw => {
    //   qw.where(e => e.doPodDeliverDetails.awbStatusIdLast, w => w.equals(14000).or.equals(21500));
    // });
    q.groupByRaw('t1.do_pod_deliver_id, t2.fullname, t4.is_cod');

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

  async bagOrderDetail(payload: BagAwbVm): Promise<BagOrderResponseVm> {
    const bag = await BagService.validBagNumber(payload.bagNumber);
    if (bag) {
      const qz = createQueryBuilder();
      qz.addSelect('bag.bag_id', 'bagId');
      qz.addSelect('bag_item_id.bag_item_id', 'bagItemId');
      qz.addSelect('bag_item_awb.awb_number', 'awbNumber');
      qz.from('bag', 'bag');
      qz.innerJoin(
        'bag_item',
        'bag_item_id',
        'bag_item_id.bag_id = bag.bag_id',
      );
      qz.innerJoin(
        'bag_item_awb',
        'bag_item_awb',
        'bag_item_awb.bag_item_id = bag_item_id.bag_item_id',
      );
      qz.where('bag.bag_number = :bag AND bag_item_id.bag_seq = :seq AND bag.bag_date is not null', {
        bag: bag.bag.bagNumber,
        seq: bag.bagSeq,
      });

      const data = await qz.getRawMany();
      const result = new BagOrderResponseVm();
      const awb = [];
      for (const a in data) {
        awb.push(data[a].awbNumber);
      }
      if (data) {
        result.awbNumber = awb;
      }
      return result;
    }
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
    payload.fieldResolverMap['bagNumber'] = 't3.bag_number';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'doPodId',
      },
    ];

    const repo = new OrionRepositoryService(DoPodDetailBag, 't1');
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
      // ['t2.bag_item_id', 'bagItemId'],
      ['t1.created_time', 'createdTime'],
      ['COUNT (t4.*)', 'totalAwb'],
      ['t5.representative_code', 'representativeIdTo'],
      ['t6.branch_name', 'branchName'],
      [`CONCAT(CAST(t2.weight AS NUMERIC(20,2)),' Kg')`, 'weight'],
    );

    q.innerJoin(e => e.bagItem, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItem.bag, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItem.branchLast, 't6', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItem.bagItemAwbs, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bag.representative, 't5', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.groupByRaw(
      't1.do_pod_id, t1.created_time, t3.bag_number, t2.bag_seq, t2.weight, t5.representative_name, t5.representative_code, t6.branch_name',
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async doPodDeliveryDetail(payload: BagDeliveryDetailVm): Promise<BagDeliveryDetailResponseVm> {
    const doPodDelivery = await DoPodDeliverRepository.getDataById(payload.doPodDeliveryId);
    const result = new BagDeliveryDetailResponseVm();

    if (doPodDelivery) {
      result.doPodCode = doPodDelivery.doPodDeliverCode;
      result.driverName = doPodDelivery.userDriver.employee.employeeName;
      result.createdName = doPodDelivery.userCreated.employee.employeeName;
      result.totalScanOutAwb = doPodDelivery.totalAwb;
      result.description = doPodDelivery.description;
      const auditHistory = new OrionRepositoryService(AuditHistory);
      const q = auditHistory.findAll();
      q.select({
        createdTime: true,
        note: true,
        userCreated: {
          userId: true,
          employee: {
            employeeId: true,
            employeeName: true,
          },
        },
      });
      q.where(e => e.changeId, w => w.equals(doPodDelivery.doPodDeliverId));
      q.andWhere(e => e.isDeleted, w => w.equals(false));
      const history = await q.exec();

      if (history) {
        const itemHistory = [];
        for (const item of history) {
          const itemResult = new AuditHistVm();
          itemResult.createdTime = item.createdTime;
          itemResult.note = item.note;
          itemResult.username = item.userCreated.employee.employeeName;

          itemHistory.push(itemResult);
        }
        result.history = itemHistory;
      }
      return result;
    }
  }

  async doPodDetail(payload: BagDetailVm): Promise<BagDetailResponseVm> {
    const doPod = await DoPodRepository.getDataById(payload.doPodId);
    const result = new BagDetailResponseVm();

    if (doPod) {
      result.doPodCode = doPod.doPodCode;
      result.driverName = doPod.userDriver.employee.employeeName;
      result.createdName = doPod.userCreated.employee.employeeName;
      result.vehicleNumber = doPod.vehicleNumber;
      result.branchToName = doPod.branchTo.branchName;
      result.totalScanOutBag = doPod.totalScanOutBag;
      result.description = doPod.description;

      const auditHistory = new OrionRepositoryService(AuditHistory);
      const q = auditHistory.findAll();
      q.select({
        createdTime: true,
        note: true,
        userCreated: {
          userId: true,
          employee: {
            employeeId: true,
            employeeName: true,
          },
        },
      });
      q.where(e => e.changeId, w => w.equals(doPod.doPodId));
      q.andWhere(e => e.isDeleted, w => w.equals(false));
      const history = await q.exec();

      if (history) {
        const itemHistory = [];
        for (const item of history) {
          const itemResult = new AuditHistVm();
          itemResult.createdTime = item.createdTime;
          itemResult.note = item.note;
          itemResult.username = item.userCreated.employee.employeeName;

          itemHistory.push(itemResult);
        }
        result.history = itemHistory;
      }
      return result;
    }
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

  // TODO: need refactoring
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
        ['t1.user_id_driver', 'userIdDriver'],
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
      // TODO: fix query relation to employee
      q.innerJoin(e => e.userDriver.employee, 't2', j =>
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
        ['t1.user_id_driver', 'userIdDriver'],
        ['t1.do_pod_method', 'doPodMethod'],
        ['t1.vehicle_number', 'vehicleNumber'],
        ['t1.branch_id_to', 'branchIdTo'],
        ['t2.fullname', 'employeeName'],
        ['t2.nik', 'nik'],
        ['t3.branch_name', 'branchTo'],
        ['t3.branch_code', 'branchCode'],
      );
      // TODO: fix query relation to employee
      q.innerJoin(e => e.userDriver.employee, 't2', j =>
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

    q.selectRaw(['t2.bag_item_id', 'bagItemId']);

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

  // private
  private async getTotalDetailById(doPodId: string) {
    const qb = createQueryBuilder();
    qb.from('do_pod_detail', 'do_pod_detail');
    qb.where('do_pod_detail.do_pod_id = :doPodId', {
      doPodId,
    });
    return await qb.getCount();
  }

  // TODO: send to background job process
  private async createAuditHistory(doPodId: string, isUpdate: boolean = true) {
    // find doPod
    const doPod = await DoPodRepository.getDataById(doPodId);
    if (doPod) {
      // construct note for information
      const description = doPod.description ? doPod.description : '';
      const stage = isUpdate ? 'Updated' : 'Created';
      const note = `
        Data ${stage} \n
        Nama Driver  : ${doPod.userDriver.employee.employeeName}
        Gerai Assign : ${doPod.branch.branchName}
        Gerai Tujuan : ${doPod.branchTo.branchName}
        Note         : ${description}
      `;
      // create new object AuditHistory
      const auditHistory = AuditHistory.create();
      auditHistory.changeId = doPodId;
      auditHistory.transactionStatusId = doPod.transactionStatusId;
      auditHistory.note = note;
      return await AuditHistory.save(auditHistory);
    }
  }

  async photoDetail(payload: PhotoDetailVm): Promise<PhotoResponseVm> {
    const qq = createQueryBuilder();
    qq.addSelect('attachments.url', 'url');
    qq.addSelect('dpda.type', 'type');
    qq.from('do_pod_deliver_attachment', 'dpda');
    qq.innerJoin(
      'do_pod_deliver_detail',
      'dpdd',
      'dpdd.do_pod_deliver_detail_id = dpda.do_pod_deliver_detail_id',
    );
    qq.innerJoin(
      'attachment_tms',
      'attachments',
      'attachments.attachment_tms_id = dpda.attachment_tms_id',
    );
    qq.where('dpdd.do_pod_deliver_id = :doPodDeliverId', {
      doPodDeliverId: payload.doPodDeliverId,

    });

    const result = new PhotoResponseVm();
    const data = await qq.getRawMany();
    if (data) {
      result.data = data;
    }
    return result;
  }

}
