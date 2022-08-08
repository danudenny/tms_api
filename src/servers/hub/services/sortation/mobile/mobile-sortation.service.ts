import { BadRequestException, HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
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
import { getManager } from 'typeorm';
import { RepositoryService } from '../../../../../shared/services/repository.service';
import {MobileSortationHandoverPayloadVm} from '../../../models/sortation/mobile/mobile-sortation-handover.payload.vm';
import {
  MobileSortationHandoverResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-handover.response.vm';
import {
  MobileSortationHandoverImagePayloadVm,
} from '../../../models/sortation/mobile/mobile-sortation-handover-image.payload.vm';
import {
  MobileSortationHanoverImageResponseVm,
} from '../../../models/sortation/mobile/mobile-sortation-hanover-image.response.vm';
import {NearlyBranchService} from '../../../../../shared/services/nearly-branch.service';
import {ConfigService} from '../../../../../shared/services/config.service';

@Injectable()
export class MobileSortationService {

  static async scanOutMobileSortation(payload: MobileSortationDepaturePayloadVm) {
    console.log('MobileSortationService - scanOutMobileSortation - START DEPARTURE');
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
        'doSortationStatusIdLast',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
      },
    });

    console.log('MobileSortationService - scanOutMobileSortation - RESULT DO SORTATION : ', JSON.stringify(resultDoSortation));

    if (!resultDoSortation) {
      throw new BadRequestException(`Do Sortation ID : ` + payload.doSortationId + ` Tidak di temukan`);
    }

    const validateOtw = [DO_SORTATION_STATUS.ASSIGNED, DO_SORTATION_STATUS.DRIVER_CHANGED, DO_SORTATION_STATUS.DELIVERED];
    if (!validateOtw.includes(Number(resultDoSortation.doSortationStatusIdLast))) {
      throw new UnprocessableEntityException(`Status Terakhir Sortation Bukan ASSIGN, DRIVER_CHANGED, atau DELIVERED .`);
    }

    const repo = RepositoryService.doSortationDetail;
    const q = repo.findOneRaw()
      .selectRaw(
        ['do_sortation_detail.doSortationDetailId', 'doSortationDetailId'],
        ['do_sortation_detail.branchTo', 'branchIdTo'])
      .andWhere(
        e => e.doSortationId,
        w => w.equals(payload.doSortationId),
      )
      .andWhere(
        e => e.arrivalDateTime,
        w => w.isNotNull(),
      )
      .andWhere(
        e => e.isDeleted,
        w => w.isFalse(),
      )
      .orderBy({ arrivalDateTime: 'DESC' })
      .take(1);

    const departedDetail = await q.exec();

    console.log('MobileSortationService - scanOutMobileSortation - RESULT DO SORTATION DETAIL : ', JSON.stringify(departedDetail));

    await getManager().transaction(async transaction => {
      if (resultDoSortation.depatureDateTime) {
        console.log('MobileSortationService - scanOutMobileSortation - DEPARTURE DATE TIME IS NOT NULL / ALREADY DEPARTURE - UPDATE DO SORTATION');
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
        console.log('MobileSortationService - scanOutMobileSortation - DEPARTURE DATE TIME IS NOT NULL / ALREADY DEPARTURE - END UPDATE DO SORTATION');
      } else {
        console.log('MobileSortationService - scanOutMobileSortation - DEPARTURE DATE TIME IS NULL / UPDATE DEPARTURE TIME DO SORTATION - UPDATE DO SORTATION');
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
      console.log('MobileSortationService - scanOutMobileSortation - DEPARTURE DATE TIME IS NULL / UPDATE DEPARTURE TIME DO SORTATION - END UPDATE DO SORTATION');
      console.log('MobileSortationService - scanOutMobileSortation - UPDATE DO SORTATION DETAIL');
      await transaction.update(
        DoSortationDetail,
        {
          doSortationId: payload.doSortationId,
          arrivalDateTime: null,
        },
        {
          doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
          depatureDateTime: moment().toDate(),
          latitudeDeparture: payload.latitude,
          longitudeDeparture: payload.longitude,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );
      console.log('MobileSortationService - scanOutMobileSortation - END UPDATE DO SORTATION DETAIL');
      await this.createDoSortationHistory(
        transaction,
        resultDoSortation.doSortationId,
        null,
        resultDoSortation.doSortationTime,
        resultDoSortation.doSortationVehicleIdLast,
        DO_SORTATION_STATUS.ON_THE_WAY,
        departedDetail ? departedDetail.branchIdTo : resultDoSortation.branchIdFrom,
        null,
        null,
        authMeta.userId,
      );
    });

    if (!departedDetail) {
      console.log('MobileSortationService - scanOutMobileSortation - CHECK HAS PROBLEM IN DO SORTATION HISTORY');
      // check has problem
      const checkDoSortationHistory = await DoSortationHistory.findOne({
        select: [
          'doSortationHistoryId',
        ],
        where: {
          doSortationId: resultDoSortation.doSortationId,
          doSortationStatusId: DO_SORTATION_STATUS.PROBLEM,
        },
      });
      console.log('MobileSortationService - scanOutMobileSortation - RESULT HAS PROBLEM IN DO SORTATION HISTORY : ', JSON.stringify(checkDoSortationHistory));
      if (!checkDoSortationHistory) {
        // update status AWB & Bag queue
        console.log('MobileSortationService - scanOutMobileSortation - CALL BULL BagScanOutBranchSortirQueueService');
        await BagScanOutBranchSortirQueueService.perform(
            payload.doSortationId,
            resultDoSortation.branchIdFrom,
            authMeta.userId,
        );
        console.log('MobileSortationService - scanOutMobileSortation - END CALL BULL BagScanOutBranchSortirQueueService');
      }
    }

    const data = [];
    data.push({
      doSortationId: resultDoSortation.doSortationId,
      departureDateTime: resultDoSortation.doSortationTime,
    });

    result.statusCode = HttpStatus.OK;
    result.message = 'Sortation - Sukses Slide Berangkat';
    result.data = data;
    console.log('MobileSortationService - scanOutMobileSortation - END DEPARTURE');
    return result;
  }

  static async scanInEndMobileSortation(payload: MobileSortationEndPayloadVm) {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationEndResponseVm();
    const timeNow = moment().toDate();

    const repo = RepositoryService.doSortationDetail;
    const q = repo.findOneRaw();
    q.selectRaw(
      ['do_sortation_detail.doSortationDetailId', 'doSortationDetailId'],
      ['do_sortation_detail.doSortationId', 'doSortationId'],
      ['do_sortation_detail.doSortationTime', 'doSortationTime'],
      ['do_sortation_detail.branchIdFrom', 'branchIdFrom'],
      ['do_sortation_detail.branchIdTo', 'branchIdTo'],
      ['ds.doSortationVehicleIdLast', 'doSortationVehicleId'],
    )
      .innerJoin(e => e.doSortation, 'ds', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .andWhere(
        e => e.doSortationDetailId,
        w => w.equals(payload.doSortationDetailId),
      )
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .take(1);

    const resultDoSortationDetail = await q.exec();

    if (resultDoSortationDetail) {
      // validated nearly branch
      const resultSortationDetailArrival = await DoSortationDetail.findOne({
        select: [
          'doSortationId',
        ],
        where: {
          doSortationId: resultDoSortationDetail.doSortationId,
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
              doSortationStatusIdLast: DO_SORTATION_STATUS.DELIVERED,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });

          await transaction.update(DoSortationDetail, {
              doSortationDetailId: payload.doSortationDetailId,
            },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.DELIVERED,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            });

          await this.createDoSortationHistory(
            transaction,
            resultDoSortationDetail.doSortationId,
            resultDoSortationDetail.doSortationDetailId,
            resultDoSortationDetail.doSortationTime,
            resultDoSortationDetail.doSortationVehicleId,
            DO_SORTATION_STATUS.DELIVERED,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
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
            DO_SORTATION_STATUS.DELIVERED,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
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
      result.message = 'Sortation - Sukses Slide Selesai';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`Do Sortation Detail ID : ` + payload.doSortationDetailId + ` Tidak di temukan`);
    }
  }

  static async scanInCancelMobileSortation(payload: MobileSortationCancelPayloadVm) {
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationCancelResponseVm();
    const timeNow = moment().toDate();

    const repo = RepositoryService.doSortationDetail;
    const q = repo.findOneRaw();
    q.selectRaw(
      ['do_sortation_detail.doSortationId', 'doSortationId'],
      ['do_sortation_detail.depatureDateTime', 'depatureDateTime'],
      ['do_sortation_detail.branchIdTo', 'branchIdTo'],
      ['do_sortation_detail.doSortationTime', 'doSortationTime'],
      ['do_sortation_detail.branchIdFrom', 'branchIdFrom'],
      ['ds.doSortationVehicleIdLast', 'doSortationVehicleId'],
      ['ds.doSortationStatusIdLast', 'doSortationStatusIdLast'],
    )
      .innerJoin(e => e.doSortation, 'ds', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .andWhere(
        e => e.doSortationDetailId,
        w => w.equals(payload.doSortationDetailId),
      )
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .take(1);

    const resultDoSortationDetail = await q.exec();

    if (resultDoSortationDetail) {
      if (resultDoSortationDetail.doSortationStatusIdLast != DO_SORTATION_STATUS.HAS_ARRIVED) {
        throw new UnprocessableEntityException('Status Terakhir Sortation harus ARRIVED');
      }

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
      result.message = 'Sortation - Sukses Slide batal Tiba';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`DO Sortation Detail ID : ` + payload.doSortationDetailId + ` Tidak di temukan`);
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
        'doSortationStatusIdLast',
      ],
      where: {
        doSortationId: payload.doSortationId,
        isDeleted: false,
      },
    });

    if (!resultDoSortation) {
      throw new BadRequestException(`DO SORTATION ID : ` + payload.doSortationId + ` Tidak di temukan`);
    }

    if (resultDoSortation.doSortationStatusIdLast != DO_SORTATION_STATUS.ON_THE_WAY) {
      throw new UnprocessableEntityException(`Status Terakhir sortation harus ON THE WAY.`);
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
          // lock: { mode: 'pessimistic_write' },
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
        throw new BadRequestException(`DO Sortation ID : ` + payload.doSortationId + ` Sudah Tiba`);
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
        resultDoSortation.doSortationVehicleIdLast,
        DO_SORTATION_STATUS.PROBLEM,
        resultDoSortationArrival.branchIdFrom,
        resultDoSortationArrival.branchIdTo,
        payload.reasonNote,
        authMeta.userId,
      );
    });

    const data = [];
    data.push({
      doSortationId: resultDoSortation.doSortationId,
      reasonDate: timeNow,
    });
    result.statusCode = HttpStatus.OK;
    result.message = 'Sortation - Sukeses Pelaporan Masalah';
    result.data = data;
    return result;

  }

  static async scanInMobileSortation(payload: MobileSortationArrivalPayloadVm) {
    console.log('MobileSortationService - scanInMobileSortation - START ARRIVAL');
    const authMeta = AuthService.getAuthData();
    const result = new MobileSortationArrivalResponseVm();
    const timeNow = moment().toDate();
    const data = [];

    const repo = RepositoryService.doSortationDetail;
    const q = repo.findOneRaw();
    q.selectRaw(
      ['do_sortation_detail.depatureDateTime', 'depatureDateTime'],
      ['do_sortation_detail.arrivalDateTime', 'arrivalDateTime'],
      ['do_sortation_detail.doSortationId', 'doSortationId'],
      ['do_sortation_detail.doSortationDetailId', 'doSortationDetailId'],
      ['do_sortation_detail.doSortationTime', 'doSortationTime'],
      ['do_sortation_detail.branchIdFrom', 'branchIdFrom'],
      ['do_sortation_detail.branchIdTo', 'branchIdTo'],
      ['ds.doSortationVehicleIdLast', 'doSortationVehicleId'],
      ['ds.doSortationStatusIdLast', 'doSortationStatusIdLast'],
    )
      .innerJoin(e => e.doSortation, 'ds', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      )
      .andWhere(
        e => e.doSortationDetailId,
        w => w.equals(payload.doSortationDetailId),
      )
      .andWhere(e => e.isDeleted, w => w.isFalse())
      .take(1);

    const resultSortationDetail = await q.exec();
    console.log('MobileSortationService - scanInMobileSortation - RESULT SORTATION DETAIL : ', JSON.stringify(resultSortationDetail));
    if (resultSortationDetail) {
      // const radius: number = ConfigService.get('nearlyBranch.radius.sortation'); // in kilometer
      // await NearlyBranchService.validateNearlyBranch(payload.latitude, payload.longitude, resultSortationDetail.branchIdTo, radius);
      if (resultSortationDetail.doSortationStatusIdLast != DO_SORTATION_STATUS.ON_THE_WAY) {
        throw new UnprocessableEntityException('Status Terakhir Sortation harus ON THE WAY.');
      }

      if (resultSortationDetail.depatureDateTime) {
        if (resultSortationDetail.arrivalDateTime) {
          // handle status telah tiba (arrival)
          result.statusCode = HttpStatus.OK;
          result.message = 'Sortation - Telah Tiba';
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
            console.log('MobileSortationService - scanInMobileSortation - UPDATE DO SORTATION');
            await transaction.update(DoSortation,
              {
                doSortationId: resultSortationDetail.doSortationId,
              },
              {
                doSortationStatusIdLast: DO_SORTATION_STATUS.HAS_ARRIVED,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
                arrivalDateTime: timeNow,
              },
            );
            console.log('MobileSortationService - scanInMobileSortation - END UPDATE DO SORTATION');
            console.log('MobileSortationService - scanInMobileSortation - UPDATE DO SORTATION DETAIL');
            await transaction.update(DoSortationDetail, {
                doSortationDetailId: payload.doSortationDetailId,
                arrivalDateTime: null,
              },
              {
                doSortationStatusIdLast: DO_SORTATION_STATUS.HAS_ARRIVED,
                arrivalDateTime: timeNow,
                latitudeArrival: payload.latitude,
                longitudeArrival: payload.longitude,
                userIdUpdated: authMeta.userId,
                updatedTime: timeNow,
              });
            console.log('MobileSortationService - scanInMobileSortation - END UPDATE DO SORTATION DETAIL');

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
              authMeta.userId,
            );
          });

          result.statusCode = HttpStatus.OK;
          result.message = 'Sortation - Sukses Slide Tiba';
          data.push({
            doSortationId: resultSortationDetail.doSortationId,
            doSortationDetailId: resultSortationDetail.doSortationDetailId,
            arrivalDateTime: resultSortationDetail.arrivalDateTime,
          });
          result.data = data;
          console.log('MobileSortationService - scanInMobileSortation - END ARRIVAL');
          return result;
        }
      } else {
        throw new BadRequestException(`DO Sortation Detail Id : ` + payload.doSortationDetailId + ' Belum Slide Berangkat');
      }
    } else {
      throw new BadRequestException(`DO Sortation Detail Id : ` + payload.doSortationDetailId + ' Tidak di temukan');
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
            doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          });

          await transaction.update(DoSortationDetail,
            { doSortationId: payload.doSortationId, arrivalDateTime: null },
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.ON_THE_WAY,
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
            DO_SORTATION_STATUS.ON_THE_WAY,
            resultDoSortation.branchIdFrom,
            null,
            null,
            authMeta.userId,
          );
        });

        const data = [];
        data.push({
          doSortationId: resultDoSortation.doSortationId,
        });

        result.statusCode = HttpStatus.OK;
        result.message = 'Sortation - Sulses Slide lanjut berangkat';
        result.data = data;
        return result;
      } else {
        throw new BadRequestException(`Do Sortation ID : ` + payload.doSortationId + ` Tidak di temukan`);
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

    const sql = ` select
        dsv.do_sortation_vehicle_id,
        dsd.do_sortation_detail_id
    from
        do_sortation_detail dsd
        INNER JOIN do_sortation_vehicle dsv ON dsv.do_sortation_id = dsd.do_sortation_id
        AND dsv.is_deleted = false  AND dsv.is_active = true
    WHERE dsd.do_sortation_id = '${payload.doSortationId}'
    AND dsd.arrival_date_time is null
    AND dsd.is_deleted = false
    limit 1`;
    const resultDoSortationDetail = await RawQueryService.query(sql);

    if (resultDoSortationDetail.length === 0) {
      throw new BadRequestException(`Semua Sortation Telah Tiba`);
    }

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      },
      // lock: { mode: 'pessimistic_write' },
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
      doSortationAttachment.doSortationDetailId = resultDoSortationDetail[0].do_sortation_detail_id;
      doSortationAttachment.attachmentTmsId = attachmentId;
      doSortationAttachment.attachmentType = payload.imageType;
      doSortationAttachment.doSortationVehicleId = resultDoSortationDetail[0].do_sortation_vehicle_id;
      await transaction.save(DoSortationAttachment, doSortationAttachment);
    });

    const data = [];
    data.push({
      url,
      attachmentId,
    });
    result.statusCode = HttpStatus.OK;
    result.message = 'Sortation - Berhasil Upload Gambar Handover';
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
        'doSortationStatusIdLast',
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
      throw new BadRequestException(`Semua Sortation Telah Tiba`);
    }

    if (resultDoSortation) {

      if (resultDoSortation.doSortationStatusIdLast != DO_SORTATION_STATUS.BACKUP_PROCESS) {
        throw new UnprocessableEntityException(`Status Terakhir Sortation harus BACKUP PROSES`);
      }

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
            resultDoSortationVehicle.doSortationVehicleId,
            DO_SORTATION_STATUS.DRIVER_CHANGED,
            resultDoSortationDetail.branchIdFrom,
            resultDoSortationDetail.branchIdTo,
            payload.note,
            authMeta.userId,
        );
      });

      const data = [];
      data.push({
        doSortationId: resultDoSortation.doSortationId,
        handoverDate: timeNow,
      });
      result.statusCode = HttpStatus.OK;
      result.message = 'Sortation - Berhasil Handover';
      result.data = data;
      return result;
    } else {
      throw new BadRequestException(`DO SORTATION ID : ` + payload.doSortationId + ` Tidak di temukan`);
    }

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
      // lock: { mode: 'pessimistic_write' },
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
                        AND dsv.is_deleted = false  AND dsv.is_active = true
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
    result.message = 'Sortation - Berhasil Upload Image Continue';
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
    reasonNote: string,
    userId: number,
  ) {

    console.log('MobileSortationService - createDoSortationHistory - CREATE DO SORTATION HISTORY');
    const dataDoSortationHistory = transaction.create(DoSortationHistory, {
      doSortationId,
      doSortationDetailId,
      doSortationTime,
      doSortationVehicleId,
      doSortationStatusId,
      branchIdFrom,
      branchIdTo,
      reasonNote,
      userIdCreated: userId,
      userIdUpdated: userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
    });

    await DoSortationHistory.insert(dataDoSortationHistory);
    console.log('MobileSortationService - createDoSortationHistory - END CREATE DO SORTATION HISTORY');
  }
}
