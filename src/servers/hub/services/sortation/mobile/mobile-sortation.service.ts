import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { MobileSortationArrivalPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-arrival.payload.vm';
import {
  MobileSortationArrivalResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-arrival.response.vm';
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';
import moment = require('moment');
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { AuthService } from '../../../../../shared/services/auth.service';
import { DoSortationHistory } from '../../../../../shared/orm-entity/do-sortation-history';
import {
  MobileSortationDepaturePayloadVm,
} from '../../../models/sortation/mobile/mobile-sortation-depature.payload.vm';
import {
  MobileSortationDepatureResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-depature.response.vm';
import { MobileSortationEndPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-end.payload.vm';
import { MobileSortationEndResponseVm } from '../../../models/sortation/mobile/mobile-sortation-end.response.vm';
import {
  MobileSortationContinuePayloadVm,
} from '../../../models/sortation/mobile/mobile-sortation-continue.payload.vm';
import {
  MobileSortationContinueResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-continue.response.vm';
import { AttachmentTms } from '../../../../../shared/orm-entity/attachment-tms';
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import {
  MobileSortationUploadImageResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-upload-image.response.vm';
import { DoSortationAttachment } from '../../../../../shared/orm-entity/do-sortation-attachment';
import {
  MobileSortationUploadImagePayloadVm,
} from '../../../models/sortation/mobile/mobile-sortation-upload-image.payload.vm';
import { DO_SORTATION_STATUS } from '../../../../../shared/constants/do-sortation-status.constant';
import {
  BagScanOutBranchSortirQueueService,
} from '../../../../queue/services/bag-scan-out-branch-sortir-queue.service';
import { DoSortationVehicle } from '../../../../../shared/orm-entity/do-sortation-vehicle';
import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { MobileSortationCancelPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-cancel.payload.vm';
import { MobileSortationCancelResponseVm } from '../../../models/sortation/mobile/mobile-sortation-cancel.response.vm';
import { MobileSortationProblemPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-problem.payload.vm';
import {
  MobileSortationProblemResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-problem.response.vm';
import { PinoLoggerService } from '../../../../../shared/services/pino-logger.service';
import { DoSmdDetailAttachment } from '../../../../../shared/orm-entity/do_smd_detail_attachment';
import {
  MobileSortationHandoverPayloadVm,
} from '../../../models/sortation/mobile/mobile-sortation-handover.payload.vm';
import {
  MobileSortationHandoverResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-handover.response.vm';
import { getManager } from 'typeorm';
import {
  MobileSortationHanoverImageResponseVm
} from '../../../models/sortation/mobile/mobile-sortation-hanover-image.response.vm';
import {
  MobileSortationHandoverImagePayloadVm
} from '../../../models/sortation/mobile/mobile-sortation-handover-image.payload.vm';

@Injectable()
export class MobileSortationService {

  static async scanOutMobileSortation(payload: MobileSortationDepaturePayloadVm) {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationDepatureResponseVm();
    const timeNow = moment().toDate();

    const resultDoSortation = await DoSortation.findOne({
      select: [
        'depatureDateTime',
        'doSortationId',
        'branchIdFrom',
        'doSortationTime',
        'doSortationVehicleIdLast',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
      },
    });

    if (resultDoSortation) {
      await getManager().transaction(async transaction => {
        if (resultDoSortation.depatureDateTime) {
          await transaction.update(
            DoSortation,
            {
              doSortationId: payload.doSortationId,
            },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );
        } else {
          await transaction.update(
            DoSortation,
            {
              doSortationId: payload.doSortationId,
            },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
              depatureDateTime: moment().toDate(),
            },
          );
        }

        await transaction.update(
          DoSortationDetail,
          {
            doSortationId: payload.doSortationId,
            arrivalDateTime: null,
          }, {
            doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
            depatureDateTime: moment().toDate(),
            latitudeDeparture: payload.latitude,
            longitudeDeparture: payload.longitude,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          });

        if (resultDoSortation.doSortationStatusIdLast != DO_SORTATION_STATUS.ON_THE_WAY) {
          await this.createDoSortationHistory(
            transaction,
            resultDoSortation.doSortationId,
            null,
            resultDoSortation.doSortationTime,
            resultDoSortation.doSortationVehicleIdLast,
            DO_SORTATION_STATUS.ON_THE_WAY,
            resultDoSortation.branchIdFrom,
            null,
            null,
            null,
            authMeta.userId,
          );
        }

        // update status AWB & Bag queue
        BagScanOutBranchSortirQueueService.perform(
          payload.doSortationId,
          resultDoSortation.branchIdFrom,
          authMeta.userId,
        );
      });


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
  }

  static async scanInEndMobileSortation(payload: MobileSortationEndPayloadVm) {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationEndResponseVm();
    const timeNow = moment().toDate();

    const resultDoSortationDetail = await DoSortationDetail.findOne({
      select: [
        'doSortationDetailId',
        'doSortationId',
        'doSortationTime',
        'doSortationVehicleId',
        'branchIdFrom',
        'branchIdTo',
      ],
      where: {
        doSortationDetailId: payload.doSortationDetailId,
        isDeleted: false,
      },
    });

    if (resultDoSortationDetail) {
      const resultSortationDetailArrival = await DoSortationDetail.findOne({
        select: [
          'doSortationId',
        ],
        where: {
          doSortationDetailId: payload.doSortationDetailId,
          isDeleted: false,
          arrivalDateTime: null,
        },
      });

      await getManager().transaction(async transaction => {
        if (resultSortationDetailArrival) {
          await transaction.update(DoSortation, {
              doSortationId: resultDoSortationDetail.doSortationId,
            },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.RECEIVED,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });

          await transaction.update(DoSortationDetail, {
              doSortationDetailId: payload.doSortationDetailId,
            },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.RECEIVED,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });

          await this.createDoSortationHistory(
            transaction,
            resultDoSortationDetail.doSortationId,
            resultDoSortationDetail.doSortationDetailId,
            resultDoSortationDetail.doSortationTime,
            resultDoSortationDetail.doSortationVehicleId,
            DO_SORTATION_STATUS.VALID,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
            null,
            null,
            authMeta.userId,
          );

          await this.createDoSortationHistory(
            transaction,
            resultDoSortationDetail.doSortationId,
            resultDoSortationDetail.doSortationDetailId,
            resultDoSortationDetail.doSortationTime,
            resultDoSortationDetail.doSortationVehicleId,
            DO_SORTATION_STATUS.RECEIVED,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
            null,
            null,
            authMeta.userId,
          );

        } else {
          await transaction.update(DoSortation, {
              doSortationId: resultDoSortationDetail.doSortationId,
            },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.FINISHED,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });

          await transaction.update(DoSortationDetail, {
              doSortationDetailId: payload.doSortationDetailId,
            },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.FINISHED,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });

          await this.createDoSortationHistory(
            transaction,
            resultDoSortationDetail.doSortationId,
            resultDoSortationDetail.doSortationDetailId,
            resultDoSortationDetail.doSortationTime,
            resultDoSortationDetail.doSortationVehicleId,
            DO_SORTATION_STATUS.VALID,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
            null,
            null,
            authMeta.userId,
          );

          await this.createDoSortationHistory(
            transaction,
            resultDoSortationDetail.doSortationId,
            resultDoSortationDetail.doSortationDetailId,
            resultDoSortationDetail.doSortationTime,
            resultDoSortationDetail.doSortationVehicleId,
            DO_SORTATION_STATUS.RECEIVED,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
            null,
            null,
            authMeta.userId,
          );

          await this.createDoSortationHistory(
            transaction,
            resultDoSortationDetail.doSortationId,
            resultDoSortationDetail.doSortationDetailId,
            resultDoSortationDetail.doSortationTime,
            resultDoSortationDetail.doSortationVehicleId,
            DO_SORTATION_STATUS.FINISHED,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
            null,
            null,
            authMeta.userId,
          );
        }
      });
      const data = [];
      data.push({
        doSortationId: resultDoSortationDetail.doSortationId,
        doSortationDetailId: resultDoSortationDetail.doSortationDetailId,
        arrivalDateTime: moment().toDate(),
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'Sortation Success Finished';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  Do Sortation Detail ID : ` + payload.doSortationDetailId);
    }
  }

  static async scanInCancelMobileSortation(payload: MobileSortationCancelPayloadVm) {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationCancelResponseVm();
    const timeNow = moment().toDate();

    const resultDoSortationDetail = await DoSortationDetail.findOne({
      select: [
        'doSortationId',
        'depatureDateTime',
        'branchIdTo',
        'doSortationTime',
        'doSortationVehicleId',
        'branchIdFrom',
      ],
      where: {
        doSortationDetailId: payload.doSortationDetailId,
        isDeleted: false,
      },
    });

    if (resultDoSortationDetail) {
      await getManager().transaction(async transaction => {
        // update do sortation
        await transaction.update(DoSortation, {
          doSortationId: resultDoSortationDetail.doSortationId,
        }, {
          doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
          arrivalDateTime: null,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        });

        await transaction.update(DoSortationDetail, {
          doSortationDetailId: payload.doSortationDetailId,
        }, {
          doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
          arrivalDateTime: null,
          latitudeArrival: null,
          longitudeArrival: null,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        });

        await this.createDoSortationHistory(
          transaction,
          resultDoSortationDetail.doSortationId,
          resultDoSortationDetail.doSortationDetailId,
          resultDoSortationDetail.doSortationTime,
          resultDoSortationDetail.doSortationVehicleId,
          DO_SORTATION_STATUS.CANCEL_ARRIVED,
          resultDoSortationDetail.branchIdFrom,
          resultDoSortationDetail.branchIdTo,
          null,
          null,
          authMeta.userId,
        );

        await this.createDoSortationHistory(
          transaction,
          resultDoSortationDetail.doSortationId,
          resultDoSortationDetail.doSortationDetailId,
          resultDoSortationDetail.doSortationTime,
          resultDoSortationDetail.doSortationVehicleId,
          DO_SORTATION_STATUS.ON_THE_WAY,
          resultDoSortationDetail.branchIdFrom,
          resultDoSortationDetail.branchIdTo,
          null,
          null,
          authMeta.userId,
        );
      });

      const data = [];
      data.push({
        doSortationId: resultDoSortationDetail.doSortationId,
        doSortationDetailId: resultDoSortationDetail.doSortationDetailId,
        arrivalDateTime: timeNow,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'Sortation Success Cancel Arrival';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO Sortation Detail ID : ` + payload.doSortationDetailId);
    }
  }

  static async problemMobileSortation(payload: MobileSortationProblemPayloadVm, file): Promise<any> {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationProblemResponseVm();
    const timeNow = moment().toDate();

    let url = null;
    let attachmentId = null;

    const resultDoSortation = await DoSortation.findOne({
      select: [
        'doSortationId',
        'doSortationVehicleIdLast',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
      },
    });

    if (!resultDoSortation) {
      throw new BadRequestException(`Can't Find DO SORTATION ID : ` + payload.doSortationId);
    }

    const resultDoSortationArrival = await DoSortationDetail.findOne({
      select: [
        'depatureDateTime',
        'arrivalDateTime',
        'doSortationId',
        'doSortationDetailId',
        'doSortationTime',
        'doSortationVehicleId',
        'branchIdFrom',
        'branchIdTo',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
        arrivalDateTime: null,
      },
    });


    await getManager().transaction(async transaction => {
      if (resultDoSortationArrival) {
        PinoLoggerService.log('#### DEBUG USER UPLOAD IMAGE SORTATION: ', authMeta);
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
          const pathId = `sortation-delivery-${payload.imageType}`;
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
          const doSortationDelivereyAttachment = await DoSortationAttachment.create();
          doSortationDelivereyAttachment.doSortationDetailId = resultDoSortationArrival.doSortationDetailId;
          doSortationDelivereyAttachment.attachmentTmsId = attachmentId;
          doSortationDelivereyAttachment.attachmentType = payload.imageType;
          doSortationDelivereyAttachment.doSortationVehicleId = resultDoSortation.doSortationVehicleIdLast;
          await transaction.save(DoSortationAttachment, doSortationDelivereyAttachment);
        }
      } else {
        throw new BadRequestException(`DO Sortation ID : ` + payload.doSortationId + ` already arrival`);
      }

      await transaction.update(DoSortation, {
        doSortationId: resultDoSortation.doSortationId,
      }, {
        doSortationStatusIdLast: DO_SORTATION_STATUS.PROBLEM,
        userIdUpdated: authMeta.userId,
        updatedTime: timeNow,
      });

      await transaction.update(DoSortationDetail, {
        doSortationId: payload.doSortationId,
        arrivalDateTime: null,
      }, {
        doSortationStatusIdLast: DO_SORTATION_STATUS.PROBLEM,
        userIdUpdated: authMeta.userId,
        updatedTime: timeNow,
      });

      await transaction.update(DoSortationVehicle, {
        doSortationVehicleId: resultDoSortation.doSortationVehicleIdLast,
      }, {
        note: payload.reasonNote,
        userIdUpdated: authMeta.userId,
        updatedTime: timeNow,
      });

      await this.createDoSortationHistory(
        transaction,
        resultDoSortationArrival.doSortationId,
        resultDoSortationArrival.doSortationDetailId,
        resultDoSortationArrival.doSortationTime,
        resultDoSortationArrival.doSortationVehicleId,
        DO_SORTATION_STATUS.PROBLEM,
        resultDoSortationArrival.branchIdFrom,
        resultDoSortationArrival.branchIdTo,
        null,
        null,
        authMeta.userId,
      );
    });

    const data = [];
    data.push({
      doSortationId: resultDoSortation.doSortationId,
      reasonDate: timeNow,
    });
    result.statusCode = HttpStatus.OK;
    result.message = 'Sortation Success Created Problem';
    result.data = data;
    return result;

  }

  static async handoverMobileSortation(payload: MobileSortationHandoverPayloadVm) {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationHandoverResponseVm();
    const timeNow = moment().toDate();
    const resultDoSortation = await DoSortation.findOne({
      select: [
        'doSortationId',
        'doSortationVehicleIdLast',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
      },
    });

    const resultDoSortationDetail = await DoSortationDetail.findOne({
      select: [
        'depatureDateTime',
        'arrivalDateTime',
        'doSortationId',
        'doSortationDetailId',
        'doSortationTime',
        'doSortationVehicleId',
        'branchIdFrom',
        'branchIdTo',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
        arrivalDateTime: null,
      },
    });

    if (!resultDoSortationDetail) {
      throw new BadRequestException(`All Sortation Has Arrival`);
    }

    if (resultDoSortation) {
      await getManager().transaction(async transaction => {
        await transaction.update(DoSortationVehicle,
          {
            doSortationVehicleId: resultDoSortation.doSortationVehicleIdLast,
          },
          {
            note: payload.note,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          });

        const resultDoSortationVehicle = await DoSortationVehicle.findOne({
          select: ['doSortationVehicleId'],
          where: {
            doSortationId: payload.doSortationId,
            isActive: true,
            isDeleted: false,
          },
        });

        await transaction.update(DoSortation,
          {
            doSortationId: resultDoSortation.doSortationId,
          }, {
            doSortationStatusIdLast: DO_SORTATION_STATUS.DRIVER_CHANGED,
            doSortationVehicleIdLast: resultDoSortationVehicle.doSortationVehicleId,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          });

        await transaction.update(DoSortationDetail,
          {
            doSortationId: payload.doSortationId,
            arrivalDateTime: null,
          },
          {
            doSortationStatusIdLast: DO_SORTATION_STATUS.DRIVER_CHANGED,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          });

        await this.createDoSortationHistory(
          transaction,
          resultDoSortationDetail.doSortationId,
          resultDoSortationDetail.doSortationDetailId,
          resultDoSortationDetail.doSortationTime,
          resultDoSortationDetail.doSortationVehicleId,
          DO_SORTATION_STATUS.DRIVER_CHANGED,
          resultDoSortationDetail.branchIdFrom,
          resultDoSortationDetail.branchIdTo,
          null,
          null,
          authMeta.userId,
        );
      });

      const data = [];
      data.push({
        doSortationId: resultDoSortation.doSortationId,
        handoverDate: timeNow,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'Sortation Success Handover';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Can't Find  DO SORTATION ID : ` + payload.doSortationId);
    }

  }

  static async scanInMobileSortation(payload: MobileSortationArrivalPayloadVm) {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationArrivalResponseVm();
    const timeNow = moment().toDate();
    const data = [];
    const resultSortationDetail = await DoSortationDetail.findOne({
      select: [
        'depatureDateTime',
        'arrivalDateTime',
        'doSortationId',
        'doSortationDetailId',
        'doSortationTime',
        'doSortationVehicleId',
        'branchIdFrom',
        'branchIdTo',
      ],
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
          await getManager().transaction(async transaction => {
            // Ubah Status 4000 Arrived
            await transaction.update(DoSortation,
              {
                doSortationId: resultSortationDetail.doSortationId,
              },
              {
                doSortationStatusIdLast: DO_SORTATION_STATUS.HAS_ARRIVED,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                arrivalDateTime: moment().toDate(),
              },
            );

            await transaction.update(DoSortationDetail, {
                doSortationDetailId: payload.doSortationDetailId,
                arrivalDateTime: null,
              },
              {
                doSortationStatusIdLast: DO_SORTATION_STATUS.HAS_ARRIVED,
                arrivalDateTime: moment().toDate(),
                latitudeArrival: payload.latitude,
                longitudeArrival: payload.longitude,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              });

            await this.createDoSortationHistory(
              transaction,
              resultSortationDetail.doSortationId,
              resultSortationDetail.doSortationDetailId,
              resultSortationDetail.doSortationTime,
              resultSortationDetail.doSortationVehicleId,
              DO_SORTATION_STATUS.HAS_ARRIVED,
              resultSortationDetail.branchIdFrom,
              resultSortationDetail.branchIdTo,
              null,
              null,
              authMeta.userId,
            );
          });

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
  }

  public static async continueMobileSortation(payload: MobileSortationContinuePayloadVm) {
    try {
      const authMeta = AuthService.getAuthData();
      const result = new MobileSortationContinueResponseVm();
      const timeNow = moment().toDate();

      const resultDoSortation = await DoSortation.findOne({
        where: {
          doSortationId: payload.doSortationId,
          isDeleted: false,
        },
      });

      if (resultDoSortation) {
        await getManager().transaction(async transaction => {
          await transaction.update(DoSortation, {
            doSortationId: payload.doSortationId,
          }, {
            doSortationStatusIdLast: 3000,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          });

          await transaction.update(DoSortationDetail,
            { doSortationId: payload.doSortationId, arrivalDateTime: null },
            {
              doSortationStatusIdLast: 3000,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );

          await this.createDoSortationHistory(
            transaction,
            resultDoSortation.doSortationId,
            null,
            resultDoSortation.doSortationTime,
            resultDoSortation.doSortationVehicleIdLast,
            3000,
            null,
            null,
            payload.reasonId,
            null,
            authMeta.userId,
          );
        });

        const data = [];
        data.push({
          doSortationId: resultDoSortation.doSortationId,
        });
        result.statusCode = HttpStatus.OK;
        result.message = 'Sortation Success Created Continue';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`Can't Find  Do Sortation ID : ` + payload.doSortationId);
      }
    } catch (e) {
      throw e.error;
    }
  }

  public static async uploadImageMobileSortationHandover(payload: MobileSortationHandoverImagePayloadVm, file) {
    const result = new MobileSortationHanoverImageResponseVm();
    const authMeta = AuthService.getAuthData();
    PinoLoggerService.log('#### DEBUG USER UPLOAD IMAGE SORTATION HANDOVER: ', authMeta);

    let url = null;
    let attachmentId = null;

    const resultDoSortation = await DoSortation.findOne({
      select: [
        'doSortationId',
        'doSortationVehicleIdLast',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
      },
    });

    const resultDoSortationDetail = await DoSortationDetail.findOne({
      select: [
        'depatureDateTime',
        'arrivalDateTime',
        'doSortationId',
        'doSortationDetailId',
        'doSortationTime',
        'doSortationVehicleId',
        'branchIdFrom',
        'branchIdTo',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
        arrivalDateTime: null,
      },
    });

    if (!resultDoSortationDetail) {
      throw new BadRequestException(`All Sortation Has Arrival`);
    }

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      },
      lock: { mode: 'pessimistic_write' },
    });

    if (attachment) {
      attachmentId = attachment.attachmentTmsId;
      url = attachment.url;
    } else {
      const pathId = `sortation-delivery-${payload.imageType}`;
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

    await getManager().transaction(async transaction => {
      const doSortationAttachment = await DoSortationAttachment.create();
      doSortationAttachment.doSortationDetailId = resultDoSortationDetail.doSortationDetailId;
      doSortationAttachment.attachmentTmsId = attachmentId;
      doSortationAttachment.attachmentType = payload.imageType;
      doSortationAttachment.doSortationVehicleId = resultDoSortation.doSortationVehicleIdLast;
      await transaction.save(DoSortationAttachment, doSortationAttachment);
    });

    const data = [];
    data.push({
      url,
      attachmentId,
    });
    result.statusCode = HttpStatus.OK;
    result.message = 'Sortation upload image Handover';
    result.data = data;
    return result;
  }

  public static async uploadImageMobileSortation(payload: MobileSortationUploadImagePayloadVm, file) {
    const authMeta = AuthService.getAuthData();
    PinoLoggerService.log('#### DEBUG USER UPLOAD IMAGE SORTATION: ', authMeta);
    const result = new MobileSortationUploadImageResponseVm();
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
      const pathId = `sortation-delivery-${payload.imageType}`;
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

    if (attachmentId) {
      const sql = ` select
                        dsv.do_sortation_vehicle_id
                    from
                        do_sortation_detail dsd
                        INNER JOIN do_sortation_vehicle dsv ON dsv.do_sortation_id = dsd.do_sortation_id
                        AND dsv.is_deleted = false
                    WHERE dsd.do_sortation_detail_id = '${payload.doSortationDetailId}'
                    AND dsd.is_deleted = false
                    limit 1`;
      const resultData = await RawQueryService.query(sql);
      await getManager().transaction(async transaction => {
        const doSortationAttachment = await DoSortationAttachment.create();
        doSortationAttachment.doSortationDetailId = payload.doSortationDetailId;
        doSortationAttachment.attachmentTmsId = attachmentId;
        doSortationAttachment.attachmentType = payload.imageType;
        doSortationAttachment.doSortationVehicleId = resultData[0].do_sortation_vehicle_id;
        await transaction.save(DoSortationAttachment, doSortationAttachment);
      });
    }

    const data = [];
    data.push({
      url,
      attachmentId,
    });
    result.statusCode = HttpStatus.OK;
    result.message = 'Sortation upload image Continue';
    result.data = data;
    return result;
  }

  public static async createDoSortationHistory(
    transaction,
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
    const dataDoSortationHistory = transaction.create(DoSortationHistory, {
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

    await DoSortationHistory.insert(dataDoSortationHistory);
  }
}
