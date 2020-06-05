import { Injectable, Param, PayloadTooLargeException } from '@nestjs/common';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { SysCounter } from '../../../../shared/orm-entity/sys-counter';
import { Bag } from '../../../../shared/orm-entity/bag';
import { ReceivedBag } from '../../../../shared/orm-entity/received-bag';
import { ReceivedBagDetail } from '../../../../shared/orm-entity/received-bag-detail';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { BagItemHistory } from '../../../../shared/orm-entity/bag-item-history';
import { ScanOutSmdVehicleResponseVm, ScanOutSmdRouteResponseVm, ScanOutSmdItemResponseVm, ScanOutSmdSealResponseVm, ScanOutListResponseVm, ScanOutHistoryResponseVm, ScanOutSmdHandoverResponseVm, ScanOutSmdDetailResponseVm, ScanOutSmdDetailBaggingResponseVm } from '../../models/scanout-smd.response.vm';
import { HttpStatus } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { QueryBuilderService } from '../../../../shared/services/query-builder.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { WebScanInHubSortListResponseVm } from '../../../main/models/web-scanin-list.response.vm';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { DoSmd } from '../../../../shared/orm-entity/do_smd';
import { DoSmdVehicle } from '../../../../shared/orm-entity/do_smd_vehicle';
import { DoSmdDetail } from '../../../../shared/orm-entity/do_smd_detail';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { Bagging } from '../../../../shared/orm-entity/bagging';
import { BaggingItem } from '../../../../shared/orm-entity/bagging-item';
import { DoSmdDetailItem } from '../../../../shared/orm-entity/do_smd_detail_item';
import { DoSmdHistory } from '../../../../shared/orm-entity/do_smd_history';
import { createQueryBuilder } from 'typeorm';
import { ScanOutSmdDepartureResponseVm, MobileUploadImageResponseVm, ScanOutSmdProblemResponseVm } from '../../models/mobile-smd.response.vm';
import { MobileUploadImagePayloadVm } from '../../models/mobile-smd.payload.vm';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { AttachmentTms } from '../../../../shared/orm-entity/attachment-tms';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { DoSmdDetailAttachment } from '../../../../shared/orm-entity/do_smd_detail_attachment';

@Injectable()
export class MobileSmdService {

  static async scanOutMobile(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDepartureResponseVm();
    const timeNow = moment().toDate();

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });

    if (resultDoSmd) {
      // Ubah Status 3000 OTW
      await DoSmd.update(
        { doSmdId : payload.do_smd_id },
        {
          doSmdStatusIdLast: 3000,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      await DoSmdDetail.update(
        { doSmdId : payload.do_smd_id, arrivalTime: null },
        {
          doSmdStatusIdLast: 3000,
          departureTime: moment().toDate(),
          latitudeDeparture: payload.latitude,
          longitudeDeparture: payload.longitude,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      const paramDoSmdHistoryId = await this.createDoSmdHistory(
        payload.do_smd_id,
        null,
        resultDoSmd.doSmdDetailIdLast,
        null,
        null,
        resultDoSmd.departureScheduleDateTime,
        permissonPayload.branchId,
        3000,
        null,
        null,
        authMeta.userId,
      );

      const data = [];
      data.push({
        do_smd_id: resultDoSmd.doSmdId,
        departure_date_time: payload.departure_date_time,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'SMD Success Departure';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO SMD ID : ` + payload.do_smd_id.toString());
    }

  }

  static async scanInMobile(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdDepartureResponseVm();
    const timeNow = moment().toDate();

    const resultDoSmdDetail = await DoSmdDetail.findOne({
      where: {
        doSmdDetailId: payload.do_smd_detail_id,
        isDeleted: false,
      },
    });

    if (resultDoSmdDetail) {
      // Ubah Status 4000 Arrived
      await DoSmd.update(
        { doSmdId : resultDoSmdDetail.doSmdId },
        {
          doSmdStatusIdLast: 4000,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      await DoSmdDetail.update(
        { doSmdId : payload.do_smd_id, arrivalTime: null },
        {
          doSmdStatusIdLast: 4000,
          arrivalTime: moment().toDate(),
          latitudeArrival: payload.latitude,
          longitudeArrival: payload.longitude,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      const paramDoSmdHistoryId = await this.createDoSmdHistory(
        resultDoSmdDetail.doSmdId,
        null,
        null,
        null,
        null,
        null,
        permissonPayload.branchId,
        4000,
        null,
        null,
        authMeta.userId,
      );

      const data = [];
      data.push({
        do_smd_id: resultDoSmdDetail.doSmdId,
        do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
        arrival_date_time: payload.arrival_date_time,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'SMD Success Arrival';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO SMD Detail ID : ` + payload.do_smd_detail_id.toString());
    }

  }

  public static async uploadImageMobile(
    payload: MobileUploadImagePayloadVm,
    file,
  ): Promise<MobileUploadImageResponseVm> {
    const result = new MobileUploadImageResponseVm();
    const authMeta = AuthService.getAuthData();
    PinoLoggerService.log('#### DEBUG USER UPLOAD IMAGE SMD: ', authMeta);

    let url = null;
    let attachmentId = null;

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      },
      lock: { mode: 'pessimistic_write' },
    });

    if (attachment) {
      // attachment exist
      attachmentId = attachment.attachmentTmsId;
      url = attachment.url;
    } else {
      // upload image
      const pathId = `smd-delivery-${payload.image_type}`;
      attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        pathId,
      );
      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
        url = attachment.url;
      }
    }

    // NOTE: insert data
    if (attachmentId) {
      // TODO: validate doPodDeliverDetailId ??
      const doSmdDelivereyAttachment = await DoSmdDetailAttachment.create();
      doSmdDelivereyAttachment.doSmdDetailId = payload.do_smd_detail_id;
      doSmdDelivereyAttachment.attachmentTmsId = attachmentId;
      doSmdDelivereyAttachment.attachmentType = payload.image_type;
      await DoSmdDetailAttachment.save(doSmdDelivereyAttachment);
    }

    result.url = url;
    result.attachmentId = attachmentId;
    return result;
  }

  static async problemMobile(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdProblemResponseVm();
    const timeNow = moment().toDate();

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });

    if (resultDoSmd) {
      // Ubah Status 4000 Arrived
      await DoSmd.update(
        { doSmdId : resultDoSmd.doSmdId },
        {
          doSmdStatusIdLast: 8000,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      await DoSmdDetail.update(
        { doSmdId : payload.do_smd_id, arrivalTime: null },
        {
          doSmdStatusIdLast: 8000,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      await DoSmdVehicle.update(
        { doSmdVehicleId : resultDoSmd.doSmdVehicleIdLast },
        {
          reasonId: payload.reason_id,
          notes: payload.reason_note,
          reasonDate: timeNow,
          latitude: payload.latitude,
          longitude: payload.longitude,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      const paramDoSmdHistoryId = await this.createDoSmdHistory(
        resultDoSmd.doSmdId,
        null,
        resultDoSmd.doSmdVehicleIdLast,
        payload.latitude,
        payload.longitude,
        resultDoSmd.doSmdTime,
        permissonPayload.branchId,
        8000,
        null,
        payload.reasonId,
        authMeta.userId,
      );

      const data = [];
      data.push({
        do_smd_id: resultDoSmd.doSmdId,
        reason_date: timeNow,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'SMD Success Created Problem';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO SMD ID : ` + payload.do_smd_id.toString());
    }

  }

  static async continueMobile(payload: any): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    const result = new ScanOutSmdProblemResponseVm();
    const timeNow = moment().toDate();

    const resultDoSmd = await DoSmd.findOne({
      where: {
        doSmdId: payload.do_smd_id,
        isDeleted: false,
      },
    });

    if (resultDoSmd) {
      // Ubah Status 4000 Arrived
      await DoSmd.update(
        { doSmdId : resultDoSmd.doSmdId },
        {
          doSmdStatusIdLast: 3000,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      await DoSmdDetail.update(
        { doSmdId : payload.do_smd_id, arrivalTime: null },
        {
          doSmdStatusIdLast: 3000,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      const paramDoSmdHistoryId = await this.createDoSmdHistory(
        resultDoSmd.doSmdId,
        null,
        resultDoSmd.doSmdVehicleIdLast,
        payload.latitude,
        payload.longitude,
        resultDoSmd.doSmdTime,
        permissonPayload.branchId,
        3000,
        null,
        payload.reasonId,
        authMeta.userId,
      );

      const data = [];
      data.push({
        do_smd_id: resultDoSmd.doSmdId,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'SMD Success Created Continue';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO SMD ID : ` + payload.do_smd_id.toString());
    }

  }

  private static async createDoSmdHistory(
    paramDoSmdId: number,
    paramDoSmdDetailId: number,
    paramDoSmdVehicleId: number,
    paramLatitude: string,
    paramLongitude: string,
    paramDoSmdDepartureScheduleDate: Date,
    paramBranchId: number,
    paramDoSmdStatusId: number,
    paramSealNumber: string,
    paramReasonId: number,
    userId: number,
  ) {
    const dataDoSmdHistory = DoSmdHistory.create({
      doSmdId: paramDoSmdId,
      doSmdDetailId: paramDoSmdDetailId,
      doSmdTime: paramDoSmdDepartureScheduleDate,
      doSmdVehicleId: paramDoSmdVehicleId,
      userId,
      branchId: paramBranchId,
      latitude: paramLatitude,
      longitude: paramLongitude,
      doSmdStatusId: paramDoSmdStatusId,
      departureScheduleDateTime: paramDoSmdDepartureScheduleDate,
      sealNumber: paramSealNumber,
      reasonId: paramReasonId,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSmdHistory = await DoSmdHistory.insert(dataDoSmdHistory);
    return doSmdHistory.identifiers.length
      ? doSmdHistory.identifiers[0].doSmdHistoryId
      : null;
  }

}
