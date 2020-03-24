import axios from 'axios';
import moment = require('moment');

export class PartnerLocusService {
  static async createBatchTask() {
    // TODO: check data pickup request by city jakarta barat (for testing only)
    // get data pickup requset detail
    // looping data construct json data
    // sending request
    return await this.sendData();
  }

  private static async sendData() {
    const clientId = 'sicepat-sds';
    const batchId = moment().format('YYYY-MM-DD-HH-mm-ss');
    const url =
      `https://locus-api.com/v1/client/${clientId}/mpmdbatch/${batchId}`;
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: 'sicepat-sds',
        password: 'd099b20f-6a2a-49db-ac8a-2ea6359bfde2',
      },
    };
    const jsonData = {
      teamId: 'jakbar-sds',
      tasksDate: '2020-03-24',
      inputTasks: [
        {
          taskId: '000218059420',
          lineItems: [
            {
              id: '000218059420',
              name: 'Test Item',
              quantity: 1,
            },
          ],
          pickupContactPoint: {
            name: 'Anisa Sabyan',
            number: '628122041824',
          },
          pickupLocationAddress: {
            formattedAddress:
              '8, Jl. Ir. H. Juanda 3 No.17 - 19, RW.2, Kb. Klp., Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10120, Indonesia',
            pincode: '10120',
            city: 'Kota Jakarta Pusat',
            state: 'Daerah Khusus Ibukota Jakarta',
            countryCode: 'ID',
          },
          pickupLatLng: {
            lat: -6.16496,
            lng: 106.823236,
          },
          pickupSlot: {
            start: '2020-03-24T03:00:00.000Z',
            end: '2020-03-24T04:00:00.000Z',
          },
          pickupTransactionDuration: 1000,
          dropContactPoint: {
            name: 'Anisa R',
            number: '628122041824',
          },
          dropLocationAddress: {
            formattedAddress:
              'Jl. Kintamani Utara Blok Lb No.47, RT.8/RW.12, Kalideres, West Jakarta City, Jakarta 11840',
            pincode: '11840',
            city: 'Kota Jakarta Barat',
            state: 'Daerah Khusus Ibukota Jakarta',
            countryCode: 'ID',
          },
          dropLatLng: {
            lat: -6.1477812,
            lng: 106.7089414,
          },
          dropSlot: {
            start: '2020-03-24T05:00:00.000Z',
            end: '2020-03-24T06:00:00.000Z',
          },
          dropTransactionDuration: 1000,
          volume: {
            value: 1,
            unit: 'ITEM_COUNT',
          },
        },
      ],
    };

    try {
      const response = await axios.put(url, jsonData, options);
      return { status: response.status, ...response.data };
    } catch (error) {
      return {
        status: error.response.status,
        ...error.response.data,
      };
    }
  }
}
