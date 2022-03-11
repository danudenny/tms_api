import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';
import { DoSortationHistory } from '../../../../../shared/orm-entity/do-sortation-history';
import { DoSortationVehicle } from '../../../../../shared/orm-entity/do-sortation-vehicle';

@Injectable()
export class SortationService {

  static async createDoSortation(
    doSortationCode: string,
    doSortationTime: Date,
    branchIdLogin: number,
    userIdLogin: number,
    trip: number,
    note: string,
    doSortationStatusIdLast: number,
  ) {
    const dataDoSortation = DoSortation.create({
      doSortationCode,
      doSortationTime,
      trip,
      totalVehicle: 1,
      branchIdFrom: branchIdLogin,
      note,
      userIdCreated: userIdLogin,
      createdTime: moment().toDate(),
      userIdUpdated: userIdLogin,
      updatedTime: moment().toDate(),
      doSortationStatusIdLast,
    });
    const doSortation = await DoSortation.insert(dataDoSortation);
    return doSortation.identifiers.length
      ? doSortation.identifiers[0].doSortationId
      : null;
  }

  static async createDoSortationVehicle(
    doSortationId: string,
    vehicleId: number,
    vehicleNumber: string,
    employeeDriverId: number,
    branchIdLogin: number,
    userIdLogin: number,
    vehicleSeq: number,
  ) {
    const dataDoSortationVehicle = DoSortationVehicle.create({
      doSortationId,
      vehicleId,
      vehicleNumber,
      vehicleSeq,
      employeeDriverId,
      branchIdCreated: branchIdLogin,
      userIdCreated: userIdLogin,
      createdTime: moment().toDate(),
      userIdUpdated: userIdLogin,
      updatedTime: moment().toDate(),
    });
    const doSortationVehicle = await DoSortationVehicle.insert(dataDoSortationVehicle);
    return doSortationVehicle.identifiers.length
      ? doSortationVehicle.identifiers[0].doSortationVehicleId
      : null;
  }

  static async createDoSortationHistory(
    doSortationId: string,
    doSortationDetailId: string,
    doSortationVehicleId: string,
    doSortationTime: Date,
    branchId: number,
    doSortationStatusId: number,
    reasonId: number,
    userId: number,
  ) {
    const dataDoSortationHistory = DoSortationHistory.create({
      doSortationId,
      doSortationDetailId,
      doSortationStatusId,
      doSortationVehicleId,
      doSortationTime,
      branchIdFrom: branchId,
      reasonId,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });
    const doSortationHistory = await DoSortationHistory.insert(dataDoSortationHistory);
    return doSortationHistory.identifiers.length
      ? doSortationHistory.identifiers[0].doSortationHistoryId
      : null;
  }

  static async createDoSortationDetail(
    doSortationId: string,
    doSortationVehicleId: string,
    doSortationTime: Date,
    branchIdLogin: number,
    branchIdTo: number,
    userId: number,
    doSortationStatusIdLast: number,
  ) {
    const dataDoSortationDetail = DoSortationDetail.create({
      doSortationId,
      doSortationVehicleId,
      doSortationTime,
      branchIdFrom: branchIdLogin,
      branchIdTo,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
      doSortationStatusIdLast,
    });
    const doSortationDetail = await DoSortationDetail.insert(dataDoSortationDetail);
    return doSortationDetail.identifiers.length
      ? doSortationDetail.identifiers[0].doSortationDetailId
      : null;
  }

}
