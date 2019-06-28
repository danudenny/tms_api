// #region import
import { Injectable, HttpStatus } from '@nestjs/common';
import {
  WebScanOutCreateVm,
  WebScanOutAwbVm,
  WebScanOutAwbListPayloadVm,
} from '../../models/web-scan-out.vm';
import {
  WebScanOutCreateResponseVm,
  WebScanOutAwbResponseVm,
  WebScanOutAwbListResponseVm,
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
import { IsNull } from 'typeorm';
import { BaseQueryPayloadVm } from '../../../../shared/models/base-query-payload.vm';
import { toInteger, isEmpty } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebDeliveryList } from '../../models/web-delivery-list-payload.vm';
import { WebDeliveryListResponseVm } from '../../models/web-delivery-list-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
// #endregion

@Injectable()
export class WebDeliveryOutService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(AwbRepository)
    private readonly awbRepository: AwbRepository,
    @InjectRepository(DoPodRepository)
    private readonly doPodRepository: DoPodRepository,
    @InjectRepository(BranchRepository)
    private readonly branchRepository: BranchRepository,
    @InjectRepository(BagRepository)
    private readonly bagRepository: BagRepository,
  ) {}

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
      const permissonPayload = await this.authService.handlePermissionJwtToken(
        payload.permissionToken,
      );
      const doPodDateTime = moment(payload.doPodDateTime).toDate();

      // NOTE: Ada 4 tipe surat jalan
      doPod.doPodCode = await CustomCounterCode.doPod(
        doPodDateTime.toDateString(),
      ); // generate code
      // TODO: doPodType
      doPod.doPodType = payload.doPodType;
      // 1. tipe surat jalan criss cross
      // 2.A tipe transit(internal)
      // 2.B tipe transit (3pl)
      doPod.partnerLogisticId = payload.partnerLogisticId || null;
      // 3. tipe retur

      // gerai tujuan di gunakan selain tipe Surat Jalan Antar dan transit (3pl)
      doPod.branchIdTo = payload.branchIdTo || null;

      // doPod.userIdDriver = payload.
      doPod.employeeIdDriver = payload.employeeIdDriver || null;
      doPod.doPodDateTime = moment(doPodDateTime).toDate();

      doPod.vehicleNumber = payload.vehicleNumber || null;
      doPod.description = payload.desc || null;

      // tipe antar (sigesit)
      // resi antar/ retur

      // TODO: change if transit (3pl)
      doPod.doPodMethod = 1000; // internal or 3PL/Third Party
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
      result.status = '200';
      result.message = 'ok';
      result.doPodId = doPod.doPodId;

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

  async scanOutCreateDelivery(
    payload: WebScanOutCreateVm,
  ): Promise<WebScanOutCreateResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const result = new WebScanOutCreateResponseVm();
    const timeNow = moment().toDate();

    if (!!authMeta) {
      // create do_pod (Surat Jalan)
      // mapping payload to field table do_pod
      const doPod = this.doPodRepository.create();
      const permissonPayload = await this.authService.handlePermissionJwtToken(
        payload.permissionToken,
      );
      const doPodDateTime = moment(payload.doPodDateTime).toDate();

      // NOTE: Ada 4 tipe surat jalan
      doPod.doPodCode = await CustomCounterCode.doPod(
        doPodDateTime.toDateString(),
      ); // generate code
      // TODO: doPodType (Delivery Sigesit)
      doPod.doPodType = payload.doPodType;

      // doPod.userIdDriver = payload.
      doPod.employeeIdDriver = payload.employeeIdDriver || null;
      doPod.doPodDateTime = moment(doPodDateTime).toDate();

      doPod.vehicleNumber = payload.vehicleNumber || null;
      doPod.description = payload.desc || null;

      // tipe antar (sigesit)
      // resi antar/ retur

      // TODO: change if transit (3pl)
      doPod.doPodMethod = 1000; // internal or 3PL/Third Party
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
      result.status = '200';
      result.message = 'ok';
      result.doPodId = doPod.doPodId;

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

  async scanOutAwb(payload: WebScanOutAwbVm): Promise<WebScanOutAwbResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    if (!!authMeta) {
      const dataItem = [];
      const result = new WebScanOutAwbResponseVm();
      const timeNow = moment().toDate();
      const permissonPayload = await this.authService.handlePermissionJwtToken(
        payload.permissionToken,
      );

      let totalSuccess = 0;
      let totalError = 0;

      let awb;
      let awbItem;
      let doPodDetail;

      for (const awbNumber of payload.awbNumber) {
        // TODO: create data do_pod_detail
        // NOTE:
        // find data to awb where awbNumber and awb status not cancel
        awb = await this.awbRepository.findOne({
          select: ['awbId', 'branchId'],
          where: { awbNumber },
        });
        if (awb) {
          // TODO: check data by status IN/OUT
          // find data do pod detail if exists
          // let checkPod = await DoPodDetail.findOne({
          //   where: {
          //     awbId: awb.awbId,
          //   },
          // });

          // Get data awb item
          awbItem = await AwbItem.findOne({
            select: ['awbItemId'],
            where: { awbId: awb.awbId },
          });

          // NOTE: create data do pod detail per awb number
          // TODO: check DoPodDetail find by awb_item_id
          // update data or create data
          doPodDetail = DoPodDetail.create();
          doPodDetail.doPodId = payload.doPodId;
          doPodDetail.awbItemId = awbItem.awbItemId;
          // "bag_item_id": null,
          doPodDetail.doPodStatusIdLast = 1000;
          // "do_pod_history_id_last": null,
          doPodDetail.isScanOut = true;
          doPodDetail.scanOutType = 'awb_item';
          // "is_scan_in": true,
          // "scan_in_type": "awb_item",

          // "employee_journey_id_in": null,
          // "employee_journey_id_out": null

          // general
          // doPodDetail.branchId = permissonPayload.branchId;
          // doPodDetail.userId = authMeta.userId;
          doPodDetail.userIdCreated = authMeta.userId;
          doPodDetail.userIdUpdated = authMeta.userId;
          doPodDetail.createdTime = timeNow;
          doPodDetail.updatedTime = timeNow;
          DoPodDetail.save(doPodDetail);

          // TODO:
          // save data to table awb_history
          // update data history id last on awb??

          totalSuccess += 1;
          dataItem.push({
            awbNumber,
            status: 'ok',
            message: 'Success',
          });
        } else {
          totalError += 1;
          // TODO: Problem awb number not found
          // ......

          dataItem.push({
            awbNumber,
            status: 'error',
            message: `No Resi ${awbNumber} Tidak di Temukan`,
          });
        }
      } // end of loop

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

    const qb = payload.buildQueryBuilder();
    qb.addSelect('do_pod.do_pod_id', 'doPodId');
    qb.addSelect('do_pod.do_pod_date_time', 'doPodDateTime');
    qb.addSelect('do_pod.do_pod_code', 'doPodCode');
    qb.addSelect(`COALESCE(do_pod.description, '')`, 'desc');
    qb.addSelect('employee.fullname', 'fullname');

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

  // Type DO POD
  public handleTypeDoPod(type: string) {
    return null;
  }
}
