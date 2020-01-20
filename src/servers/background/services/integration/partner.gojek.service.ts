import axios from 'axios';
import { GojekBookingPickupVm, GojekBookingPickupResponseVm, GojekBookingPayloadVm, GojekBookingResponseVm } from '../../models/partner/gojek-booking-pickup.vm';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Not, IsNull } from 'typeorm';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';

export class PartnerGojekService {

  static async getStatusOrder(orderNo: string) {
    const response = await this.getStatusOrderGojek(orderNo);
    return response.data;
  }

  static async cancelBooking() {
    // request
    // {
    //   "orderNo": "GK-364491"
    // }

    // response
    // {
    //   "statusCode": 200,
    //   "message": "Booking cancelled"
    // }
    return null;
  }

  static async createBookingPickup(
    payload: GojekBookingPickupVm,
  ): Promise<GojekBookingPickupResponseVm> {
    const result = new GojekBookingPickupResponseVm();
    result.status = 'ok';
    result.message = 'success';
    result.data = null;
    // TODO:
    // find data pickup_request_detail where work_order_id
    // get data shipper lat,long, address, shipper name, shipper mobile phone
    // find data branch where branch_id
    // get data branch lat, long and address, mobile phone, PIC
    // item ??
    console.log(payload);

    const pickupDetail = await PickupRequestDetail.findOne({
      where: {
        workOrderIdLast: payload.workOrderId,
        isDeleted: false,
      },
    });
    if (pickupDetail) {
      // find branch
      const branch = await Branch.findOne({
        where: {
          branchId: payload.branchId,
          longitude: Not(IsNull()),
          latitude: Not(IsNull()),
          isDeleted: false,
        },
      });

      if (branch) {
        // NOTE: sample data
        // "originContactName": "SiCepat Ekspres Indonesia Pusat",
        // "originContactPhone": "6285860708711",
        // "originLatLong": "-6.16496,106.823236",
        // "originAddress": "Jl. Ir. H. Juanda 3 No.17 - 19, RT.8/RW.2, Kb. Klp., Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10120",
        // "destinationContactName": "SiCepat Ekspres Daan Mogot",
        // "destinationContactPhone": "6285860708711",
        // "destinationLatLong": "-6.166001,106.7766058",
        // "destinationAddress": "Jalan Daan Mogot II No. 100, M-NN No.RT.6, RW.5, Duri Kepa, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11510",
        // "item": "Paket Sicepat",
        let data = new GojekBookingPayloadVm();
        data = {
          originContactName: 'SiCepat Ekspres Indonesia Pusat',
          originContactPhone: '6285860708711',
          originLatLong: '-6.16496,106.823236',
          originAddress: 'Jl. Ir. H. Juanda 3 No.17 - 19, RT.8/RW.2, Kb. Klp., Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10120',
          destinationContactName: 'SiCepat Ekspres Daan Mogot',
          destinationContactPhone: '6285860708711',
          destinationLatLong: '-6.166001,106.7766058',
          destinationAddress: 'Jalan Daan Mogot II No. 100, M-NN No.RT.6, RW.5, Duri Kepa, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11510',
          item: 'Paket Sicepat',
        };
        const requestGojek = await this.createBooking(data);
        if (requestGojek) {
          result.data = requestGojek;
        }
      } else {
        result.status = 'failed';
        result.message = 'Gerai tidak ditemukan atau tidak memiliki data lengkap';
      }
    } else {
      // pickup request not found
      result.status = 'failed';
      result.message = 'Data tidak ditemukan';
    }

    return result;
  }

  private static get headerGojek() {
    return {
      'Client-ID': 'si-cepat-engine',
      'Pass-Key':
        '2e8a7f4d5ef4b746a503ef270ce2a98e562bc77e2dd6c19bf10e3d95e3390393',
      'Content-Type': 'application/json',
    };
  }

  private static async createBooking(
    data: GojekBookingPayloadVm,
  ): Promise<GojekBookingResponseVm> {
    const jsonData = {
      paymentType: 3,
      deviceToken: '',
      collection_location: 'pickup',
      shipment_method: 'Instant',
      routes: [
        {
          originName: '',
          originNote: '',
          originContactName: 'SiCepat Ekspres Indonesia Pusat',
          originContactPhone: '6285860708711',
          originLatLong: '-6.16496,106.823236',
          originAddress: 'Jl. Ir. H. Juanda 3 No.17 - 19, RT.8/RW.2, Kb. Klp., Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10120',
          destinationName: '',
          destinationNote: '',
          destinationContactName: 'SiCepat Ekspres Daan Mogot',
          destinationContactPhone: '6285860708711',
          destinationLatLong: '-6.166001,106.7766058',
          destinationAddress: 'Jalan Daan Mogot II No. 100, M-NN No.RT.6, RW.5, Duri Kepa, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11510',
          item: 'Paket Sicepat',
          storeOrderId: '',
          insuranceDetails: {},
        },
      ],
    };
    PinoLoggerService.log(jsonData);
    const url =
      'https://integration-kilat-api.gojekapi.com/gokilat/v10/booking';

    const options = {
      headers: this.headerGojek,
    };

    // TODO:
    const response = await axios.post(url, jsonData, options);
    return response.data;
  }

  private static async getStatusOrderGojek(orderNo: string) {
    const url =
      'https://integration-kilat-api.gojekapi.com/gokilat/v10/booking/orderno/' + orderNo;
    const headers = {
      'Client-ID': 'si-cepat-engine',
      'Pass-Key':
        '2e8a7f4d5ef4b746a503ef270ce2a98e562bc77e2dd6c19bf10e3d95e3390393',
      'Content-Type': 'application/json',
    };

    const options = {
      headers,
    };
    const response = await axios.get(url, options);
    // console.log(response);
    console.log(response.status);
    return response.data;
  }

  private static async getEstimatePrice() {
    const urlPost =
      'https://integration-kilat-api.gojekapi.com/gokilat/v10/calculate/price';
    const headers = {
      'Client-ID': 'si-cepat-engine',
      'Pass-Key':
        '2e8a7f4d5ef4b746a503ef270ce2a98e562bc77e2dd6c19bf10e3d95e3390393',
      'Content-Type': 'application/json',
    };

    const options = {
      headers,
      params: {
        origin: '-6.16496,106.823236',
        destination: '-6.166001,106.7766058',
        paymentType: 3,
      },
    };
    const response = await axios.get(urlPost, options);
    // console.log(response);
    console.log(response.status);
    return response.data;
  }
}
