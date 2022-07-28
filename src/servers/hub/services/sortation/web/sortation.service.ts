import { Injectable } from '@nestjs/common';
import moment = require('moment');
import { EntityManager, getManager } from 'typeorm';
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';
import { DoSortationDetailItem } from '../../../../../shared/orm-entity/do-sortation-detail-item';
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
    vehicleSeq: number,
    employeeDriverId: number,
    branchIdLogin: number,
    userIdLogin: number,
  ): Promise<string | null> {
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
    reasonNote?: string | null,
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
      reasonNote,
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

  static async createDoSortationDetailItem(
    doSortationDetailId: string,
    bagItemId: number,
    isSortir: boolean,
    userId: number,
    transactional: EntityManager,
  ) {
    const dataDoSortationDetailItem = DoSortationDetailItem.create({
      doSortationDetailId,
      bagItemId,
      isSortir: isSortir ? isSortir : false,
      userIdCreated: userId,
      createdTime: moment().toDate(),
      userIdUpdated: userId,
      updatedTime: moment().toDate(),
    });

    await transactional.insert(DoSortationDetailItem, dataDoSortationDetailItem);
  }

  static async createDoSortationVehicleHandover(
    transactional: EntityManager,
    doSortationId: string,
    vehicleId: number,
    vehicleNumber: string,
    vehicleSeq: number,
    employeeDriverId: number,
    branchIdLogin: number,
    userIdLogin: number,
  ): Promise<string | null> {
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
    const doSortationVehicle = await transactional.insert(DoSortationVehicle, dataDoSortationVehicle);
    return doSortationVehicle.identifiers.length
      ? doSortationVehicle.identifiers[0].doSortationVehicleId
      : null;
  }

  static async createDoSortationHandoverHistory(
    transactional: EntityManager,
    doSortationId: string,
    doSortationDetailId: string,
    doSortationVehicleId: string,
    doSortationTime: Date,
    branchId: number,
    doSortationStatusId: number,
    reasonId: number,
    userId: number,
    reasonNote?: string | null,
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
      reasonNote,
    });
    const doSortationHistory = await transactional.insert(DoSortationHistory, dataDoSortationHistory);
    return doSortationHistory.identifiers.length
      ? doSortationHistory.identifiers[0].doSortationHistoryId
      : null;
  }
}