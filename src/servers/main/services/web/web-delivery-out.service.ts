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
import { AwbRepository } from '../../../../shared/orm-repository/awb.repository';
import { DoPodRepository } from '../../../../shared/orm-repository/do-pod.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { DoPodDetail } from '../../../../shared/orm-entity/do-pod-detail';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebDeliveryList } from '../../models/web-delivery-list-payload.vm';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import moment = require('moment');
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { DeliveryService } from '../../../../shared/services/delivery.service';
import { RedisService } from '../../../../shared/services/redis.service';
import { AwbAttr } from '../../../../shared/orm-entity/awb-attr';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
// #endregion

@Injectable()
export class WebDeliveryOutService {
  constructor(
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
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

    doPod.doPodCode = await CustomCounterCode.doPod(
      doPodDateTime.toDateString(),
    );
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
      doPodDateTime.toDateString(),
    ); // generate code

    // doPod.userIdDriver = payload.
    doPod.employeeIdDriver = payload.employeeIdDriver || null;
    doPod.doPodDeliverDateTime = moment(doPodDateTime).toDate();
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
        const statusCode = await DeliveryService.awbStatusGroup(awb.awbStatusIdLast);
        switch (statusCode) {
          case 'OUT':
            // check condition
            if (awb.branchIdLast === permissonPayload.branchId) {
              totalSuccess += 1;
              response.message = `Resi ${awbNumber} sudah di Scan OUT di gerai ini`;
            } else {
              // save data to awb_trouble
              const awbTroubleCode = await CustomCounterCode.awbTrouble(
                timeNow.toString(),
              );
              const awbTrouble = AwbTrouble.create({
                awbNumber,
                awbTroubleCode,
                awbTroubleStatusId: 100,
                awbStatusId: awb.awbStatusIdLast,
                employeeId: authMeta.employeeId,
                branchId: permissonPayload.branchId,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                userIdPic: authMeta.userId,
                branchIdPic: permissonPayload.branchId,
              });
              await AwbTrouble.save(awbTrouble);

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
            // Add Locking setnx redis
            const holdRedis = await RedisService.locking(`hold:scanout:${awb.awbItemId}`, 'locking');
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
              // TODO:
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

    for (const awbNumber of payload.awbNumber)  {
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
              const awbTroubleCode = await CustomCounterCode.awbTrouble(
                timeNow.toString(),
              );
              const awbTrouble = AwbTrouble.create({
                awbNumber,
                awbTroubleCode,
                awbTroubleStatusId: 100,
                awbStatusId: awb.awbStatusIdLast,
                employeeId: authMeta.employeeId,
                branchId: permissonPayload.branchId,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                userIdPic: authMeta.userId,
                branchIdPic: permissonPayload.branchId,
              });
              await AwbTrouble.save(awbTrouble);

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
            // Add Locking setnx redis
            const holdRedis = await RedisService.locking(
              `hold:scanoutdlv:${awb.awbItemId}`,
              'locking',
            );
            if (holdRedis) {
              // TODO:
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
              // TODO:
              // Update do_pod
              const doPodDeliver = await DoPodDeliver.findOne({
                where: {
                  doPodDeliverId: payload.doPodId,
                  isDeleted: false,
                },
              });

              // counter total scan in
              // doPod.totalScanOut = doPod.totalScanOut + 1;
              // if (doPod.totalScanOut === 1) {
              //   doPod.firstDateScanOut = timeNow;
              //   doPod.lastDateScanOut = timeNow;
              // } else {
              //   doPod.lastDateScanOut = timeNow;
              // }
              await DoPodDeliver.save(doPodDeliver);

              // TODO:
              // Insert awb_history  (Note bg process + scheduler)
              // Update awb_item_summary  (Note bg process + scheduler)
              // ...
              // ...
              // #endregion after scanout

              totalSuccess += 1;
              // remove key holdRedis
              RedisService.del(`hold:scanoutdlv:${awb.awbItemId}`);
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = 'Server Busy';
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
    const dataItem = [];
    const result = new WebScanOutBagResponseVm();
    const timeNow = moment().toDate();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    let totalSuccess = 0;
    let totalError = 0;

    // TODO: need reviewed??
    // // get data do pod by id for update data
    // const doPod = DoPod.findOne({
    //   where: {
    //     doPodId: payload.doPodId,
    //     isDeleted: false,
    //   },
    // });

    for (const bagNumber of payload.bagNumber) {
      const response = {
        status: 'ok',
        message: 'Success',
      };

      // NOTE:
      // find data to awb where bagNumber and awb status not cancel
      const bagRepository = new OrionRepositoryService(Bag);
      const qBag = bagRepository.findOne();
      // Manage relation (default inner join)
      qBag.innerJoin(e => e.bagItems);
      qBag.leftJoin(e => e.bagItems.bagItemAwbs);

      qBag.select({
        bagId: true,
        bagNumber: true,
        bagItems: {
          bagItemId: true,
          bagItemAwbs: {
            bagItemAwbId: true,
            awbItemId: true,
          },
        },
      });
      // q2.where(e => e.bagItems.bagId, w => w.equals('421862'));
      qBag.where(e => e.bagNumber, w => w.equals(bagNumber));
      qBag.andWhere(e => e.isDeleted, w => w.equals(false));
      const bagData = await qBag.exec();

      if (bagData) {
        for (const bagItem of bagData.bagItems) {
          // NOTE: jika awb awbHistoryIdLast >= 1500 dan tidak sama dengan 1800 (cancel) boleh scan out
          // const checkPod = await DoPodDetail.findOne({
          //   where: {
          //     bagItemId: bagItem.bagItemId,
          //     isScanIn: false,
          //     isDeleted: false,
          //   },
          // });

          // NOTE: Bag Number belum scan in
          // if (!checkPod) {

            // TODO: create data do pod detail (scan out hub)
            // ========================================================
            // Check bag_item_awb ??
            // Check awb_item_id ??
            // data present?? or data null ??
            // ...
            // ...

            // NOTE: create data do pod detail per bagItemId
            const doPodDetail = DoPodDetail.create();
            doPodDetail.doPodId = payload.doPodId;
            doPodDetail.bagItemId = bagItem.bagItemId;
            doPodDetail.doPodStatusIdLast = 1000;
            doPodDetail.isScanOut = true;
            doPodDetail.scanOutType = 'bag_item';
            // general
            doPodDetail.userIdCreated = authMeta.userId;
            doPodDetail.userIdUpdated = authMeta.userId;
            doPodDetail.createdTime = timeNow;
            doPodDetail.updatedTime = timeNow;
            await DoPodDetail.save(doPodDetail);

            // TODO: Pending?? ==========================================
            // get data bag item awb where bag item id
            // looping data bag item awb
            // get data awb item id
            // create awb history ??
            // update last status

            totalSuccess += 1;
        //   } else {
        //     totalError += 1;
        //     response.status = 'error';
        //     response.message = `No Bag ${bagNumber} belum di scan Masuk di gerai tujuan`;
        //     // TODO: create data bag trouble
        //     // save data to bag_trouble
        //     const bagTrouble = BagTrouble.create({
        //       bagNumber,
        //       resolveDateTime: timeNow,
        //       employeeId: authMeta.employeeId,
        //       branchId: permissonPayload.branchId,
        //       userIdCreated: authMeta.userId,
        //       createdTime: timeNow,
        //       userIdUpdated: authMeta.userId,
        //       updatedTime: timeNow,
        //       description: response.message,
        //     });
        //     await BagTrouble.save(bagTrouble);
        //   }
        } // end of loop
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

    // NOTE: Update do pod ??
    // total_pod_item
    // total_item
    // total weight

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
  ): Promise <WebScanOutAwbListResponseVm> {
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
    payload.fieldResolverMap['desc'] = 't1.description';
    payload.fieldResolverMap['fullname'] = 't2.fullname';

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
      ['t2.fullname', 'fullname'],
    );

    q.innerJoin(e => e.employee, 't2', j => j.andWhere(e => e.isDeleted, w => w.isFalse()));
    if (isHub) {
      q.where(e => e.doPodType, w => w.equals(POD_TYPE.TRANSIT_HUB));
    }

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
   * @param {WebDeliveryList} payload
   * @returns {Promise<WebDeliveryListResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async awbDetailDelivery(
    payload: WebDeliveryList,
  ): Promise <WebDeliveryListResponseVm> {
    const queryPayload = new BaseQueryPayloadVm();
    const qb = queryPayload.buildQueryBuilder();

    qb.addSelect('awb.awb_number', 'awbNumber');
    qb.addSelect('awb.total_weight', 'weight');
    qb.addSelect('awb.consignee_name', 'consigneeName');

    qb.from('do_pod_detail', 'do_pod_detail');
    qb.innerJoin(
      'awb_item',
      'awb_item',
      'awb_item.awb_item_id = do_pod_detail.awb_item_id AND awb_item.is_deleted = false',
    );
    qb.innerJoin(
      'awb',
      'awb',
      'awb.awb_id = awb_item.awb_id AND awb.is_deleted = false',
    );
    qb.where('do_pod_detail.do_pod_id = :doPodId', {
      doPodId: payload.doPodId,
    });

    const result = new WebDeliveryListResponseVm();
    const total = await qb.getCount();

    result.data = await qb.getRawMany();
    result.paging = MetaService.set(1, 10, total);

    return result;
  }

}
