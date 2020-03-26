import axios from 'axios';
import moment = require('moment');
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { BadRequestException } from '@nestjs/common';

export class PartnerLocusService {
  static async createBatchTask() {
    // TODO: check data pickup request by city jakarta barat (for testing only)
    // get data pickup requset detail
    // looping data construct json data
    // sending request
    return await this.sendDataBatch();
  }

  static async createTask() {
    const pickupRequests = await this.getDataPickupRequest();
    if (pickupRequests) {
      for (const pickupRequest of pickupRequests) {
        const result = await this.sendDataTask(pickupRequest);
        PinoLoggerService.log(result);
      }
    }

    return { status: 200, message: 'ok' };
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

  private static async sendDataTask(pickupRequest: any) {
    const taskId = pickupRequest.awbNumber;
    const url = `https://locus-api.com/v1/client/sicepat-sds/mpmdtask/${taskId}`;
    let result = {};
    // TODO: set pickupSlot and dropSlot ??
    const pickupSlot = {
      start: moment('2020-03-26 10:00:00').toISOString(),
      end: moment('2020-03-26 12:00:00').toISOString(),
    };
    const dropSlot = {
      start: moment('2020-03-26 12:00:00').toISOString(),
      end: moment('2020-03-26 14:00:00').toISOString(),
    };

    const jsonData = {
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

    try {
      PinoLoggerService.log('sending data to locus !!');
      const response = await axios.put(url, jsonData, this.getOptionsLocus());
      if (response.status == 200) {
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
  private static async sendDataBatch() {
    // const clientId = 'sicepat-sds';
    // custom batchId??
    const batchId = moment().format('YYYY-MM-DD-HH-mm-ss');
    const url = `https://locus-api.com/v1/client/sicepat-sds/mpmdbatch/${batchId}`;
    const options = this.getOptionsLocus();

    let result = {};
    const tasks = [];
    // TODO: set pickupSlot and dropSlot ??
    const pickupSlot = {
      start: moment('2020-03-26 10:00:00').toISOString(),
      end: moment('2020-03-26 12:00:00').toISOString(),
    };
    const dropSlot = {
      start: moment('2020-03-26 12:00:00').toISOString(),
      end: moment('2020-03-26 14:00:00').toISOString(),
    };

    const pickupRequests = await this.getDataPickupRequest();
    if (pickupRequests) {
      for (const pickupRequest of pickupRequests) {
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

        // TODO: check data have lat long??
        let geoloc = {};
        if (pickupRequest.shipperLatitude && pickupRequest.shipperLongitude) {
          // add lot lang
          geoloc = {
            pickupLatLng: {
              lat: pickupRequest.shipperLatitude,
              lng: pickupRequest.shipperLongitude,
            },
          };
        }

        if (pickupRequest.recipientLatitude && pickupRequest.recipientLongitude) {
          geoloc = {
            dropLatLng: {
              lat: pickupRequest.recipientLatitude,
              lng: pickupRequest.recipientLongitude,
            },
            ...geoloc,
          };
        }

        tasks.push({ ...objItem, ...geoloc });
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
        const response = await axios.put(url, jsonData, options);
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

  private static async getDataPickupRequest(
    partnerId: number = 0,
  ): Promise<any> {
    const backDate = moment().add(-2, 'days').format('YYYY-MM-DD 00:00:00');

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
      LEFT JOIN awb_send_partner a ON prd.ref_awb_number=a.awb_number and a.is_deleted=false
      WHERE prd.created_time >= :backDate and (a.awb_number IS NULL OR a.is_send=false) and prd.is_deleted=false and prd.ref_awb_number is not null
      LIMIT 850
    `;

    return await RawQueryService.queryWithParams(query, {
      backDate,
    });
  }

  private static handlePhoneNumber(phoneNumber: string) {
    // TODO: handle phone number??
    // .replace(/[^0-9]/g,''); digit only
    // .replace(/^0/, '62'); replace zero to 62
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    return phoneNumber.replace(/^0/, '62');
  }
}
