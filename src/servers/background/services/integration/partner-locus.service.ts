import axios from 'axios';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { BadRequestException } from '@nestjs/common';
import { AwbSendPartnerQueueService } from '../../../queue/services/awb-send-partner-queue.service';

export class PartnerLocusService {
  static async createBatchTask() {
    // TODO: check data pickup request by city jakarta barat (for testing only)
    // get data pickup requset detail
    // looping data construct json data
    // sending request
    const partnerId = 99; // hardcode partner id locus
    return await this.sendDataBatch(partnerId);
  }

  static async createTask() {
    const result = [];
    const partnerId = 99; // hardcode partner id locus
    const pickupRequests = await this.getDataPickupRequest(partnerId, 5);
    if (pickupRequests.length) {
      for (const pickupRequest of pickupRequests) {
        const response = await this.sendDataTask(pickupRequest, partnerId);
        result.push(response);
      }
    }
    return { data: result };
  }

  private static async sendDataTask(pickupRequest: any, partnerId: number) {
    const taskId = pickupRequest.awbNumber;
    const url = `https://locus-api.com/v1/client/sicepat-sds/mpmdtask/${taskId}`;
    let result = {};
    // TODO: set pickupSlot and dropSlot ??
    const pickupSlot = {
      start: moment('2020-03-27 17:00:00').toISOString(),
      end: moment('2020-03-27 18:00:00').toISOString(),
    };
    const dropSlot = {
      start: moment('2020-03-27 19:00:00').toISOString(),
      end: moment('2020-03-27 20:00:00').toISOString(),
    };

    const objItem = {
      taskId,
      teamId: 'jakbar-sds',
      lineItems: [
        {
          id: pickupRequest.awbNumber,
          name: pickupRequest.parcelContent,
          quantity: 1,
        },
      ],
      autoAssign: true,
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

    // NOTE: check data have lat long??
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

    const jsonData = { ...objItem, ...geoloc };

    try {
      PinoLoggerService.log('sending data to locus !!');
      const response = await axios.put(url, jsonData, this.getOptionsLocus());
      if (response.status == 200) {
        // NOTE: background process insert data on awb_send_partner
        AwbSendPartnerQueueService.addData(
          pickupRequest.awbNumber,
          partnerId,
          jsonData,
        );
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

  private static async sendDataBatch(partnerId: number) {
    // const clientId = 'sicepat-sds';
    // custom batchId??
    const batchId = moment().format('YYYY-MM-DD-HH-mm-ss');
    const url = `https://locus-api.com/v1/client/sicepat-sds/mpmdbatch/${batchId}`;

    let result = {};
    const tasks = [];
    // NOTE: set pickupSlot and dropSlot ??
    const pickupSlot = {
      start: moment('2020-03-27 17:00:00').toISOString(),
      end: moment('2020-03-27 18:00:00').toISOString(),
    };
    const dropSlot = {
      start: moment('2020-03-27 19:00:00').toISOString(),
      end: moment('2020-03-27 20:00:00').toISOString(),
    };

    const pickupRequests = await this.getDataPickupRequest(partnerId);
    if (pickupRequests.length) {
      for (const pickupRequest of pickupRequests) {
        const item = await this.constructDataBatch(pickupRequest, pickupSlot, dropSlot);
        tasks.push(item);
      } // end of for

      const jsonData = {
        teamId: 'jakbar-sds',
        tasksDate: moment().format('YYYY-MM-DD'),
        inputTasks: tasks,
      };

      // result = jsonData;
      // PinoLoggerService.log('DATA : ', jsonData.inputTasks.length);
      // send data to locus
      try {
        PinoLoggerService.log('Sending data to locus !!');
        const response = await axios.put(url, jsonData, this.getOptionsLocus());
        if (response.status == 200) {
          // NOTE: background process insert data on awb_send_partner
          for (const task of jsonData.inputTasks) {
            AwbSendPartnerQueueService.addData(
              task.taskId,
              partnerId,
              {
                teamId: 'jakbar-sds',
                tasksDate: moment().format('YYYY-MM-DD'),
                batchId,
              },
            );
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

  private static async constructDataBatch(
    pickupRequest: any,
    pickupSlot: {},
    dropSlot: {},
  ) {

    const objItem = {
      taskId: pickupRequest.awbNumber,
      lineItems: [
        {
          id: pickupRequest.awbNumber,
          name: pickupRequest.parcelContent,
          quantity: 1,
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

    if (objItem.pickupContactPoint.number.length > 14) {
      console.log(pickupRequest.awbNumber + ' : ' + objItem.pickupContactPoint.number);
    }

    if (objItem.dropContactPoint.number.length > 14) {
      console.log(
        pickupRequest.awbNumber + ' : ' + objItem.dropContactPoint.number,
      );
    }

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
    const backDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');
    const query = `
      SELECT
        prd.ref_awb_number as "awbNumber",
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
        pr.pickup_request_email as "pickupRequestEmail",
        a.send_count as "sendCount",
        a.awb_send_partner_id as "awbSendPartnerId",
        a.is_send as "isSend"
      FROM pickup_request_detail prd
      INNER JOIN pickup_request pr ON prd.pickup_request_id=pr.pickup_request_id
        AND pr.is_deleted=false AND pr.partner_id = 9
      LEFT JOIN awb_send_partner a ON prd.ref_awb_number=a.awb_number
        AND a.partner_id = :partnerId AND a.is_deleted=false
      WHERE
        prd.shipper_city ILIKE '%Jakarta Barat' AND
        prd.recipient_city ILIKE '%Jakarta Barat' AND
        prd.created_time >= :backDate AND a.awb_number IS NULL and prd.is_deleted=false and prd.ref_awb_number is not null
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
}
