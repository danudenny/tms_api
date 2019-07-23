// #region import
import { Injectable } from '@nestjs/common';
import {
  WebScanOutCreateVm,
  WebScanOutAwbVm,
  WebScanOutCreateDeliveryVm,
  WebScanOutBagVm,
} from '../../models/web-scan-out.vm';
import {
  WebScanOutCreateResponseVm,
  WebScanOutAwbResponseVm,
  WebScanOutAwbListResponseVm,
  WebScanOutBagResponseVm,
} from '../../models/web-scan-out-response.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { DoPodRepository } from '../../../../shared/orm-repository/do-pod.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { DoPodDetail } from '../../../../shared/orm-entity/do-pod-detail';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import moment = require('moment');
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemAwb } from '../../../../shared/orm-entity/bag-item-awb';
import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { Branch } from '../../../../shared/orm-entity/branch';
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
    const timeNow = moment().toDate();

    // create do_pod (Surat Jalan)
    const doPod = this.doPodRepository.create();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const doPodDateTime = moment(payload.doPodDateTime).toDate();

    doPod.doPodCode = await CustomCounterCode.doPod(doPodDateTime);
    // TODO: doPodType
    doPod.doPodType = payload.doPodType;
    // 1. tipe surat jalan criss cross
    // 2.A tipe transit(internal)
    // 2.B tipe transit (3pl)
    const method =
      payload.doPodMethod && payload.doPodMethod === '3pl' ? 3000 : 1000;
    doPod.doPodMethod = method; // internal or 3PL/Third Party
    doPod.partnerLogisticId = payload.partnerLogisticId || null;
    doPod.branchIdTo = payload.branchIdTo || null;

    // doPod.userIdDriver = payload.
    doPod.employeeIdDriver = payload.employeeIdDriver || null;
    doPod.doPodDateTime = doPodDateTime;

    doPod.vehicleNumber = payload.vehicleNumber || null;
    doPod.description = payload.desc || null;

    // general
    // NOTE: (current status) (next feature, ada scan berangkat dan tiba)
    doPod.doPodStatusIdLast = 1000; // created
    doPod.branchId = permissonPayload.branchId;
    doPod.userId = authMeta.userId;
    doPod.userIdCreated = authMeta.userId;
    doPod.userIdUpdated = authMeta.userId;
    doPod.createdTime = timeNow;
    doPod.updatedTime = timeNow;

    // await for get do pod id
    await this.doPodRepository.save(doPod);

    // Populate return value
    result.status = 'ok';
    result.message = 'success';
    result.doPodId = Number(doPod.doPodId);

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
    const timeNow = moment().toDate();

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

    // general
    doPod.branchId = permissonPayload.branchId;
    doPod.userId = authMeta.userId;
    doPod.userIdCreated = authMeta.userId;
    doPod.userIdUpdated = authMeta.userId;
    doPod.createdTime = timeNow;
    doPod.updatedTime = timeNow;

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
            // check condition
            if (awb.branchIdLast === permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah di Scan OUT di gerai ini`;
            } else {
              // save data to awb_trouble
              await this.createAwbTrouble(awbNumber, awb.branchLast.branchName, awb.awbStatusIdLast);

              totalError += 1;
              response.status = 'error';
              response.message = `Resi Bermasalah pada gerai ${
                awb.branchLast.branchCode
              } - ${
                awb.branchLast.branchName
              }. Harap hubungi CT (Control Tower) Kantor Pusat`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'IN':
            if (awb.branchIdLast === permissonPayload.branchId) {
              // Add Locking setnx redis
              const holdRedis = await RedisService.locking(
                `hold:scanout:${awb.awbItemId}`,
                'locking',
              );
              if (holdRedis) {
                // TODO:
                // save table do_pod_detail
                // NOTE: create data do pod detail per awb number
                const doPodDetail = DoPodDetail.create();
                doPodDetail.doPodId = payload.doPodId;
                doPodDetail.awbItemId = awb.awbItemId;
                doPodDetail.doPodStatusIdLast = 1000;
                doPodDetail.isScanOut = true;
                doPodDetail.scanOutType = 'awb';

                // general
                doPodDetail.userIdCreated = authMeta.userId;
                doPodDetail.userIdUpdated = authMeta.userId;
                doPodDetail.createdTime = timeNow;
                doPodDetail.updatedTime = timeNow;
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

                // counter total scan in
                doPod.totalScanOut = doPod.totalScanOut + 1;
                if (doPod.totalScanOut === 1) {
                  doPod.firstDateScanOut = timeNow;
                  doPod.lastDateScanOut = timeNow;
                } else {
                  doPod.lastDateScanOut = timeNow;
                }
                await DoPod.save(doPod);
                await DeliveryService.updateAwbAttr(
                  awb.awbItemId,
                  doPod.branchIdTo,
                  3000,
                );

                // TODO:
                // Insert awb_history  (Note bg process + scheduler)
                // Update awb_item_summary  (Note bg process + scheduler)
                // ...
                // ...
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
              await this.createAwbTrouble(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message = `Resi Bermasalah pada gerai ${
                awb.branchLast.branchCode
              } - ${
                awb.branchLast.branchName
              }. Harap hubungi CT (Control Tower) Kantor Pusat`;
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
            // check condition
            if (awb.branchIdLast === permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah di Scan OUT di gerai ini`;
            } else {
              // save data to awb_trouble
              await this.createAwbTrouble(awbNumber, awb.branchLast.branchName, awb.awbStatusIdLast);

              totalError += 1;
              response.status = 'error';
              response.message = `Resi Bermasalah pada gerai ${
                awb.branchLast.branchCode
              } - ${
                awb.branchLast.branchName
              }. Harap hubungi CT (Control Tower) Kantor Pusat`;
            }
            break;

          case 'POD':
            totalError += 1;
            response.status = 'error';
            response.message = `Resi ${awbNumber} sudah di proses POD`;
            break;

          case 'IN':
            if (awb.branchIdLast === permissonPayload.branchId) {
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

                // general
                doPodDeliverDetail.userIdCreated = authMeta.userId;
                doPodDeliverDetail.userIdUpdated = authMeta.userId;
                doPodDeliverDetail.createdTime = timeNow;
                doPodDeliverDetail.updatedTime = timeNow;
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
                // TODO: status 3000, OR ANT (14000)
                await DeliveryService.updateAwbAttr(awb.awbItemId, null, 14000);

                // TODO:
                // Insert awb_history  (Note bg process + scheduler)
                // Update awb_item_summary  (Note bg process + scheduler)
                // ...
                // ...
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
              await this.createAwbTrouble(
                awbNumber,
                awb.branchLast.branchName,
                awb.awbStatusIdLast,
              );

              totalError += 1;
              response.status = 'error';
              response.message = `Resi Bermasalah pada gerai ${
                awb.branchLast.branchCode
              } - ${
                awb.branchLast.branchName
              }. Harap hubungi CT (Control Tower) Kantor Pusat`;
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
        if (
          bagData.bagItemStatusIdLast === 2000 ||
          bagData.bagItemStatusIdLast === 500
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
            // general
            doPodDetail.userIdCreated = authMeta.userId;
            doPodDetail.userIdUpdated = authMeta.userId;
            doPodDetail.createdTime = timeNow;
            doPodDetail.updatedTime = timeNow;
            await DoPodDetail.save(doPodDetail);

            // AFTER Scan OUT ===============================================
            // #region after scanout
            // Update bag_item set bag_item_status_id = 1000
            const bagItem = await BagItem.findOne({
              where: {
                bagItemId: bagData.bagItemId,
              },
            });
            bagItem.bagItemStatusIdLast = 1000;
            bagItem.updatedTime = timeNow;
            bagItem.userIdUpdated = authMeta.userId;
            BagItem.save(bagItem);
            // Update do_pod
            const doPod = await DoPod.findOne({
              where: {
                doPodId: payload.doPodId,
                isDeleted: false,
              },
            });

            // counter total scan in
            doPod.totalScanOut = doPod.totalScanOut + 1;
            if (doPod.totalScanOut === 1) {
              doPod.firstDateScanOut = timeNow;
              doPod.lastDateScanOut = timeNow;
            } else {
              doPod.lastDateScanOut = timeNow;
            }
            await DoPod.save(doPod);

            // TODO: Loop data bag_item_awb
            // SELECT *
            // FROM bag_item_awb
            // WHERE bag_item_id = <bag_item_id> AND is_deleted = false
            const bagItemsAwb = await BagItemAwb.find({
              where: {
                bagItemId: bagData.bagItemId,
                isDeleted: false,
              },
            });
            if (bagItemsAwb && bagItemsAwb.length > 0) {
              for (const itemAwb of bagItemsAwb) {
                if (itemAwb.awbItemId) {
                  await DeliveryService.updateAwbAttr(
                    itemAwb.awbItemId,
                    doPod.branchIdTo,
                    3000,
                  );
                  // TODO:
                  // Insert awb_history  (Note bg process + scheduler)
                  // Update awb_item_summary  (Note bg process + scheduler)
                  // ...
                  // ...
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
          if (bagData.branchIdLast === permissonPayload.branchId) {
            totalSuccess += 1;
            response.message = `No Bag ${bagNumber} sudah di Scan OUT di gerai ini`;
          } else {
            // NOTE: create data bag trouble
            // bag_trouble_code = automatic BTR/1907/13/XYZA1234
            // Bag_number
            // Bag_trouble_status = 100 (Read Bag TROUBLE STATUS below)
            // Bag_status_id = <sesuai dengan bag_status_id ketika scan dilakukan>
            // Employee_id = <sesuai login>
            // Branch_id = <sesuai login>
            const bagTroubleCode = await CustomCounterCode.bagTrouble(timeNow);
            const bagTrouble = BagTrouble.create({
              bagNumber,
              bagTroubleCode,
              bagTroubleStatus: 100,
              bagStatusId: 1000,
              employeeId: authMeta.employeeId,
              branchId: permissonPayload.branchId,
              userIdCreated: authMeta.userId,
              createdTime: timeNow,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });
            await BagTrouble.save(bagTrouble);

            totalError += 1;
            response.status = 'error';
            response.message = `Gabung Paket belum masuk pada Gerai. Harap Scan Masuk jika Gabung Paket sudah masuk`;
          }
        }
      } else {
        totalError += 1;
        response.status = 'error';
        response.message = `No Bag ${bagNumber} Tidak di Temukan`;
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

  /**
   *
   *
   * @param {BaseMetaPayloadVm} payload
   * @param {boolean} [isHub=false]
   * @returns {Promise<WebScanOutAwbListResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutList(
    payload: BaseMetaPayloadVm,
    isHub = false,
  ): Promise<WebScanOutAwbListResponseVm> {
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
        field: 'fullname',
      },
    ];

    // mapping field
    payload.fieldResolverMap['startScanOutDate'] = 'do_pod.do_pod_date_time';
    payload.fieldResolverMap['endScanOutDate'] = 'do_pod.do_pod_date_time';
    payload.fieldResolverMap['desc'] = 'do_pod.description';
    payload.fieldResolverMap['fullname'] = 'employee.fullname';

    // "totalScanIn"   : "0",
    // "totalScanOut"  : "10",
    // "percenScanInOut" : "0%",
    // "lastDateScanIn" : "",
    // "lastDateScanOut" : "2019-06-28 10:00:00"

    const qb = payload.buildQueryBuilder(true);
    qb.addSelect('do_pod.do_pod_id', 'doPodId');
    qb.addSelect('do_pod.do_pod_code', 'doPodCode');
    qb.addSelect('do_pod.do_pod_date_time', 'doPodDateTime');
    qb.addSelect('employee.fullname', 'fullname');
    qb.addSelect(`COALESCE(do_pod.description, '')`, 'description');

    qb.from('do_pod', 'do_pod');
    qb.innerJoin(
      'employee',
      'employee',
      'employee.employee_id = do_pod.employee_id_driver AND employee.is_deleted = false',
    );

    if (isHub) {
      qb.where('do_pod.do_pod_type = :doPodType', {
        doPodType: POD_TYPE.TRANSIT_HUB,
      });
    }
    const total = await qb.getCount();

    payload.applyPaginationToQueryBuilder(qb);
    const data = await qb.execute();

    const result = new WebScanOutAwbListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  async findAllScanOutList(
    payload: BaseMetaPayloadVm,
    isHub = false,
  ): Promise<WebScanOutAwbListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDateTime'] = 't1.do_pod_date_time';
    payload.fieldResolverMap['doPodCode'] = 't1.do_pod_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';

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
      ['t1.last_date_scan_in', 'lastDateScanIn'],
      ['t1.last_date_scan_out', 'lastDateScanOut'],
      ['t2.nickname', 'nickname'],
    );

    q.innerJoin(e => e.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    if (isHub) {
      q.andWhere(e => e.doPodType, w => w.equals(POD_TYPE.TRANSIT_HUB));
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
    isHub = false,
  ): Promise<WebScanOutAwbListResponseVm> {
    // mapping field
    payload.fieldResolverMap['doPodDeliverDateTime'] = 't1.do_pod_deliver_date_time';
    payload.fieldResolverMap['doPodDeliverCode'] = 't1.do_pod_code';
    payload.fieldResolverMap['description'] = 't1.description';
    payload.fieldResolverMap['nickname'] = 't2.nickname';

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
    );

    q.innerJoin(e => e.employee, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.doPodDeliverDetails.awbItem, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.groupByRaw('t1.do_pod_deliver_id, t2.nickname');

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebScanOutAwbListResponseVm();

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
      ['t2.total_weight', 'weight'],
      ['t2.consignee_name', 'consigneeName'],
    );

    q.innerJoin(e => e.awbItem.awb, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    // q.andWhere('do_pod_detail.do_pod_id = :doPodId', {
    //   doPodId: payload.doPodId,
    // });

    // qb.addSelect('awb.awb_number', 'awbNumber');
    // qb.addSelect('awb.total_weight', 'weight');
    // qb.addSelect('awb.consignee_name', 'consigneeName');

    // qb.from('do_pod_detail', 'do_pod_detail');
    // qb.innerJoin(
    //   'awb_item',
    //   'awb_item',
    //   'awb_item.awb_item_id = do_pod_detail.awb_item_id AND awb_item.is_deleted = false',
    // );
    // qb.innerJoin(
    //   'awb',
    //   'awb',
    //   'awb.awb_id = awb_item.awb_id AND awb.is_deleted = false',
    // );
    // qb.where('do_pod_detail.do_pod_id = :doPodId', {
    //   doPodId: payload.doPodId,
    // });

    // const result = new WebDeliveryListResponseVm();
    // const total = await qb.getCount();

    // result.data = await qb.getRawMany();
    // result.paging = MetaService.set(1, 10, total);

    // return result;

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
  ): Promise <WebDeliveryListResponseVm> {
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
        'CONCAT (t3.bag_number,t2.bag_seq)',
        'bagNumber',
      ],
      ['t2.weight', 'weight'],
    );

    q.innerJoin(e => e.bagItem, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.bagItem.bag, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new WebDeliveryListResponseVm();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  // private method
  private async createAwbTrouble(
    awbNumber: string,
    branchNameLast: string,
    awbStatusIdLast: number,
  ) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    // get branch name
    const branchLogin = await Branch.findOne({
      select: ['branchName'],
      cache: true,
      where: {
        branchId: permissonPayload.branchId,
      },
    });

    // save data to awb_trouble
    const awbTroubleCode = await CustomCounterCode.awbTrouble(timeNow);
    const troubleDesc = `
      Scan In Resi ${awbNumber} pada Gerai ${branchLogin.branchName}
      Bermasalah karena Resi belum di scan out / salah scan in pada ${branchNameLast}
    `;

    const awbTrouble = AwbTrouble.create({
      awbNumber,
      awbTroubleCode,
      awbTroubleStatusId: 100,
      awbStatusId: awbStatusIdLast,
      employeeId: authMeta.employeeId,
      branchId: permissonPayload.branchId,
      userIdCreated: authMeta.userId,
      createdTime: timeNow,
      userIdUpdated: authMeta.userId,
      updatedTime: timeNow,
      userIdPic: authMeta.userId,
      branchIdPic: permissonPayload.branchId,
      troubleCategory: 'scan_out',
      troubleDesc,
    });
    return await AwbTrouble.save(awbTrouble);
  }
}
