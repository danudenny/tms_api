import {Injectable} from '@nestjs/common';
import moment = require('moment');
import {BadRequestException} from '@nestjs/common';
import {RawQueryService} from '../../../../shared/services/raw-query.service';
import {HttpStatus} from '@nestjs/common';
import {AuthService} from '../../../../shared/services/auth.service';
import {OrionRepositoryService} from '../../../../shared/services/orion-repository.service';
import {DoSmd} from '../../../../shared/orm-entity/do_smd';
import {DoSmdVehicle} from '../../../../shared/orm-entity/do_smd_vehicle';
import {DoSmdDetail} from '../../../../shared/orm-entity/do_smd_detail';
import {DoSmdHistory} from '../../../../shared/orm-entity/do_smd_history';
import {EntityManager, getManager} from 'typeorm';
import {
    ScanOutSmdDepartureResponseVm,
    MobileUploadImageResponseVm,
    ScanOutSmdProblemResponseVm,
    ScanOutSmdHandOverResponseVm,
    ScanOutSmdEndManualResponseVm,
    UnfinishedSmdResponseVm,
} from '../../models/mobile-smd.response.vm';
import {MobileUploadImagePayloadVm, HandoverImagePayloadVm} from '../../models/mobile-smd.payload.vm';
import {PinoLoggerService} from '../../../../shared/services/pino-logger.service';
import {AttachmentTms} from '../../../../shared/orm-entity/attachment-tms';
import {AttachmentService} from '../../../../shared/services/attachment.service';
import {DoSmdDetailAttachment} from '../../../../shared/orm-entity/do_smd_detail_attachment';
import {DoSmdVehicleAttachment} from '../../../../shared/orm-entity/do_smd_vehicle_attachment';
import {BagScanOutBranchSmdQueueService} from '../../../queue/services/bag-scan-out-branch-smd-queue.service';
import {DO_SORTATION_STATUS} from '../../../../shared/constants/do-sortation-status.constant';
import {HistoryModuleFinish} from '../../../../shared/orm-entity/history-module-finish';
import {NearlyBranchService} from '../../../../shared/services/nearly-branch.service';

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
            if (resultDoSmd.departureDateTime) {
                await DoSmd.update(
                    {doSmdId: payload.do_smd_id},
                    {
                        doSmdStatusIdLast: 3000,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );
            } else {
                await DoSmd.update(
                    {doSmdId: payload.do_smd_id},
                    {
                        doSmdStatusIdLast: 3000,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                        departureDateTime: moment().toDate(),
                    },
                );
            }

            await DoSmdDetail.update(
                {doSmdId: payload.do_smd_id, arrivalTime: null},
                {
                    doSmdStatusIdLast: 3000,
                    departureTime: moment().toDate(),
                    latitudeDeparture: payload.latitude,
                    longitudeDeparture: payload.longitude,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            if (resultDoSmd.doSmdStatusIdLast != 3000) {
                const paramDoSmdHistoryId = await this.createDoSmdHistory(
                    payload.do_smd_id,
                    null,
                    resultDoSmd.doSmdVehicleIdLast,
                    null,
                    null,
                    resultDoSmd.departureScheduleDateTime,
                    resultDoSmd.branchId,
                    3000,
                    null,
                    null,
                    null,
                    authMeta.userId,
                );

                // UPDATE STATUS AWB AND BAG
                // BACKGROUND PROCESS
                BagScanOutBranchSmdQueueService.perform(
                    payload.do_smd_id,
                    // permissonPayload.branchId
                    resultDoSmd.branchId,
                    authMeta.userId,
                );
            }

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
                // arrivalTime: null,
                isDeleted: false,
            },
        });

        if (resultDoSmdDetail) {
            await NearlyBranchService.validateNearlyBranch(payload.latitude, payload.longitude, resultDoSmdDetail.branchIdTo);
            if (resultDoSmdDetail.departureTime) {
                if (resultDoSmdDetail.arrivalTime) {
                    // handle cek arrival smd berkali-kali
                    // terjadi karena device driver di clear cache atau pindah divice lain
                    // return berhasil
                    const data = [];
                    result.statusCode = HttpStatus.OK;
                    result.message = 'SMD Already Arrived';
                    data.push({
                        do_smd_id: resultDoSmdDetail.doSmdId,
                        do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
                        arrival_date_time: payload.arrival_date_time,
                    });
                    result.data = data;
                    return result;
                } else {
                    // Cek Apakah udah OTW
                    // Ubah Status 4000 Arrived
                    const resultDoSmd = await DoSmd.findOne({
                        where: {
                            doSmdId: resultDoSmdDetail.doSmdId,
                            isDeleted: false,
                        },
                    });
                    if (resultDoSmd.trip > 1) {
                        if (resultDoSmd.transitDateTime) {
                            await DoSmd.update(
                                {doSmdId: resultDoSmdDetail.doSmdId},
                                {
                                    doSmdStatusIdLast: 4000,
                                    userIdUpdated: authMeta.userId,
                                    updatedTime: timeNow,
                                    arrivalDateTime: timeNow,
                                },
                            );
                        } else {
                            await DoSmd.update(
                                {doSmdId: resultDoSmdDetail.doSmdId},
                                {
                                    doSmdStatusIdLast: 4000,
                                    userIdUpdated: authMeta.userId,
                                    updatedTime: timeNow,
                                    transitDateTime: timeNow,
                                },
                            );
                        }
                    } else {
                        await DoSmd.update(
                            {doSmdId: resultDoSmdDetail.doSmdId},
                            {
                                doSmdStatusIdLast: 4000,
                                userIdUpdated: authMeta.userId,
                                updatedTime: timeNow,
                                arrivalDateTime: timeNow,
                            },
                        );
                    }

                    await DoSmdDetail.update(
                        {doSmdDetailId: payload.do_smd_detail_id, arrivalTime: null},
                        {
                            doSmdStatusIdLast: 4000,
                            arrivalTime: moment().toDate(),
                            latitudeArrival: payload.latitude,
                            longitudeArrival: payload.longitude,
                            userIdUpdated: authMeta.userId,
                            updatedTime: timeNow,
                        },
                    );

                    await this.createDoSmdHistoryArrival(
                        resultDoSmdDetail.doSmdId,
                        null,
                        null,
                        null,
                        null,
                        resultDoSmdDetail.departureScheduleDateTime,
                        resultDoSmdDetail.branchIdTo,
                        4000,
                        null,
                        null,
                        null,
                        authMeta.userId,
                        timeNow,
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
                }
            } else {
                throw new BadRequestException(`DO SMD Detail Id : ` + payload.do_smd_detail_id.toString() + ' Has Not Departure Date');
            }

        } else {
            throw new BadRequestException(`DO SMD Detail Id : ` + payload.do_smd_detail_id.toString() + ' Not Found');
        }

    }

    static async scanInCancelMobile(payload: any): Promise<any> {
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
            const resultDoSmd = await DoSmd.findOne({
                where: {
                    doSmdId: resultDoSmdDetail.doSmdId,
                    isDeleted: false,
                },
            });
            if (resultDoSmd.arrivalDateTime) {
                await DoSmd.update(
                    {doSmdId: resultDoSmdDetail.doSmdId},
                    {
                        doSmdStatusIdLast: 3000,
                        arrivalDateTime: null,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );
            } else {
                await DoSmd.update(
                    {doSmdId: resultDoSmdDetail.doSmdId},
                    {
                        doSmdStatusIdLast: 3000,
                        transitDateTime: null,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );
            }

            await DoSmdDetail.update(
                {doSmdDetailId: payload.do_smd_detail_id},
                {
                    doSmdStatusIdLast: 3000,
                    arrivalTime: null,
                    latitudeArrival: null,
                    longitudeArrival: null,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            await this.createDoSmdHistory(
                resultDoSmdDetail.doSmdId,
                null,
                null,
                null,
                null,
                resultDoSmdDetail.departureScheduleDateTime,
                resultDoSmdDetail.branchIdTo,
                2500,
                null,
                null,
                null,
                authMeta.userId,
            );

            const paramDoSmdHistoryId = await this.createDoSmdHistory(
                resultDoSmdDetail.doSmdId,
                null,
                null,
                null,
                null,
                resultDoSmdDetail.departureScheduleDateTime,
                resultDoSmdDetail.branchIdTo,
                3000,
                null,
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
            result.message = 'SMD Success Cancel Arrival';
            result.data = data;
            return result;
        } else {
            throw new BadRequestException(`Can't Find  DO SMD Detail ID : ` + payload.do_smd_detail_id.toString());
        }

    }

    static async scanInEndMobile(payload: any): Promise<any> {
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
            const resultDoSmdDetailArrival = await DoSmdDetail.findOne({
                where: {
                    doSmdId: resultDoSmdDetail.doSmdId,
                    arrivalTime: null,
                    isDeleted: false,
                },
            });
            if (resultDoSmdDetailArrival) {
                await DoSmd.update(
                    {doSmdId: resultDoSmdDetail.doSmdId},
                    {
                        doSmdStatusIdLast: 5000,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );

                await DoSmdDetail.update(
                    {doSmdDetailId: payload.do_smd_detail_id},
                    {
                        doSmdStatusIdLast: 5000,
                        // departureTime: moment().toDate(),
                        // latitudeDeparture: payload.latitude,
                        // longitudeDeparture: payload.longitude,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );

                const paramDoSmdHistoryId = await this.createDoSmdHistory(
                    resultDoSmdDetail.doSmdId,
                    payload.do_smd_detail_id,
                    null,
                    null,
                    null,
                    resultDoSmdDetail.departureScheduleDateTime,
                    resultDoSmdDetail.branchIdTo,
                    4050,
                    null,
                    null,
                    null,
                    authMeta.userId,
                );

                await this.createDoSmdHistory(
                    resultDoSmdDetail.doSmdId,
                    payload.do_smd_detail_id,
                    null,
                    null,
                    null,
                    resultDoSmdDetail.departureScheduleDateTime,
                    resultDoSmdDetail.branchIdTo,
                    5000,
                    null,
                    null,
                    null,
                    authMeta.userId,
                );
            } else {
                await DoSmd.update(
                    {doSmdId: resultDoSmdDetail.doSmdId},
                    {
                        doSmdStatusIdLast: 6000,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );

                await DoSmdDetail.update(
                    {doSmdId: resultDoSmdDetail.doSmdId},
                    {
                        doSmdStatusIdLast: 6000,
                        // departureTime: moment().toDate(),
                        // latitudeArrival: payload.latitude,
                        // longitudeArrival: payload.longitude,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );

                const paramDoSmdHistoryId = await this.createDoSmdHistory(
                    resultDoSmdDetail.doSmdId,
                    payload.do_smd_detail_id,
                    null,
                    null,
                    null,
                    resultDoSmdDetail.departureScheduleDateTime,
                    resultDoSmdDetail.branchIdTo,
                    4050,
                    null,
                    null,
                    null,
                    authMeta.userId,
                );

                await this.createDoSmdHistory(
                    resultDoSmdDetail.doSmdId,
                    payload.do_smd_detail_id,
                    null,
                    null,
                    null,
                    resultDoSmdDetail.departureScheduleDateTime,
                    resultDoSmdDetail.branchIdTo,
                    5000,
                    null,
                    null,
                    null,
                    authMeta.userId,
                );
                await this.createDoSmdHistory(
                    resultDoSmdDetail.doSmdId,
                    null,
                    null,
                    null,
                    null,
                    resultDoSmdDetail.departureScheduleDateTime,
                    resultDoSmdDetail.branchIdTo,
                    6000,
                    null,
                    null,
                    null,
                    authMeta.userId,
                );
            }

            const data = [];
            data.push({
                do_smd_id: resultDoSmdDetail.doSmdId,
                do_smd_detail_id: resultDoSmdDetail.doSmdDetailId,
                arrival_date_time: moment().toDate(),
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
            lock: {mode: 'pessimistic_write'},
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

    static async problemMobile(payload: any, file): Promise<any> {
        const authMeta = AuthService.getAuthData();
        const permissonPayload = AuthService.getPermissionTokenPayload();

        const result = new ScanOutSmdProblemResponseVm();
        const timeNow = moment().toDate();

        let url = null;
        let attachmentId = null;

        const resultDoSmd = await DoSmd.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                isDeleted: false,
            },
        });

        const resultDoSmdDetailArrival = await DoSmdDetail.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                arrivalTime: null,
                isDeleted: false,
            },
        });

        if (resultDoSmdDetailArrival) {
            // Upload Foto
            PinoLoggerService.log('#### DEBUG USER UPLOAD IMAGE SMD: ', authMeta);

            let attachment = await AttachmentTms.findOne({
                where: {
                    fileName: file.originalname,
                },
                lock: {mode: 'pessimistic_write'},
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
                doSmdDelivereyAttachment.doSmdDetailId = resultDoSmdDetailArrival.doSmdDetailId;
                doSmdDelivereyAttachment.attachmentTmsId = attachmentId;
                doSmdDelivereyAttachment.attachmentType = payload.image_type;
                doSmdDelivereyAttachment.doSmdVehicleId = resultDoSmd.doSmdVehicleIdLast;
                await DoSmdDetailAttachment.save(doSmdDelivereyAttachment);
            }

            //
        } else {
            throw new BadRequestException(`DO SMD ID : ` + payload.do_smd_id.toString() + ` already arrival`);
        }

        if (resultDoSmd) {
            // Ubah Status 4000 Arrived
            await DoSmd.update(
                {doSmdId: resultDoSmd.doSmdId},
                {
                    doSmdStatusIdLast: 8000,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            await DoSmdDetail.update(
                {doSmdId: payload.do_smd_id, arrivalTime: null},
                {
                    doSmdStatusIdLast: 8000,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            await DoSmdVehicle.update(
                {doSmdVehicleId: resultDoSmd.doSmdVehicleIdLast},
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
                // permissonPayload.branchId,
                null,
                8000,
                null,
                payload.reasonId,
                payload.reason_note,
                authMeta.userId,
            );

            const paramDoSmdVehicleAttachmentId = await this.createDoSmdVehicleAttachment(
                resultDoSmd.doSmdId,
                resultDoSmd.doSmdVehicleIdLast,
                // attachmentId,
                url,
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
                {doSmdId: resultDoSmd.doSmdId},
                {
                    doSmdStatusIdLast: 3000,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            await DoSmdDetail.update(
                {doSmdId: payload.do_smd_id, arrivalTime: null},
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
                // permissonPayload.branchId,
                null,
                3000,
                null,
                payload.reasonId,
                null,
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

    static async handOverMobileOld(payload: any, file): Promise<any> {

        // const result = new MobileUploadImageResponseVm();
        const authMeta = AuthService.getAuthData();
        const permissonPayload = AuthService.getPermissionTokenPayload();
        PinoLoggerService.log('#### DEBUG USER UPLOAD IMAGE SMD: ', authMeta);

        const resultDoSmd = await DoSmd.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                isDeleted: false,
            },
        });

        const resultDoSmdDetail = await DoSmdDetail.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                isDeleted: false,
                arrivalTime: null,
            },
        });

        if (!resultDoSmdDetail) {
            throw new BadRequestException(`All SMD Already Arrival`);
        }

        let url = null;
        let attachmentId = null;

        let attachment = await AttachmentTms.findOne({
            where: {
                fileName: file.originalname,
            },
            lock: {mode: 'pessimistic_write'},
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
            doSmdDelivereyAttachment.doSmdDetailId = resultDoSmdDetail.doSmdDetailId;
            doSmdDelivereyAttachment.attachmentTmsId = attachmentId;
            doSmdDelivereyAttachment.attachmentType = payload.image_type;
            doSmdDelivereyAttachment.doSmdVehicleId = resultDoSmd.doSmdVehicleIdLast;
            await DoSmdDetailAttachment.save(doSmdDelivereyAttachment);
        }

        // result.url = url;
        // result.attachmentId = attachmentId;
        // return result;
        // const authMeta = AuthService.getAuthData();
        // const permissonPayload = AuthService.getPermissionTokenPayload();

        const result = new ScanOutSmdHandOverResponseVm();
        const timeNow = moment().toDate();

        // const resultDoSmd = await DoSmd.findOne({
        //   where: {
        //     doSmdId: payload.do_smd_id,
        //     isDeleted: false,
        //   },
        // });

        if (resultDoSmd) {

            await DoSmdVehicle.update(
                {doSmdVehicleId: resultDoSmd.doSmdVehicleIdLast},
                {
                    handOverDate: timeNow,
                    notes: payload.notes,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            const resultDoSmdVehicle = await DoSmdVehicle.findOne({
                where: {
                    doSmdId: payload.do_smd_id,
                    isActive: true,
                    isDeleted: false,
                },
            });

            const paramDoSmdVehicleAttachmentId = await this.createDoSmdVehicleAttachment(
                resultDoSmd.doSmdId,
                resultDoSmd.doSmdVehicleIdLast,
                // payload.photo_url,
                url,
                authMeta.userId,
            );

            await DoSmd.update(
                {doSmdId: resultDoSmd.doSmdId},
                {
                    doSmdStatusIdLast: 1050,
                    doSmdVehicleIdLast: resultDoSmdVehicle.doSmdVehicleId,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            await DoSmdDetail.update(
                {doSmdId: payload.do_smd_id, arrivalTime: null},
                {
                    doSmdStatusIdLast: 1050,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            const paramDoSmdHistoryId = await this.createDoSmdHistory(
                resultDoSmd.doSmdId,
                resultDoSmdDetail.doSmdDetailId,
                resultDoSmdVehicle.doSmdVehicleId,
                payload.latitude,
                payload.longitude,
                resultDoSmd.doSmdTime,
                // permissonPayload.branchId,
                null,
                1050,
                null,
                payload.reasonId,
                payload.notes,
                authMeta.userId,
            );

            const data = [];
            data.push({
                do_smd_id: resultDoSmd.doSmdId,
                handover_date: timeNow,
            });
            result.statusCode = HttpStatus.OK;
            result.message = 'SMD Success Handover';
            result.data = data;
            return result;
        } else {
            throw new BadRequestException(`Can't Find  DO SMD ID : ` + payload.do_smd_id.toString());
        }

    }

    static async handOverMobile(payload: any): Promise<any> {

        // const result = new MobileUploadImageResponseVm();
        const authMeta = AuthService.getAuthData();
        const permissonPayload = AuthService.getPermissionTokenPayload();

        const resultDoSmd = await DoSmd.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                isDeleted: false,
            },
        });

        const resultDoSmdDetail = await DoSmdDetail.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                isDeleted: false,
                arrivalTime: null,
            },
        });

        if (!resultDoSmdDetail) {
            throw new BadRequestException(`All SMD Already Arrival`);
        }

        const result = new ScanOutSmdHandOverResponseVm();
        const timeNow = moment().toDate();

        if (resultDoSmd) {

            const rawQuery = `
        SELECT
          dsda.attachment_tms_id,
          atm.url,
          dsda.attachment_type
        FROM do_smd_detail_attachment dsda
        INNER JOIN attachment_tms atm ON dsda.attachment_tms_id = atm.attachment_tms_id
        WHERE
          dsda.do_smd_vehicle_id = ${resultDoSmd.doSmdVehicleIdLast} AND
          dsda.is_deleted = FALSE;
      `;
            const resultDataDoSmdDetailAttachment = await RawQueryService.query(rawQuery);
            if (resultDataDoSmdDetailAttachment.length > 0) {
                for (const i of resultDataDoSmdDetailAttachment) {
                    await this.createDoSmdVehicleAttachment(
                        resultDoSmd.doSmdId,
                        resultDoSmd.doSmdVehicleIdLast,
                        // payload.photo_url,
                        i.url,
                        authMeta.userId,
                    );
                }
            } else {
                throw new BadRequestException(`All SMD Already Arrival`);
            }

            await DoSmdVehicle.update(
                {doSmdVehicleId: resultDoSmd.doSmdVehicleIdLast},
                {
                    handOverDate: timeNow,
                    notes: payload.notes,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            const resultDoSmdVehicle = await DoSmdVehicle.findOne({
                where: {
                    doSmdId: payload.do_smd_id,
                    isActive: true,
                    isDeleted: false,
                },
            });

            await DoSmd.update(
                {doSmdId: resultDoSmd.doSmdId},
                {
                    doSmdStatusIdLast: 1050,
                    doSmdVehicleIdLast: resultDoSmdVehicle.doSmdVehicleId,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            await DoSmdDetail.update(
                {doSmdId: payload.do_smd_id, arrivalTime: null},
                {
                    doSmdStatusIdLast: 1050,
                    userIdUpdated: authMeta.userId,
                    updatedTime: timeNow,
                },
            );

            const paramDoSmdHistoryId = await this.createDoSmdHistory(
                resultDoSmd.doSmdId,
                resultDoSmdDetail.doSmdDetailId,
                resultDoSmdVehicle.doSmdVehicleId,
                payload.latitude,
                payload.longitude,
                resultDoSmd.doSmdTime,
                // permissonPayload.branchId,
                null,
                1050,
                null,
                payload.reasonId,
                payload.notes,
                authMeta.userId,
            );

            const data = [];
            data.push({
                do_smd_id: resultDoSmd.doSmdId,
                handover_date: timeNow,
            });
            result.statusCode = HttpStatus.OK;
            result.message = 'SMD Success Handover';
            result.data = data;
            return result;
        } else {
            throw new BadRequestException(`Can't Find  DO SMD ID : ` + payload.do_smd_id.toString());
        }

    }

    public static async handOverMobileImage(
        payload: HandoverImagePayloadVm,
        file,
    ): Promise<MobileUploadImageResponseVm> {
        const result = new MobileUploadImageResponseVm();
        const authMeta = AuthService.getAuthData();
        PinoLoggerService.log('#### DEBUG USER UPLOAD IMAGE SMD: ', authMeta);

        const resultDoSmd = await DoSmd.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                isDeleted: false,
            },
        });

        const resultDoSmdDetail = await DoSmdDetail.findOne({
            where: {
                doSmdId: payload.do_smd_id,
                isDeleted: false,
                arrivalTime: null,
            },
        });

        if (!resultDoSmdDetail) {
            throw new BadRequestException(`All SMD Already Arrival`);
        }

        let url = null;
        let attachmentId = null;

        let attachment = await AttachmentTms.findOne({
            where: {
                fileName: file.originalname,
            },
            lock: {mode: 'pessimistic_write'},
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
            doSmdDelivereyAttachment.doSmdDetailId = resultDoSmdDetail.doSmdDetailId;
            doSmdDelivereyAttachment.attachmentTmsId = attachmentId;
            doSmdDelivereyAttachment.attachmentType = payload.image_type;
            doSmdDelivereyAttachment.doSmdVehicleId = resultDoSmd.doSmdVehicleIdLast;
            await DoSmdDetailAttachment.save(doSmdDelivereyAttachment);
        }

        result.url = url;
        result.attachmentId = attachmentId;
        return result;
    }

    static async scanInEndManualMobile(payload: any): Promise<any> {
        const result = new ScanOutSmdEndManualResponseVm();
        const timeNow = moment().toDate();
        const authMeta = AuthService.getAuthData();
        const permissonPayload = AuthService.getPermissionTokenPayload();
        /*const resultDoSmd = await DoSmd.findOne({
          where: {
            doSmdCode: payload.do_smd_code,
            doSmdStatusIdLast: Not(6000),
            isDeleted: false,
          },
        });*/
        const repo = new OrionRepositoryService(DoSmd, 'ds');
        const q = repo.findOneRaw();
        q.selectRaw(
            ['ds.do_smd_id', 'doSmdId'],
            ['ds.do_smd_code', 'doSmdCode'],
            ['ds.branch_id', 'branchId'],
            ['ds.vehicle_id_last', 'vehicleIdLast'],
            ['dsv.employee_id_driver', 'employeeIdDriver'],
        )
            .innerJoin(e => e.doSmdVehicle, 'dsv', j =>
                j
                    .andWhere(e => e.isDeleted, w => w.isFalse())
                    .andWhere(e => e.isActive, w => w.isTrue()),
            )
            .andWhere(e => e.doSmdCode, w => w.equals(payload.do_smd_code))
            .andWhere(e => e.doSmdStatusIdLast, w => w.notEquals(DO_SORTATION_STATUS.FINISHED))
            .andWhere(e => e.isDeleted, w => w.isFalse())
            .take(1);
        const resultDoSmd = await q.exec();

        if (resultDoSmd) {

            await getManager().transaction(async transaction => {

                /* Set Active False yang lama */
                await transaction.update(
                    DoSmd,
                    {doSmdId: resultDoSmd.doSmdId},
                    {
                        doSmdStatusIdLast: 6000,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );

                await transaction.update(
                    DoSmdDetail,
                    {doSmdId: resultDoSmd.doSmdId},
                    {
                        doSmdStatusIdLast: 6000,
                        arrivalTime: moment().toDate(),
                        // latitudeArrival: payload.latitude,
                        // longitudeArrival: payload.longitude,
                        userIdUpdated: authMeta.userId,
                        updatedTime: timeNow,
                    },
                );

                await this.createDoSmdHistoryTransaction(
                    resultDoSmd.doSmdId,
                    null,
                    null,
                    null,
                    null,
                    moment().toDate(),
                    resultDoSmd.branchId,
                    6000,
                    null,
                    null,
                    null,
                    authMeta.userId,
                    transaction,
                );

                // saving history module finish
                const objHistoryModuleFinish = HistoryModuleFinish.create(
                    {
                        doSmdCode: resultDoSmd.doSmdCode,
                        driverId: resultDoSmd.employeeIdDriver,
                        vehicleId: resultDoSmd.vehicleIdLast,
                        createdTime: moment().toDate(),
                        updatedTime: moment().toDate(),
                        userIdCreated: authMeta.userId,
                        userIdUpdated: authMeta.userId,
                        branchId: permissonPayload.branchId,
                    },
                );
                await transaction.insert(HistoryModuleFinish, objHistoryModuleFinish);

            });

            const data = [];
            data.push({
                do_smd_id: resultDoSmd.doSmdId,
                do_smd_code: resultDoSmd.doSmdCode,
                arrival_date_time: moment().toDate(),
            });
            result.statusCode = HttpStatus.OK;
            result.message = 'SMD Success End Manual';
            result.data = data;
            return result;
        } else {
            throw new BadRequestException(`Can't Find  DO SMD CODE : ` + payload.do_smd_code);
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
        paramReasonNotes: string,
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
            reasonNotes: paramReasonNotes,
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

    private static async createDoSmdHistoryArrival(
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
        paramReasonNotes: string,
        userId: number,
        timeNow: Date,
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
            reasonNotes: paramReasonNotes,
            userIdCreated: userId,
            createdTime: timeNow,
            userIdUpdated: userId,
            updatedTime: timeNow,
        });
        const doSmdHistory = await DoSmdHistory.insert(dataDoSmdHistory);
        return doSmdHistory.identifiers.length
            ? doSmdHistory.identifiers[0].doSmdHistoryId
            : null;
    }

    private static async createDoSmdHistoryTransaction(
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
        paramReasonNotes: string,
        userId: number,
        transactional: EntityManager,
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
            reasonNotes: paramReasonNotes,
            userIdCreated: userId,
            createdTime: moment().toDate(),
            userIdUpdated: userId,
            updatedTime: moment().toDate(),
        });

        await transactional.insert(DoSmdHistory, dataDoSmdHistory);

    }

    private static async createDoSmdVehicleAttachment(
        paramDoSmdId: number,
        paramDoSmdVehicleId: number,
        // paramAttachmentTmsId: number,
        paramPhotoUrl: string,
        userId: number,
    ) {
        const dataDoSmdVehicleAttachment = DoSmdVehicleAttachment.create({
            doSmdVehicleId: paramDoSmdVehicleId,
            doSmdId: paramDoSmdId,
            // attachmentTmsId: paramAttachmentTmsId,
            photoUrl: paramPhotoUrl,
            userIdCreated: userId,
            createdTime: moment().toDate(),
            userIdUpdated: userId,
            updatedTime: moment().toDate(),
        });
        const doSmdVehicleAttachment = await DoSmdVehicleAttachment.insert(dataDoSmdVehicleAttachment);
        return doSmdVehicleAttachment.identifiers.length
            ? doSmdVehicleAttachment.identifiers[0].doSmdVehicleAttachmentId
            : null;
    }

    static async unfinishedSmd(payload: any): Promise<any> {
        const employeeRawQuery = `
      SELECT *
      FROM employee
      WHERE
        nik IN ('${payload.nik}');
    `;
        const resultDataEmployee = await RawQueryService.query(employeeRawQuery);

        if (!resultDataEmployee.length) {
            throw new BadRequestException(`Can't Find Employee NIK : ` + payload.nik);
        }

        let resultDataDoSmd = [];

        await Promise.all(
            resultDataEmployee.map(async (employee: any) => {
                const doSmdVehicleRawQuery = `
          SELECT
            dsv.employee_id_driver,
            ds.do_smd_status_id_last,
            ds.do_smd_id,
            ds.branch_id
          FROM
            do_smd_vehicle dsv
            INNER JOIN do_smd ds ON dsv.do_smd_vehicle_id = ds.vehicle_id_last
            AND ds.is_deleted = FALSE
            AND ds.do_smd_status_id_last <> 6000
            AND ds.is_empty = FALSE
          WHERE
            dsv.employee_id_driver IN ('${employee.employee_id}')
            AND dsv.is_deleted = FALSE;
        `;
                const resultDataDoSmdVehicle = await RawQueryService.query(doSmdVehicleRawQuery);

                if (!resultDataDoSmdVehicle.length) {
                    return false;
                }

                await Promise.all(
                    resultDataDoSmdVehicle.map(async (doSmd: any) => {
                        const doSmdRawQuery = `
              SELECT * FROM do_smd WHERE do_smd_id IN ('${doSmd.do_smd_id}') AND is_deleted = false;
            `;
                        const doSmdResult = await RawQueryService.query(doSmdRawQuery);

                        resultDataDoSmd = resultDataDoSmd.concat(doSmdResult);
                    }),
                );
            }),
        );

        const result = new UnfinishedSmdResponseVm();

        result.statusCode = HttpStatus.OK;
        result.message = 'SMD Available';
        result.data = resultDataDoSmd;

        return result;
    }

}
