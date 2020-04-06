import axios from 'axios';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { BadRequestException } from '@nestjs/common';
import { AwbSendPartnerQueueService } from '../../../queue/services/awb-send-partner-queue.service';
import {
  LocusTimeSlotVm,
  LocusCreateTaskVm,
} from '../../models/partner/locus-task.vm';
import { PartnerSameDayService } from '../../../../shared/orm-entity/partner-same-day-service';
import { AwbHistory } from '../../../../shared/orm-entity/awb-history';
import { AwbStatus } from '../../../../shared/orm-entity/awb-status';

export class PartnerLocusService {
  static async createBatchTask(payload: LocusCreateTaskVm) {
    // NOTE: check data pickup request by city jakarta barat (for testing only)
    const partnerId = payload.partnerIdLocus;
    // TODO: how to set pickupSlot and dropSlot ??
    const { pickupSlot, dropSlot } = this.slotTime(payload);
    // default get data task 100
    const totalTask = payload.totalTask ? payload.totalTask : 100;
    return await this.sendDataBatch(partnerId, pickupSlot, dropSlot, totalTask);
  }

  static async createTask(payload: LocusCreateTaskVm) {
    const result = [];
    const partnerId = payload.partnerIdLocus;
    const { pickupSlot, dropSlot } = this.slotTime(payload);
    const totalTask = payload.totalTask ? payload.totalTask : 1;
    const pickupRequests = await this.getDataPickupRequest(
      partnerId,
      totalTask,
    );
    if (pickupRequests.length) {
      for (const pickupRequest of pickupRequests) {
        const response = await this.sendDataTask(
          pickupRequest,
          partnerId,
          pickupSlot,
          dropSlot,
        );
        result.push(response);
      }
    }
    return { data: result };
  }

  static async callbackTask(payload: any) {
    if (payload.task) {
      let data = {};

      // get data detail trackLink and urlImage
      if (payload.task.taskGraph.visits.length) {
        for (const item of payload.task.taskGraph.visits) {
          switch (item.id) {
            case 'pickup':
              const urlImagePickup = Object.keys(
                item.visitStatus.checklistValues,
              ).length
                ? item.visitStatus.checklistValues['signature-1']
                : null;
              const pickup = {
                urlImagePickup,
                trackLinkPickup: item.trackLink,
              };
              data = { ...data, ...pickup };
              break;
            case 'drop':
              const urlImageDrop = Object.keys(
                item.visitStatus.checklistValues,
              ).length
                ? item.visitStatus.checklistValues.photo
                : null;
              const drop = {
                urlImageDrop,
                trackLinkDrop: item.trackLink,
              };
              data = { ...data, ...drop };
              break;
            default:
              break;
          }
        }
      }

      const partnerSds = await PartnerSameDayService.findOne({
        select: ['partnerSameDayServiceId', 'awbNumber', 'awbItemId'],
        where: {
          awbNumber: payload.task.taskId,
          isDeleted: false,
        },
      });

      if (partnerSds) {
        // TODO: handle status COMPLETED or CANCELLED
        switch (payload.task.status.status) {
          case 'COMPLETED':
            const dataComplete = {
              completionTime: moment(payload.task.status.triggerTime).toDate(),
            };
            data = { ...data, ...dataComplete };
            this.completeTask(
              partnerSds.awbNumber,
              partnerSds.awbItemId,
              payload.task.statusUpdates,
            );
            break;
          case 'CANCELLED':
            const dataCancel = {
              cancelReason: payload.task.status.checklistValues['cancel-reason'],
              urlImageCancel: payload.task.status.checklistValues['photo'],
              completionTime: moment(payload.task.status.triggerTime).toDate(),
            };
            data = { ...data, ...dataCancel };
            this.cancelTask(
              partnerSds.awbNumber,
              partnerSds.awbItemId,
              dataCancel.cancelReason,
              payload.task.statusUpdates,
            );
            break;

          default:
            break;
        }
        // update data
        await PartnerSameDayService.update(
          { partnerSameDayServiceId: partnerSds.partnerSameDayServiceId },
          {
            assignedUser: payload.task.assignedUser.userId,
            statusPartner: payload.task.status.status,
            statusUpdates: payload.task.statusUpdates,
            ...data,
          },
        );

      } else {
        throw new BadRequestException();
      }
    } else {
      throw new BadRequestException();
    }

    return { status: 'ok', message: 'success' };
  }

  // private method
  private static async sendDataTask(
    pickupRequest: any,
    partnerId: number,
    pickupSlot: LocusTimeSlotVm,
    dropSlot: LocusTimeSlotVm,
  ) {
    const taskId = pickupRequest.awbNumber;
    const url = `https://locus-api.com/v1/client/sicepat-sds/mpmdtask/${taskId}`;
    let result = {};

    const objItem = await this.constructData(
      pickupRequest,
      pickupSlot,
      dropSlot,
    );
    // NOTE: additional params
    const additional = {
      teamId: 'jakbar-sds',
      autoAssign: true,
    };

    const jsonData = { ...objItem, ...additional };

    try {
      PinoLoggerService.log('sending data to locus !!');
      const response = await axios.put(url, jsonData, this.getOptionsLocus());
      if (response.status == 200) {
        // NOTE: background process insert data on awb_send_partner
        // AwbSendPartnerQueueService.addData(
        //   pickupRequest.awbNumber,
        //   partnerId,
        //   jsonData,
        // );
        this.partnerSameDay({
          awbNumber: pickupRequest.awbNumber,
          awbItemId: pickupRequest.awbItemId,
          partnerId,
          statusPartner: 'RECEIVED',
        });
        result = { status: response.status };
      } else {
        result = { status: response.status, ...response.data };
      }
    } catch (error) {
      result = {
        status: error.response.status,
        ...error.response.data,
      };
    }
    return result;
  }

  private static async sendDataBatch(
    partnerId: number,
    pickupSlot: LocusTimeSlotVm,
    dropSlot: LocusTimeSlotVm,
    totalTask: number,
  ) {
    // const clientId = 'sicepat-sds';
    // custom batchId??
    const batchId = moment().format('YYYY-MM-DD-HH-mm-ss');
    const url = `https://locus-api.com/v1/client/sicepat-sds/mpmdbatch/${batchId}`;

    let result = {};
    const tasks = [];

    const pickupRequests = await this.getDataPickupRequest(
      partnerId,
      totalTask,
    );
    if (pickupRequests.length) {
      for (const pickupRequest of pickupRequests) {
        const item = await this.constructData(
          pickupRequest,
          pickupSlot,
          dropSlot,
        );
        tasks.push(item);
      } // end of for

      const jsonData = {
        teamId: 'jakbar-sds',
        tasksDate: moment().format('YYYY-MM-DD'),
        inputTasks: tasks,
      };
      // NOTE: debug only
      // result = jsonData;
      // PinoLoggerService.log('DATA : ', jsonData.inputTasks.length);
      try {
        PinoLoggerService.log('Sending data to locus !!');
        const response = await axios.put(url, jsonData, this.getOptionsLocus());
        if (response.status == 200) {
          // NOTE: background process insert data on awb_send_partner
          for (const pickupRequest of pickupRequests) {
            // AwbSendPartnerQueueService.addData(
            //   task.taskId,
            //   partnerId,
            //   {
            //     teamId: 'jakbar-sds',
            //     tasksDate: moment().format('YYYY-MM-DD'),
            //     batchId,
            //   },
            // );
            this.partnerSameDay({
              awbNumber: pickupRequest.awbNumber,
              awbItemId: pickupRequest.awbItemId,
              partnerId,
              statusPartner: 'RECEIVED',
            });
          } // end of loop
        }
        result = { status: response.status, total: jsonData.inputTasks.length };
        PinoLoggerService.log('Response batch locus ', result);
      } catch (error) {
        result = {
          status: error.response.status,
          ...error.response.data,
        };
        PinoLoggerService.log('Response error locus', result);
      }
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }

    return result;
  }

  private static async constructData(
    pickupRequest: any,
    pickupSlot: LocusTimeSlotVm,
    dropSlot: LocusTimeSlotVm,
  ) {
    const objItem = {
      taskId: pickupRequest.awbNumber,
      lineItems: [
        {
          id: pickupRequest.awbNumber,
          name: pickupRequest.parcelContent,
          quantity: 1,
          price: {
            amount: pickupRequest.parcelValue,
            currency: 'IDR',
          },
        },
      ],
      pickupContactPoint: {
        name: pickupRequest.shipperName,
        number: this.handlePhoneNumber(pickupRequest.shipperPhone),
      },
      pickupLocationAddress: {
        formattedAddress: pickupRequest.shipperAddress,
        pincode: pickupRequest.shipperZip,
        city: pickupRequest.shipperCity,
        state: pickupRequest.shipperProvince,
        countryCode: 'ID',
      },
      pickupSlot,
      pickupTransactionDuration: 1000,
      dropContactPoint: {
        name: pickupRequest.recipientName,
        number: this.handlePhoneNumber(pickupRequest.recipientPhone),
      },
      dropLocationAddress: {
        formattedAddress: pickupRequest.recipientAddress,
        pincode: pickupRequest.recipientZip,
        city: pickupRequest.recipientCity,
        state: pickupRequest.recipientProvince,
        countryCode: 'ID',
      },
      dropSlot,
      dropTransactionDuration: 1000,
      volume: {
        value: 1,
        unit: 'ITEM_COUNT',
      },
    };

    // NOTE: check and validate lat long??
    let geoloc = {};
    if (
      pickupRequest.shipperLatitude &&
      pickupRequest.shipperLongitude &&
      this.isValidateLatLong(
        pickupRequest.shipperLatitude,
        pickupRequest.shipperLongitude,
      )
    ) {
      // add lot lang
      geoloc = {
        pickupLatLng: {
          lat: pickupRequest.shipperLatitude,
          lng: pickupRequest.shipperLongitude,
        },
      };
    }

    if (
      pickupRequest.recipientLatitude &&
      pickupRequest.recipientLongitude &&
      this.isValidateLatLong(
        pickupRequest.recipientLatitude,
        pickupRequest.recipientLongitude,
      )
    ) {
      geoloc = {
        dropLatLng: {
          lat: pickupRequest.recipientLatitude,
          lng: pickupRequest.recipientLongitude,
        },
        ...geoloc,
      };
    }

    return { ...objItem, ...geoloc };
  }

  private static async getDataPickupRequest(
    partnerId: number,
    limit: number = 500,
  ): Promise<any> {
    const backDate = moment()
      .add(-1, 'days')
      .format('YYYY-MM-DD 00:00:00');
    const query = `
      SELECT
        prd.ref_awb_number as "awbNumber",
        prd.awb_item_id as "awbItemId",
        prd.shipper_name as "shipperName",
        prd.shipper_phone as "shipperPhone",
        prd.shipper_address as "shipperAddress",
        prd.shipper_district as "shipperDistrict",
        prd.shipper_city as "shipperCity",
        prd.shipper_province as "shipperProvince",
        prd.shipper_zip as "shipperZip",
        prd.shipper_latitude as "shipperLatitude",
        prd.shipper_longitude as "shipperLongitude",
        prd.recipient_name as "recipientName",
        prd.recipient_phone as "recipientPhone",
        prd.recipient_address as "recipientAddress",
        prd.recipient_district as "recipientDistrict",
        prd.recipient_city as "recipientCity",
        prd.recipient_province as "recipientProvince",
        prd.recipient_zip as "recipientZip",
        prd.recipient_latitude as "recipientLatitude",
        prd.recipient_longitude as "recipientLongitude",
        prd.parcel_qty as "parcelQty",
        prd.parcel_value as "parcelValue",
        prd.parcel_content as "parcelContent",
        prd.parcel_length as "parcelLength",
        prd.parcel_width as "parcelWidth",
        prd.parcel_height as "parcelHeight",
        prd.total_weight as "totalWeight",
        pr.pickup_request_email as "pickupRequestEmail"
      FROM pickup_request_detail prd
      INNER JOIN pickup_request pr ON prd.pickup_request_id=pr.pickup_request_id
        AND pr.is_deleted=false AND pr.partner_id = 9
      LEFT JOIN partner_same_day_service psds ON prd.ref_awb_number=psds.awb_number
        AND psds.partner_id = :partnerId AND psds.is_deleted=false
      WHERE
        prd.shipper_city ILIKE '%Jakarta Barat' AND
        prd.recipient_city ILIKE '%Jakarta Barat' AND
        prd.created_time >= :backDate AND psds.awb_number IS NULL and prd.is_deleted=false and prd.ref_awb_number is not null
      LIMIT :limit
    `;

    return await RawQueryService.queryWithParams(query, {
      backDate,
      partnerId,
      limit,
    });
  }

  private static getOptionsLocus() {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: 'sicepat-sds',
        password: 'd099b20f-6a2a-49db-ac8a-2ea6359bfde2',
      },
    };
  }

  private static handlePhoneNumber(phoneNumber: string) {
    // .replace(/[^0-9]/g,''); digit only
    // .replace(/^0/, '62'); replace zero to 62
    phoneNumber = phoneNumber.split('/')[0];
    phoneNumber = phoneNumber.substr(0, 15); // get 15 char
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    return phoneNumber.replace(/^0/, '62');
  }

  private static isValidateLatLong(latitude: string, longitude: string) {
    const long = /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/;
    const lat = /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/;
    const latlong = lat.test(latitude) && long.test(longitude);
    return latlong;
  }

  private static slotTime(payload: LocusCreateTaskVm) {
    const today = moment().format('YYYY-MM-DD');
    const pickupSlot = {
      start: moment(`${today} ${payload.pickupStartHour}`).toISOString(),
      end: moment(`${today} ${payload.pickupEndHour}`).toISOString(),
    };
    const dropSlot = {
      start: moment(`${today} ${payload.dropStartHour}`).toISOString(),
      end: moment(`${today} ${payload.dropEndHour}`).toISOString(),
    };

    return { pickupSlot, dropSlot };
  }

  private static async partnerSameDay(payload: any) {
    const partnerSds = PartnerSameDayService.create();
    partnerSds.awbNumber = payload.awbNumber;
    partnerSds.awbItemId = payload.awbItemId;
    partnerSds.partnerId = payload.partnerId;
    partnerSds.statusPartner = payload.statusPartner;
    partnerSds.creationTime = moment().toDate();
    await PartnerSameDayService.insert(partnerSds);
  }

  private static async completeTask(
    awbNumber: string,
    awbItemId: number,
    params: any,
  ) {
    let countStarter = 1;
    // NOTE: jika started 1 (pick)
    // started 2 (ant)
    // COMPLETED: 1200(PICK), 1500(IN), 14000 (ANT), 30000 (DLV)
    const data = {
      awbNumber,
      awbItemId,
    };
    for (const item of params) {
      switch (item.status) {
        case 'STARTED':
          if (countStarter == 1) {
            const pick = {
              awbStatusId: 1200,
              timestamp: item.triggerTime,
            };
            const dataPick = { ...data, ...pick };
            await this.awbHistory(dataPick); // send to background process
          } else {
            const manifest = {
              awbStatusId: 1500,
              timestamp: item.triggerTime,
            };
            const dataManifest = { ...data, ...manifest };
            await this.awbHistory(dataManifest); // send to background process

            // find employee id driver where userId locus = where nik sicepat
            console.log('UserId: ', item.assignedUser.userId);
            const deliver = {
              awbStatusId: 14000,
              timestamp: item.triggerTime,
              employeeIdDriver: null,
              noteInternal: 'Paket dibawa [SIGESIT]; catatan: Same Day Service Locus',
              notePublic: 'Paket dibawa [SIGESIT]',
            };
            const dataDelivery = { ...data, ...deliver };
            await this.awbHistory(dataDelivery); // send to background process
          }
          countStarter += 1;
          break;

        case 'COMPLETED':
          const drop = {
            awbStatusId: 30000,
            timestamp: item.triggerTime,
            employeeIdDriver: null,
            receiverName: '',
            awbNote: '',
            noteInternal:
              'Paket diterima oleh [(YBS) Yang Bersangkutan]; catatan: Same Day Service Locus',
            notePublic:
              'Paket diterima oleh [(YBS) Yang Bersangkutan]',
          };
          const dataDrop = { ...data, ...drop };
          await this.awbHistory(dataDrop); // send to background process
          break;

        default:
          break;
      }
    }
    console.log('################ Awb Item Id : ', awbItemId);
    return true;
  }

  private static async cancelTask(
    awbNumber: string,
    awbItemId: number,
    cancelReason: string,
    params: any) {
    let countStarter = 1;
    // CANCELLED: 1200(PICK), 1500(IN), 14000 (ANT), Status Problem()
    // find by awb status code
    const data = {
      awbNumber,
      awbItemId,
    };
    for (const item of params) {
      switch (item.status) {
        case 'STARTED':
          if (countStarter == 1) {
            const pick = {
              awbStatusId: 1200,
              timestamp: item.triggerTime,
            };
            const dataPick = { ...data, ...pick };
            await this.awbHistory(dataPick); // send to background process
          } else {
            const manifest = {
              awbStatusId: 1500,
              timestamp: item.triggerTime,
            };
            const dataManifest = { ...data, ...manifest };
            await this.awbHistory(dataManifest); // send to background process

            // find employee id driver where userId locus = where nik sicepat
            console.log('UserId: ', item.assignedUser.userId);
            const deliver = {
              awbStatusId: 14000,
              timestamp: item.triggerTime,
              employeeIdDriver: null,
              noteInternal:
                'Paket dibawa [SIGESIT]; catatan: Same Day Service Locus',
              notePublic: 'Paket dibawa [SIGESIT]',
            };
            const dataDelivery = { ...data, ...deliver };
            await this.awbHistory(dataDelivery); // send to background process
          }
          countStarter += 1;
          break;

        case 'CANCELLED':
          const reasonCode = cancelReason.split('-')[0];
          const awbStatus = await AwbStatus.findOne({
            select: ['awbStatusId', 'awbStatusName', 'awbStatusTitle'],
            where: {
              awbStatusName: reasonCode,
              isDeleted: false,
            },
          });
          if (awbStatus) {
            const drop = {
              awbStatusId: awbStatus.awbStatusId,
              timestamp: item.triggerTime,
              employeeIdDriver: null,
              receiverName: '',
              awbNote: '',
              noteInternal: `Paket di kembalikan di Gerai [Same Day] - (${
                awbStatus.awbStatusName
              }) ${
                awbStatus.awbStatusTitle
              }; catatan: Same Day Service Locus`,
              notePublic: `Paket di kembalikan di Gerai [Same Day] - (${
                awbStatus.awbStatusName
              }) ${awbStatus.awbStatusTitle}`,
            };
            const dataDrop = { ...data, ...drop };
            await this.awbHistory(dataDrop); // send to background process
          } else {
            console.log('Status Bermasalah tidak ditemukan!');
          }
          break;

        default:
          break;
      }
    }
    console.log('################ Awb Item Id : ', awbItemId);
    return true;
  }

  private static async awbHistory(data: any) {
    const awbHistory = AwbHistory.create({
      awbItemId: data.awbItemId,
      refAwbNumber: data.awbNumber,
      userId: 1,
      branchId: 1, // gerai sicepat Sds ??
      employeeIdDriver: data.employeeIdDriver,
      historyDate: moment(data.timestamp).toDate(),
      awbStatusId: data.awbStatusId,
      userIdCreated: 1,
      userIdUpdated: 1,
      noteInternal: data.noteInternal,
      notePublic: data.notePublic,
      receiverName: data.receiverName,
      awbNote: data.awbNote,
    });
    return await AwbHistory.insert(awbHistory);
  }
}
