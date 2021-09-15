// #region import
import { createQueryBuilder, IsNull, getConnection } from 'typeorm';
import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';
import { AuditHistory } from '../../../../../shared/orm-entity/audit-history';
import { BagItem } from '../../../../../shared/orm-entity/bag-item';
import { DoPod } from '../../../../../shared/orm-entity/do-pod';
import { DoPodDetail } from '../../../../../shared/orm-entity/do-pod-detail';
import { DoPodDetailBag } from '../../../../../shared/orm-entity/do-pod-detail-bag';
import { DoPodRepository } from '../../../../../shared/orm-repository/do-pod.repository';
import { AuthService } from '../../../../../shared/services/auth.service';
import { AwbTroubleService } from '../../../../../shared/services/awb-trouble.service';
import { BagTroubleService } from '../../../../../shared/services/bag-trouble.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { DeliveryService } from '../../../../../shared/services/delivery.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import { BagItemHistoryQueueService } from '../../../../queue/services/bag-item-history-queue.service';
import { DoPodDetailPostMetaQueueService } from '../../../../queue/services/do-pod-detail-post-meta-queue.service';
import {
  ScanAwbVm,
  WebScanOutAwbResponseVm,
  WebScanOutBagResponseVm,
  WebScanOutCreateResponseVm,
  ScanBagVm,
} from '../../../models/web-scan-out-response.vm';
import {
  WebScanOutAwbVm,
  WebScanOutBagVm,
  WebScanOutCreateVm,
  WebScanOutEditHubVm,
  WebScanOutEditVm,
  TransferBagNumberVm,
} from '../../../models/web-scan-out.vm';
import { AwbService } from '../../v1/awb.service';
import { BagService } from '../../v1/bag.service';
import moment = require('moment');
import { BagScanOutBranchQueueService } from '../../../../queue/services/bag-scan-out-branch-queue.service';
import { User } from '../../../../../shared/orm-entity/user';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { Employee } from '../../../../../shared/orm-entity/employee';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { PartnerLogistic } from '../../../../../shared/orm-entity/partner-logistic';
import { RequestErrorService } from '../../../../../shared/services/request-error.service';
// #endregion

// Surat Jalan Keluar Gerai
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

    doPod.doPodCode   = await CustomCounterCode.doPod(doPodDateTime);
    doPod.doPodType   = payload.doPodType;
    const method      = payload.doPodMethod && payload.doPodMethod == '3pl' ? 3000 : 1000;
    doPod.doPodMethod = method; // internal or 3PL/Third Party
    payload.doPodMethod && payload.doPodMethod == '3pl'
      ? (doPod.partnerLogisticId = payload.partnerLogisticId || null)
      : (doPod.partnerLogisticId = null);
    // doPod.partnerLogisticId = payload.partnerLogisticId || null;
    doPod.branchIdTo          = payload.branchIdTo || null;
    doPod.userIdDriver        = payload.userIdDriver || null;
    doPod.doPodDateTime       = doPodDateTime;
    doPod.vehicleNumber       = payload.vehicleNumber || null;
    doPod.description         = payload.desc || null;
    doPod.branchId            = permissonPayload.branchId;
    doPod.transactionStatusId = 800; // BRANCH
    if (payload.doPodMethod && payload.doPodMethod === '3pl' && payload.partnerLogisticName) {
      doPod.partnerLogisticName = payload.partnerLogisticName;
    }

    try {
      // await for get do pod id
      await DoPod.save(doPod);
    } catch (err) {
      console.log('ERROR INSERT:::::: ', err);
      RequestErrorService.throwObj({
        message: 'global.error.SERVER_BUSY',
      });
    }

    this.createAuditHistory(doPod.doPodId, false);

    // Populate return value
    result.status  = 'ok';
    result.message = 'success';
    result.doPodId = doPod.doPodId;

    // TODO: Query and populate result printDoPodMetadata, printDoPodBagMetadata, and printDoPodDeliverMetadata based on do pod type
    // query for get Employee
    let dataUser;
    if (!payload.doPodMethod || (payload.doPodMethod && payload.doPodMethod !== '3pl')) {
      const repo = new OrionRepositoryService(Employee, 't1');
      const q = repo.findAllRaw();

      q.selectRaw(
        [
          't1.nik',
          'nik',
        ],
        ['t1.nickname', 'nickname'],
      );

      q.innerJoin(e => e.user, 't2');
      q.where(
        e => e.user.userId,
        w => w.equals(payload.userIdDriver),
      );
      dataUser = await q.exec();

    }

    // query for get BranchTo
    const branchData = await Branch.findOne({
      where: {
        branchId: payload.branchIdTo,
      },
    });

    if (payload.doPodType === 3015) {
      result.printDoPodMetadata.doPodCode                    = doPod.doPodCode;
      result.printDoPodMetadata.branchTo.branchName          = branchData.branchName;
      result.printDoPodMetadata.description                  = payload.desc;
      if (payload.doPodMethod && payload.doPodMethod === '3pl') {

        // NOTES: get partner logistic name;
        let partnerLogisticName = payload.partnerLogisticName;
        if (!partnerLogisticName) {
          const partnerLogistic = await PartnerLogistic.findOne({ partnerLogisticId: payload.partnerLogisticId });
          partnerLogisticName = partnerLogistic.partnerLogisticName;
        }

        result.printDoPodMetadata.userDriver.employee.nik      = '';
        result.printDoPodMetadata.userDriver.employee.nickname = '3PL';
        result.printDoPodMetadata.vehicleNumber                = partnerLogisticName;
      } else {
        result.printDoPodMetadata.vehicleNumber                = payload.vehicleNumber;
        result.printDoPodMetadata.userDriver.employee.nik      = dataUser[0].nik;
        result.printDoPodMetadata.userDriver.employee.nickname = dataUser[0].nickname;
      }
    } else {
      // For printDoPodBagMetadata and printDoPodMetadata
      result.printDoPodBagMetadata.doPodCode                    = doPod.doPodCode;
      result.printDoPodBagMetadata.description                  = payload.desc;
      result.printDoPodBagMetadata.userDriver.employee.nik      = dataUser[0].nik;
      result.printDoPodBagMetadata.userDriver.employee.nickname = dataUser[0].nickname;
      result.printDoPodBagMetadata.vehicleNumber                = payload.vehicleNumber;
      result.printDoPodBagMetadata.branchTo.branchName          = branchData.branchName;
    }

    return result;
  }

  /**
   * Edit DO POD AWB
   * with type: Transit (Internal/3PL) and Criss Cross
   * @param {WebScanOutCreateVm} payload
   * @returns {Promise<WebScanOutCreateResponseVm>}
   * @memberof WebDeliveryOutService
   */
  static async scanOutUpdateAwb(
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
          const awb = await AwbService.validAwbNumber(addAwb);
          const doPodDetail = await DoPodDetail.findOne({
            where: {
              doPodId: payload.doPodId,
              awbItemId: awb.awbItemId,
              isDeleted: false,
            },
          });

          if (doPodDetail) {
            DoPodDetail.update({ doPodDetailId: doPodDetail.doPodDetailId }, {
              isDeleted: true,
            });
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
          const awb = await AwbService.validAwbNumber(addAwb);
          if (awb) {
            // add data do_pod_detail
            const doPodDetail = DoPodDetail.create();
            doPodDetail.doPodId = payload.doPodId;
            doPodDetail.awbItemId = awb.awbItemId;
            doPodDetail.transactionStatusIdLast = 800;
            doPodDetail.isScanOut = true;
            doPodDetail.scanOutType = 'awb';
            await DoPodDetail.save(doPodDetail);

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
        partnerLogisticId: payload.partnerLogisticId,
        branchIdTo: payload.branchIdTo,
        userIdDriver: payload.userIdDriver,
        vehicleNumber: payload.vehicleNumber,
        totalScanOutAwb,
      };
      await DoPod.update({ doPodId: doPod.doPodId }, updateDoPod);
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
  static async scanOutUpdateBag(
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
              DoPodDetailBag.update({ doPodDetailBagId: doPodDetailBag.doPodDetailBagId }, {
                isDeleted: true,
              });

              // TODO: reverse data ???
              const bagItem = await BagItem.findOne({
                where: {
                  bagItemId: bagData.bagItemId,
                },
              });
              if (bagItem) {
                BagItem.update({ bagItemId: bagItem.bagItemId }, {
                  bagItemStatusIdLast: BAG_STATUS.IN_BRANCH,
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
                  BAG_STATUS.IN_BRANCH,
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
            doPodDetailBag.bagNumber = addBag;
            doPodDetailBag.bagId = bagData.bagId;
            doPodDetailBag.bagItemId = bagData.bagItemId;
            doPodDetailBag.transactionStatusIdLast = 800; // OUT BRANCH
            await DoPodDetailBag.save(doPodDetailBag);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            const bagItem = await BagItem.findOne({
              where: {
                bagItemId: bagData.bagItemId,
              },
            });
            if (bagItem) {
              BagItem.update({ bagItemId: bagItem.bagItemId }, {
                bagItemStatusIdLast: BAG_STATUS.OUT_BRANCH,
                branchIdLast: doPod.branchId,
                branchIdNext: doPod.branchIdTo,
                updatedTime: timeNow,
                userIdUpdated: authMeta.userId,
              });

              // NOTE: Loop data bag_item_awb for update status awb
              // and create do_pod_detail (data awb on bag)
              // TODO: need to refactor
              // send background job
              BagScanOutBranchQueueService.perform(
                bagData.bagId,
                bagData.bagItemId,
                doPod.doPodId,
                doPod.branchIdTo,
                doPod.userIdDriver,
                addBag,
                authMeta.userId,
                permissonPayload.branchId,
              );
              // NOTE: background job for insert bag item history
              BagItemHistoryQueueService.addData(
                bagData.bagItemId,
                BAG_STATUS.OUT_BRANCH,
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
        partnerLogisticId: payload.partnerLogisticId,
        branchIdTo: payload.branchIdTo,
        userIdDriver: payload.userIdDriver,
        vehicleNumber: payload.vehicleNumber,
        totalScanOutBag,
      };
      await DoPod.update({ doPodId: doPod.doPodId }, updateDoPod);
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
  static async scanOutAwb(
    payload: WebScanOutAwbVm,
  ): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanOutAwbResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    // find data doPod
    const doPod = await DoPod.findOne({
      where: {
        doPodId: payload.doPodId,
        isDeleted: false,
      },
      // lock: { mode: 'pessimistic_write' },
    });

    for (const awbNumber of payload.awbNumber) {
      const response = new ScanAwbVm();
      response.status = 'ok';
      response.message = 'success';

      const awb = await AwbService.validAwbNumber(awbNumber);
      if (awb) {
        // TODO: validation need improvement
        // handle if awb status is null
        let notDeliver = true;
        if (awb.awbStatusIdLast && awb.awbStatusIdLast != 0) {
          notDeliver =
            awb.awbStatusIdLast != AWB_STATUS.OUT_BRANCH ? true : false;
        }
        // Add Locking setnx redis
        const holdRedis = await RedisService.locking(
          `hold:scanout:${awb.awbItemId}`,
          'locking',
        );

        if (notDeliver && holdRedis) {
          if (doPod) {
            // NOTE: check resi cancel delivery
            const isCancel = await AwbService.isCancelDelivery(awb.awbItemId);
            if (isCancel == true) {
              totalError += 1;
              response.status = 'error';
              response.message = `Resi ${awbNumber} telah di CANCEL oleh Partner !`;
            } else {
              const statusCode = await AwbService.awbStatusGroup(
                awb.awbStatusIdLast,
              );
              // save data to awb_trouble
              if (statusCode != 'IN') {
                const branchName = awb.branchLast ? awb.branchLast.branchName : '';
                await AwbTroubleService.fromScanOut(
                  awbNumber,
                  branchName,
                  awb.awbStatusIdLast,
                );
              }

              // NOTE: create data do pod detail per awb number
              const doPodDetail = DoPodDetail.create();
              doPodDetail.doPodId = payload.doPodId;
              doPodDetail.awbId = awb.awbId;
              doPodDetail.awbNumber = awbNumber;
              doPodDetail.awbItemId = awb.awbItemId;
              doPodDetail.transactionStatusIdLast = 800; // OUT_BRANCH
              doPodDetail.isScanOut = true;
              doPodDetail.scanOutType = 'awb';
              await DoPodDetail.save(doPodDetail);

              // Assign print metadata - Scan Out & Deliver
              response.printDoPodDetailMetadata.awbItem.awb.awbId         = awb.awbId;
              response.printDoPodDetailMetadata.awbItem.awb.awbNumber     = awbNumber;
              response.printDoPodDetailMetadata.awbItem.awb.consigneeName = awb.awbItem.awb.consigneeName;

              // Assign print metadata - Deliver
              response.printDoPodDetailMetadata.awbItem.awb.consigneeAddress = awb.awbItem.awb.consigneeAddress;
              response.printDoPodDetailMetadata.awbItem.awb.consigneeNumber  = awb.awbItem.awb.consigneeNumber;
              response.printDoPodDetailMetadata.awbItem.awb.consigneeZip     = awb.awbItem.awb.consigneeZip;
              response.printDoPodDetailMetadata.awbItem.awb.isCod            = awb.awbItem.awb.isCod;
              response.printDoPodDetailMetadata.awbItem.awb.totalCodValue    = awb.awbItem.awb.totalCodValue;
              response.printDoPodDetailMetadata.awbItem.awb.totalWeight      = awb.awbItem.weightReal;

              // AFTER Scan OUT ===============================================
              // #region after scanout

              // NOTE: queue by Bull
              let partnerLogisticName = '';
              if (doPod.partnerLogisticName) {
                partnerLogisticName = doPod.partnerLogisticName;
              } else if (doPod.partnerLogisticId) {
                const partnerLogistic = await PartnerLogistic.findOne({ partnerLogisticId: doPod.partnerLogisticId });
                partnerLogisticName = partnerLogistic.partnerLogisticName;
              }

              DoPodDetailPostMetaQueueService.createJobByScanOutAwbBranch(
                awb.awbItemId,
                AWB_STATUS.OUT_BRANCH,
                permissonPayload.branchId,
                authMeta.userId,
                doPod.userIdDriver,
                doPod.branchIdTo,
                partnerLogisticName,
              );
              totalSuccess += 1;
              // #endregion after scanout
            }
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Surat Jalan Resi ${awbNumber} tidak valid.`;
          }

          // remove key holdRedis
          RedisService.del(`hold:scanout:${awb.awbItemId}`);
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Resi ${awbNumber} sudah di proses.`;
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

    // TODO: need improvement
    if (doPod) {
      // counter total scan in
      if (doPod.totalScanOutAwb == 0) {
        await DoPod.update({ doPodId: doPod.doPodId }, {
          totalScanOutAwb: totalSuccess,
          firstDateScanOut: timeNow,
          lastDateScanOut: timeNow,
        });
      } else {
        const totalScanOutAwb = doPod.totalScanOutAwb + totalSuccess;
        await DoPod.update({ doPodId: doPod.doPodId }, {
          totalScanOutAwb,
          lastDateScanOut: timeNow,
        });
      }
    }

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
  static async scanOutBag(
    payload: WebScanOutBagVm,
  ): Promise<WebScanOutBagResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const dataItem = [];
    const timeNow = moment().toDate();
    const result = new WebScanOutBagResponseVm();

    let totalSuccess = 0;
    let totalError = 0;

    // find data doPod
    const doPod = await DoPod.findOne({
      where: {
        doPodId: payload.doPodId,
        isDeleted: false,
      },
      // lock: { mode: 'pessimistic_write' },
    });

    for (const bagNumber of payload.bagNumber) {
      const response = new ScanBagVm();
      response.status = 'ok';
      response.message = 'success';

      const bagData = await BagService.validBagNumber(bagNumber);
      if (bagData) {
        // NOTE: validate bag branch id last
        // TODO: validation need improvement
        // bag status scan out by doPodType (3005 Branch)
        const bagStatus = BAG_STATUS.OUT_BRANCH;
        const transactionStatusId = 800; // OUT_BRANCH

        // TODO: need refactoring with branch id ??
        const notScan = bagData.bagItemStatusIdLast != bagStatus ? true : false;
        const holdRedis = await RedisService.locking(
          `hold:bagscanout:${bagData.bagItemId}`,
          'locking',
        );

        if (notScan && holdRedis) {
          if (doPod) {
            // create bag trouble
            const statusNotTrouble = [
              BAG_STATUS.CREATED,
              BAG_STATUS.IN_BRANCH,
              BAG_STATUS.IN_HUB,
            ];
            if (!statusNotTrouble.includes(bagData.bagItemStatusIdLast) ||
              bagData.branchIdLast != permissonPayload.branchId
            ) {
              // TODO: construct message?
              response.status = 'warning';
              BagTroubleService.create(
                bagNumber,
                bagData.bagItemStatusIdLast,
                transactionStatusId,
              );
            }

            // TODO: Auto Status by bag status
            // if status branch IN and diffrent branchIdLast

            // TODO: need refactoring ??
            // NOTE: create DoPodDetailBag
            const doPodDetailBag = DoPodDetailBag.create();
            doPodDetailBag.doPodId = doPod.doPodId;
            doPodDetailBag.bagNumber = bagNumber;
            doPodDetailBag.bagId = bagData.bagId;
            doPodDetailBag.bagItemId = bagData.bagItemId;
            doPodDetailBag.transactionStatusIdLast = transactionStatusId;
            await DoPodDetailBag.insert(doPodDetailBag);

            // Assign print metadata
            response.printDoPodDetailBagMetadata.bagItem.bagItemId = bagData.bagItemId;
            response.printDoPodDetailBagMetadata.bagItem.bagSeq = bagData.bagSeq;
            response.printDoPodDetailBagMetadata.bagItem.weight = bagData.weight;
            response.printDoPodDetailBagMetadata.bagItem.bag.bagNumber = bagData.bag.bagNumber;
            response.printDoPodDetailBagMetadata.bagItem.bag.refRepresentativeCode = bagData.bag.refRepresentativeCode;

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // Update bag_item set bag_item_status_id = 1000

            await BagItem.update({ bagItemId: bagData.bagItemId }, {
              bagItemStatusIdLast: bagStatus,
              branchIdLast: doPod.branchId,
              branchIdNext: doPod.branchIdTo,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            });

            // NOTE: Loop data bag_item_awb for update status awb
            // and create do_pod_detail (data awb on bag)
            // TODO: need to refactor
            // send to background job
            BagScanOutBranchQueueService.perform(
              bagData.bagId,
              bagData.bagItemId,
              doPod.doPodId,
              doPod.branchIdTo,
              doPod.userIdDriver,
              bagNumber,
              authMeta.userId,
              permissonPayload.branchId,
            );

            // TODO: need refactoring
            // NOTE: background job for insert bag item history
            BagItemHistoryQueueService.addData(
              bagData.bagItemId,
              bagStatus,
              permissonPayload.branchId,
              authMeta.userId,
            );

            // #endregion after scanout
            totalSuccess += 1;
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Surat Jalan Bag ${bagNumber} tidak valid.`;
          }
          // remove key holdRedis
          RedisService.del(`hold:bagscanout:${bagData.bagItemId}`);
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `Gabung paket ${bagNumber} sudah di proses`;
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

    // TODO: need improvement
    if (doPod) {
      // counter total scan in
      if (doPod.totalScanOutBag == 0) {
        await DoPod.update({ doPodId: doPod.doPodId }, {
          totalScanOutBag: totalSuccess,
          firstDateScanOut: timeNow,
          lastDateScanOut: timeNow,
        });
      } else {
        const totalScanOutBag = doPod.totalScanOutBag + totalSuccess;
        await DoPod.update({ doPodId: doPod.doPodId }, {
          totalScanOutBag,
          lastDateScanOut: timeNow,
        });
      }
    }

    // Populate return value
    result.totalData = payload.bagNumber.length;
    result.totalSuccess = totalSuccess;
    result.totalError = totalError;
    result.data = dataItem;

    return result;
  }

  static async transferBagNumber(
    payload: TransferBagNumberVm,
  ): Promise<WebScanOutBagResponseVm> {
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
        // TODO:
        // Update data DoPodDetailBag flag is_deleted where status ??
        const holdRedis = await RedisService.locking(
          `hold:bagtransfer:${bagData.bagItemId}`,
          'locking',
        );
        if (holdRedis) {
          const doPodBag = await DoPodDetailBag.findOne({
            where: {
              bagId: bagData.bagId,
              bagItemId: bagData.bagItemId,
              transactionStatusIdLast: 800,
              isDeleted: false,
            },
          });
          if (doPodBag) {
            // TODO: update counter bag on DoPod
            await DoPodDetailBag.update({ doPodDetailBagId: doPodBag.doPodDetailBagId }, {
              isDeleted: true,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            });

            // Update do pod details
            await getConnection()
              .createQueryBuilder()
              .update(DoPodDetail)
              .set({
                isDeleted: true,
                updatedTime: timeNow,
                userIdUpdated: authMeta.userId,
              })
              .where(
                'bag_id = :bagId AND bag_item_id = :bagItemId',
                {
                  bagId: bagData.bagId,
                  bagItemId: bagData.bagItemId,
                },
              )
              .execute();

            // update status bag on bag item
            await BagItem.update({ bagItemId: bagData.bagItemId }, {
              bagItemStatusIdLast: BAG_STATUS.IN_BRANCH,
              branchIdLast: permissonPayload.branchId,
              branchIdNext: null,
              updatedTime: timeNow,
              userIdUpdated: authMeta.userId,
            });
            // TODO: Update Status awb on bag(In Branch) ??

            totalSuccess += 1;
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `Gabung paket ${bagNumber} belum dibuatkan Surat Jalan`;
          }
        }

        // remove key holdRedis
        RedisService.del(`hold:bagtransfer:${bagData.bagItemId}`);
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

  // private
  // TODO: send to background job process
  private static async createAuditHistory(
    doPodId: string,
    isUpdate: boolean = true,
  ) {
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
}
