import axios from 'axios';
import { GojekBookingPickupVm, GojekBookingPickupResponseVm, GojekBookingPayloadVm, GojekBookingResponseVm } from '../../models/partner/gojek-booking-pickup.vm';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Not, IsNull } from 'typeorm';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { ConfigService } from '../../../../shared/services/config.service';

export class PartnerGojekService {

  static async getStatusOrder(orderNo: string) {
    const response = await this.getStatusOrderGojek(orderNo);
    return response;
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
    result.response = null;
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
        // NOTE: sample data for TEST ONLY
        const data = {
          originContactName: 'SiCepat Ekspres Indonesia Pusat',
          originContactPhone: '6285860708711',
          originLatLong: '-6.16496,106.823236',
          originAddress: 'Jl. Ir. H. Juanda 3 No.17 - 19, RT.8/RW.2, Kb. Klp., Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10120',
          destinationContactName: 'SiCepat Ekspres Daan Mogot',
          destinationContactPhone: '6285860708711',
          destinationLatLong: '-6.166001,106.7766058',
          destinationAddress: 'Jalan Daan Mogot II No. 100, M-NN No.RT.6, RW.5, Duri Kepa, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11510',
          item: 'Paket Test Sicepat',
        };

        const data2 = new GojekBookingPayloadVm();
        // TODO: handle phone number??
        // .replace(/[^0-9]/g,'')
        // data2.originContactName = pickupDetail.shipperName;
        // data2.originContactPhone = pickupDetail.shipperPhone;
        // data2.originLatLong = `${pickupDetail.shipperLatitude},${pickupDetail.shipperLongitude}`;
        // data2.originAddress = pickupDetail.shipperAddress;

        // data2.destinationContactName = branch.branchName;
        // data2.destinationContactPhone = branch.mobile1;
        // data2.destinationLatLong = `${branch.latitude},${branch.longitude}`;
        // data2.destinationAddress = branch.address;
        // data2.item = pickupDetail.parcelContent || 'Paket Sicepat';

        // NOTE: estimate price and calculate distance
        const calculate = await this.getEstimatePrice(data.originLatLong, data.destinationLatLong);
        if (calculate) {
          const shipmentMethod = calculate[this.shipmentMethodGojek];
          if (shipmentMethod.serviceable) {
            const requestGojek = await this.createBooking(data);
            if (requestGojek) {
              // TODO: save response data to db
              result.data = data;
              result.response = requestGojek;
            } else {
              result.status = 'failed';
              result.message = `Layanan tidak bisa digunakan saat ini`;
            }
          } else {
            result.status = 'failed';
            result.message = `Tidak bisa digunakan di daerah Anda`;
          }
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

  private static get gojekBaseUrl() {
    return ConfigService.get('gojek.baseUrl');
  }

  private static get headerGojek() {
    return {
      'Client-ID': ConfigService.get('gojek.clientId'),
      'Pass-Key': ConfigService.get('gojek.passKey'),
      'Content-Type': 'application/json',
    };
  }

  private static get shipmentMethodGojek() {
    // shipment_method: 'Instant' or 'SameDay';
    return ConfigService.get('gojek.shipmentMethod');
  }

  private static async createBooking(
    data: GojekBookingPayloadVm,
  ): Promise<GojekBookingResponseVm> {
    // PaymentType: 3 - corporate. COD delivery is not supported
    const jsonData = {
      paymentType: 3,
      deviceToken: '',
      collection_location: 'pickup',
      shipment_method: this.shipmentMethodGojek,
      routes: [
        {
          originName: '',
          originNote: '',
          originContactName: data.originContactName,
          originContactPhone: data.originContactPhone,
          originLatLong: data.originLatLong,
          originAddress: data.originAddress,
          destinationName: '',
          destinationNote: '',
          destinationContactName: data.destinationContactName,
          destinationContactPhone: data.destinationContactPhone,
          destinationLatLong: data.destinationLatLong,
          destinationAddress: data.destinationAddress,
          item: data.item,
          storeOrderId: '',
          insuranceDetails: {},
        },
      ],
    };
    const url = `${this.gojekBaseUrl}booking`;
    const options = {
      headers: this.headerGojek,
    };

    // TODO:
    const response = await axios.post(url, jsonData, options);
    // Created
    PinoLoggerService.debug('## REQUEST GOJEK', jsonData);
    PinoLoggerService.debug('## RESPONSE GOJEK', response.data);
    return response && response.status == 201 ? response.data : null;
  }

  private static async getStatusOrderGojek(orderNo: string) {
    const url = `${this.gojekBaseUrl}booking/orderno/${orderNo}`;
    const options = {
      headers: this.headerGojek,
    };
    const response = await axios.get(url, options);
    return response.data;
  }

  private static async getEstimatePrice(
    originLatLong: string,
    destinationLatLong: string,
  ) {
    const urlPost = `${this.gojekBaseUrl}calculate/price`;
    const options = {
      headers: this.headerGojek,
      params: {
        origin: originLatLong,
        destination: destinationLatLong,
        paymentType: 3,
      },
    };
    // shipment_method: 'Instant' or 'SameDay';
    const response = await axios.get(urlPost, options);
    return response.data;
  }
}
