// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
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
import { AwbTroubleRepository } from '../../../../shared/orm-repository/awb-trouble.repository';
import { DoPodRepository } from '../../../../shared/orm-repository/do-pod.repository';
import { BranchRepository } from '../../../../shared/orm-repository/branch.repository';
import { BagRepository } from '../../../../shared/orm-repository/bag.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { ContextualErrorService } from '../../../../shared/services/contextual-error.service';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import moment = require('moment');
import { POD_TYPE } from '../../../../shared/constants/pod-type.constant';
import { DoPodDetail } from '../../../../shared/orm-entity/do-pod-detail';
import { AwbItem } from '../../../../shared/orm-entity/awb-item';
import { IsNull, createQueryBuilder } from 'typeorm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebDeliveryList } from '../../models/web-delivery-list-payload.vm';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPod } from '../../../../shared/orm-entity/do-pod';
import { AwbTrouble } from '../../../../shared/orm-entity/awb-trouble';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { Bag } from '../../../../shared/orm-entity/bag';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagTrouble } from '../../../../shared/orm-entity/bag-trouble';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
// #endregion

@Injectable()
export class WebDeliveryOutService {
  constructor(
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
    @InjectRepository(DoPodRepository)
    private readonly doPodRepository: DoPodRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
    @InjectRepository(BagRepository)
    private readonly bagRepository: BagRepository,
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
    const authMeta = AuthService.getAuthMetadata();
    const result = new WebScanOutCreateResponseVm();
    const timeNow = moment().toDate();

    if (!!authMeta) {
      // create do_pod (Surat Jalan)
      // mapping payload to field table do_pod
      const doPod = this.doPodRepository.create();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const doPodDateTime = moment(payload.doPodDateTime).toDate();

      // NOTE: Tipe surat jalan
      doPod.doPodCode = await CustomCounterCode.doPod(
        doPodDateTime.toDateString(),
      ); // generate code
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
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
    const authMeta = AuthService.getAuthMetadata();
    const result = new WebScanOutCreateResponseVm();
    const timeNow = moment().toDate();

    if (!!authMeta) {
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
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Create DO POD Detail
   * with scan awb number
   * @param {WebScanOutAwbVm} payload
   * @returns {Promise<WebScanOutAwbResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutAwb(payload: WebScanOutAwbVm): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const dataItem = [];
      const result = new WebScanOutAwbResponseVm();
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

      for (const awbNumber of payload.awbNumber) {
        const response = {
          status: 'ok',
          message: 'Success',
        };

        // NOTE:
        // find data to awb where awbNumber and awb status not cancel
        const awb = await this.awbRepository.findOne({
          select: ['awbId', 'branchId', 'awbStatusIdLast'],
          where: { awbNumber, isDeleted: false },
        });

        if (awb) {
          // NOTE: jika awb awbHistoryIdLast >= 1500 dan tidak sama dengan 1800 (cancel) boleh scan out
          if (awb.awbStatusIdLast >= 1500 && awb.awbStatusIdLast !== 1800) {
            // TODO: check data by status IN/OUT
            // find data do pod detail if exists
            // NOTE: gerai ??
            // Get data awb item
            const awbItem = await AwbItem.findOne({
              select: ['awbItemId'],
              where: { awbId: awb.awbId },
            });

            // NOTE: Resi belum scan in
            const checkPod = await DoPodDetail.findOne({
              where: {
                awbItemId: awbItem.awbItemId,
                isScanIn: false,
                isDeleted: false,
              },
            });

            if (!checkPod) {
              // NOTE: create data do pod detail per awb number
              const doPodDetail = DoPodDetail.create();
              doPodDetail.doPodId = payload.doPodId;
              doPodDetail.awbItemId = awbItem.awbItemId;
              // "bag_item_id": null,
              doPodDetail.doPodStatusIdLast = 1000;
              // "do_pod_history_id_last": null,
              doPodDetail.isScanOut = true;
              doPodDetail.scanOutType = 'awb_item';
              // "is_scan_in": true,
              // "scan_in_type": "awb_item",

              // general
              // doPodDetail.branchId = permissonPayload.branchId;
              // doPodDetail.userId = authMeta.userId;
              doPodDetail.userIdCreated = authMeta.userId;
              doPodDetail.userIdUpdated = authMeta.userId;
              doPodDetail.createdTime = timeNow;
              doPodDetail.updatedTime = timeNow;
              await DoPodDetail.save(doPodDetail);

              // TODO: ===================================================================================
              // save data to table awb_history
              const awbHistory = AwbHistory.create({
                awbItemId: awbItem.awbItemId,
                userId: authMeta.userId,
                branchId: permissonPayload.branchId,
                historyDate: timeNow,
                awbStatusId: 3000,
                refAwbNumber: awbNumber,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                isScanSingle: true,
              });
              // await for get awbHistoryId
              await AwbHistory.save(awbHistory);
              const awbHistoryId = awbHistory.awbHistoryId;
              // tslint:disable-next-line: no-console
              console.log('################## awbHistoryId :: ', awbHistoryId);
              // update data history id last on awb??
              // =========================================================================================

              totalSuccess += 1;
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = `No Resi ${awbNumber} belum di scan Masuk di gerai tujuan`;
              // TODO: create data awb trouble
              // save data to awb_trouble
              const awbTrouble = AwbTrouble.create({
                awbNumber,
                awbStatusId: awb.awbStatusIdLast,
                resolveDateTime: timeNow,
                employeeId: authMeta.employeeId,
                branchId: permissonPayload.branchId,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                description: response.message,
              });
              await AwbTrouble.save(awbTrouble);
            }
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `No Resi ${awbNumber} Tidak dapat di scan Keluar`;
            // TODO: create data awb trouble
            // save data to awb_trouble
            const awbTrouble = AwbTrouble.create({
              awbNumber,
              awbStatusId: awb.awbStatusIdLast,
              resolveDateTime: timeNow,
              employeeId: authMeta.employeeId,
              branchId: permissonPayload.branchId,
              userIdCreated: authMeta.userId,
              createdTime: timeNow,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
              description: response.message,
            });
            await AwbTrouble.save(awbTrouble);
          }
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `No Resi ${awbNumber} Tidak di Temukan`;
        }

        // push item
        dataItem.push({
          awbNumber,
          status: response.status,
          message: response.message,
        });
      } // end of loop

      // NOTE: Update do pod ??
      // total_pod_item
      // total_item
      // total weight

      // Populate return value
      result.totalData = payload.awbNumber.length;
      result.totalSuccess = totalSuccess;
      result.totalError = totalError;
      result.data = dataItem;

      return result;
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const dataItem = [];
      const result = new WebScanOutAwbResponseVm();
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

      for (const awbNumber of payload.awbNumber) {
        const response = {
          status: 'ok',
          message: 'Success',
        };

        // NOTE:
        // find data to awb where awbNumber and awb status not cancel
        const awb = await this.awbRepository.findOne({
          select: ['awbId', 'branchId', 'awbStatusIdLast'],
          where: { awbNumber, isDeleted: false },
        });

        if (awb) {
          // NOTE: jika awb awbHistoryIdLast >= 1500 dan tidak sama dengan 1800 (cancel) boleh scan out
          if (awb.awbStatusIdLast >= 1500 && awb.awbStatusIdLast !== 1800) {
            // TODO: check data by status IN/OUT
            // find data do pod detail if exists
            // NOTE: gerai ??
            // Get data awb item
            const awbItem = await AwbItem.findOne({
              select: ['awbItemId'],
              where: { awbId: awb.awbId },
            });

            // TODO: check Do Pod Detail Deliver
            const checkPod = await DoPodDetail.findOne({
              where: {
                awbItemId: awbItem.awbItemId,
                isScanIn: true,
                isDeleted: false,
              },
            });

            // NOTE: Resi belum scan in
            if (checkPod) {
              // NOTE: create data do pod detail per awb number
              const doPodDeliverDetail = DoPodDeliverDetail.create();
              doPodDeliverDetail.doPodDeliverId = payload.doPodId;
              doPodDeliverDetail.awbItemId = awbItem.awbItemId;
              doPodDeliverDetail.doPodStatusIdLast = 1000;

              // general
              doPodDeliverDetail.userIdCreated = authMeta.userId;
              doPodDeliverDetail.userIdUpdated = authMeta.userId;
              doPodDeliverDetail.createdTime = timeNow;
              doPodDeliverDetail.updatedTime = timeNow;
              await DoPodDeliverDetail.save(doPodDeliverDetail);

              // TODO: ===================================================================================
              // save data to table awb_history
              const awbHistory = AwbHistory.create({
                awbItemId: awbItem.awbItemId,
                userId: authMeta.userId,
                branchId: permissonPayload.branchId,
                historyDate: timeNow,
                awbStatusId: 3000,
                refAwbNumber: awbNumber,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                isScanSingle: true,
              });
              // await for get awbHistoryId
              await AwbHistory.save(awbHistory);
              const awbHistoryId = awbHistory.awbHistoryId;
              // tslint:disable-next-line: no-console
              console.log('################## awbHistoryId :: ', awbHistoryId);
              // update data history id last on awb??
              // =========================================================================================

              totalSuccess += 1;
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = `No Resi ${awbNumber} belum di scan Masuk di gerai tujuan`;
              // TODO: create data awb trouble
              // save data to awb_trouble
              const awbTrouble = AwbTrouble.create({
                awbNumber,
                awbStatusId: awb.awbStatusIdLast,
                resolveDateTime: timeNow,
                employeeId: authMeta.employeeId,
                branchId: permissonPayload.branchId,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                description: response.message,
              });
              await AwbTrouble.save(awbTrouble);
            }
          } else {
            totalError += 1;
            response.status = 'error';
            response.message = `No Resi ${awbNumber} Tidak dapat di scan Keluar`;
            // TODO: create data awb trouble
            // save data to awb_trouble
            const awbTrouble = AwbTrouble.create({
              awbNumber,
              awbStatusId: awb.awbStatusIdLast,
              resolveDateTime: timeNow,
              employeeId: authMeta.employeeId,
              branchId: permissonPayload.branchId,
              userIdCreated: authMeta.userId,
              createdTime: timeNow,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
              description: response.message,
            });
            await AwbTrouble.save(awbTrouble);
          }
        } else {
          totalError += 1;
          response.status = 'error';
          response.message = `No Resi ${awbNumber} Tidak di Temukan`;
        }

        // push item
        dataItem.push({
          awbNumber,
          status: response.status,
          message: response.message,
        });
      } // end of loop

      // NOTE: Update do pod ??
      // total_pod_item
      // total_item
      // total weight

      // Populate return value
      result.totalData = payload.awbNumber.length;
      result.totalSuccess = totalSuccess;
      result.totalError = totalError;
      result.data = dataItem;

      return result;
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Create DO POD Detail
   * with scan bag number
   * @param {WebScanOutBagVm} payload
   * @returns {Promise<WebScanOutBagResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async scanOutBag(payload: WebScanOutBagVm): Promise<WebScanOutBagResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
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
            bagItemAwbs: {
              bagItemAwbId: true,
            },
          },
        });
        // q2.where(e => e.bagItems.bagId, w => w.equals('421862'));
        qBag.where(e => e.bagNumber, w => w.equals(bagNumber));
        qBag.andWhere(e => e.isDeleted, w => w.equals(false));
        const bagData = await qBag.exec();

        // const bag = await Bag.findOne({
        //   relations: ['bagItems'],
        //   select: ['bagId', 'branchId'],
        //   where: { bagNumber, isDeleted: false },
        // });

        if (bagData) {
          for (const bagItem of bagData.bagItems) {
            // NOTE: jika awb awbHistoryIdLast >= 1500 dan tidak sama dengan 1800 (cancel) boleh scan out
            const checkPod = await DoPodDetail.findOne({
              where: {
                bagItemId: bagItem.bagItemId,
                isScanIn: false,
                isDeleted: false,
              },
            });

            // NOTE: Bag Number belum scan in
            if (!checkPod) {
              // TODO: create data do pod detail (scan out hub)
              // bagItem.bagItemId;
              // NOTE: create data do pod detail per bagItemId
              const doPodDetail = DoPodDetail.create();
              doPodDetail.doPodId = payload.doPodId;
              doPodDetail.bagItemId = bagItem.bagItemId;
              doPodDetail.doPodStatusIdLast = 1000;

              // general
              doPodDetail.userIdCreated = authMeta.userId;
              doPodDetail.userIdUpdated = authMeta.userId;
              doPodDetail.createdTime = timeNow;
              doPodDetail.updatedTime = timeNow;
              await DoPodDetail.save(doPodDetail);

              // TODO:
              // get data bag item awb where bag item id
              // looping data bag item awb
              // get data awb item id
              // create awb history ??
              // update last status
              totalSuccess += 1;
            } else {
              totalError += 1;
              response.status = 'error';
              response.message = `No Bag ${bagNumber} belum di scan Masuk di gerai tujuan`;
              // TODO: create data bag trouble
              // save data to bag_trouble
              const bagTrouble = BagTrouble.create({
                bagNumber,
                resolveDateTime: timeNow,
                employeeId: authMeta.employeeId,
                branchId: permissonPayload.branchId,
                userIdCreated: authMeta.userId,
                createdTime: timeNow,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                description: response.message,
              });
              await BagTrouble.save(bagTrouble);
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
          status: response.status,
          message: response.message,
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
    } else {
      ContextualErrorService.throwObj(
        {
          message: 'global.error.USER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
        field: 'desc',
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

    const qb = payload.buildQueryBuilder();
    qb.addSelect('do_pod.do_pod_id', 'doPodId');
    qb.addSelect('do_pod.do_pod_code', 'doPodCode');
    qb.addSelect('do_pod.do_pod_date_time', 'doPodDateTime');
    qb.addSelect('employee.fullname', 'fullname');
    qb.addSelect(`COALESCE(do_pod.description, '')`, 'desc');

    qb.from('do_pod', 'do_pod');
    qb.innerJoin(
      'employee',
      'employee',
      'employee.employee_id = do_pod.employee_id_driver AND employee.is_deleted = false',
    );

    // tslint:disable-next-line: no-console
    console.log(qb);

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

  /**
   *
   *
   * @param {WebDeliveryList} payload
   * @returns {Promise<WebDeliveryListResponseVm>}
   * @memberof WebDeliveryOutService
   */
  async awbDetailDelivery(
    payload: WebDeliveryList,
  ): Promise<WebDeliveryListResponseVm> {
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
