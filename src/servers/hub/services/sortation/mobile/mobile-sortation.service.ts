import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { MobileSortationArrivalPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-arrival.payload.vm';
import { MobileSortationArrivalResponseVm } from '../../../models/sortation/mobile/mobile-sortation-arrival.response.vm';
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';
import moment = require('moment');
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { AuthService } from '../../../../../shared/services/auth.service';
import { DoSortationHistory } from '../../../../../shared/orm-entity/do-sortation-history';
import { MobileSortationDepaturePayloadVm } from '../../../models/sortation/mobile/mobile-sortation-depature.payload.vm';
import { MobileSortationDepatureResponseVm } from '../../../models/sortation/mobile/mobile-sortation-depature.response.vm';

@Injectable()
export class MobileSortationService {

  static async scanOutMobileSortation(payload: MobileSortationDepaturePayloadVm) {
    try {
      const authMeta = AuthService.getAuthData();
      const result = new MobileSortationDepatureResponseVm();
      const timeNow = moment().toDate();

      const resultDoSortation = await DoSortation.findOne({
        where: {
          doSortationId: payload.doSortationId,
          isDeleted: false,
        },
      });

      if (resultDoSortation) {
        if (resultDoSortation.depatureDateTime) {
          await DoSortation.update(
            {
              doSortationId: payload.doSortationId,
            },
            {
              doSortationStatusIdLast: 3000,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );
        } else {
          await DoSortation.update(
            {
              doSortationId: payload.doSortationId,
            },
            {
              doSortationStatusIdLast: 3000,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
              depatureDateTime: moment().toDate(),
            },
          );
        }

        await DoSortationDetail.update({
          doSortationId: payload.doSortationId,
          arrivalDateTime: null,
        }, {
          doSortationStatusIdLast: 3000,
          depatureDateTime: moment().toDate(),
          latitudeDeparture: payload.latitude,
          longitudeDeparture: payload.longitude,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        });

        if (resultDoSortation.doSortationStatusIdLast != 3000) {
          await this.createDoSortationHistory(
            resultDoSortation.doSortationId,
            null,
            resultDoSortation.doSortationTime,
            resultDoSortation.doSortationVehicleIdLast,
            3000,
            resultDoSortation.branchIdFrom,
            null,
            null,
            null,
            authMeta.userId,
          );
        }

        // update status AWB & Bag queue

        const data = [];
        data.push({
          doSortationId: resultDoSortation.doSortationId,
          departureDateTime: resultDoSortation.doSortationTime,
        });

        result.statusCode = HttpStatus.OK;
        result.message = 'Sortation Success Departure';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`Can't Find  Do Sortation ID : ` + payload.doSortationId);
      }
    } catch (e) {
      throw e.error;
    }
  }

  static async scanInMobileSortation(payload: MobileSortationArrivalPayloadVm) {
    try {
      const authMeta = AuthService.getAuthData();
      const result = new MobileSortationArrivalResponseVm();
      const timeNow = moment().toDate();
      const data = [];
      const resultSortationDetail = await DoSortationDetail.findOne({
        where: {
          doSortationDetailId: payload.doSortationDetailId,
          isDeleted: false,
        },
      });

      if (resultSortationDetail) {
        if (resultSortationDetail.depatureDateTime) {
          if (resultSortationDetail.arrivalDateTime) {
            // handle status telah tiba (arrival)
            result.statusCode = HttpStatus.OK;
            result.message = 'Sortation Already Arrived';
            data.push({
              doSortationId: resultSortationDetail.doSortationId,
              doSortationDetailId: resultSortationDetail.doSortationDetailId,
              arrivalDateTime: resultSortationDetail.arrivalDateTime,
            });
            result.data = data;
            return result;
          } else {
            // Ubah Status 4000 Arrived
            await DoSortation.update(
              {
                doSortationId: resultSortationDetail.doSortationId,
              },
              {
                doSortationStatusIdLast: 4000,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                arrivalDateTime: moment().toDate(),
              },
            );

            await DoSortationDetail.update({
                doSortationDetailId: payload.doSortationDetailId,
                arrivalDateTime: null,
              },
              {
                doSortationStatusIdLast: 4000,
                arrivalDateTime: moment().toDate(),
                latitudeArrival: payload.latitude,
                longitudeArrival: payload.longitude,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              });
            await this.createDoSortationHistory(
              resultSortationDetail.doSortationId,
              resultSortationDetail.doSortationDetailId,
              resultSortationDetail.doSortationTime,
              resultSortationDetail.doSortationVehicleId,
              4000,
              resultSortationDetail.branchIdFrom,
              resultSortationDetail.branchIdTo,
              null,
              null,
              authMeta.userId,
            );

            result.statusCode = HttpStatus.OK;
            result.message = 'Sortation Success Arrival';
            data.push({
              doSortationId: resultSortationDetail.doSortationId,
              doSortationDetailId: resultSortationDetail.doSortationDetailId,
              arrivalDateTime: resultSortationDetail.arrivalDateTime,
            });
            result.data = data;
            return result;
          }
        } else {
          throw new BadRequestException(`DO Sortation Detail Id : ` + payload.doSortationDetailId + ' Has Not Departure Date');
        }
      } else {
        throw new BadRequestException(`DO Sortation Detail Id : ` + payload.doSortationDetailId + ' Not Found');
      }
    } catch (e) {
      throw e.error;
    }
  }

  public static async createDoSortationHistory(
    doSortationId: string,
    doSortationDetailId: string,
    doSortationTime: Date,
    doSortationVehicleId: string,
    doSortationStatusId: number,
    branchIdFrom: number,
    branchIdTo: number,
    reasonId: number,
    reasonNote: string,
    userId: number,
  ) {
    const dataDoSortationHistory = DoSortationHistory.create({
      doSortationId,
      doSortationDetailId,
      doSortationTime,
      doSortationVehicleId,
      doSortationStatusId,
      branchIdFrom,
      branchIdTo,
      reasonId,
      reasonNote,
      userIdCreated: userId,
      userIdUpdated: userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
    });

    const doSortationHistory = await DoSortationHistory.insert(dataDoSortationHistory);
    return doSortationHistory.identifiers.length ? doSortationHistory[0].doSortationHistoryId : null;
  }
}
