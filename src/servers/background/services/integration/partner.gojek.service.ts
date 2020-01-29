import axios from 'axios';
import { GojekBookingPickupVm, GojekBookingPickupResponseVm, GojekBookingPayloadVm, GojekBookingResponseVm, GojekCancelBookingVm } from '../../models/partner/gojek-booking-pickup.vm';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Not, IsNull } from 'typeorm';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { ConfigService } from '../../../../shared/services/config.service';
import { WorkOrderAttr } from '../../../../shared/orm-entity/work-order-attr';
import moment = require('moment');
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { WorkOrder } from '../../../../shared/orm-entity/work-order';
import { WorkOrderHistory } from '../../../../shared/orm-entity/work-order-history';

export class PartnerGojekService {

  static async getStatusOrder(orderNo: string) {
    const response = await this.getStatusOrderGojek(orderNo);
    return response;
  }

  static async cancelBooking(payload: GojekBookingPickupVm) {
    const order = await WorkOrderAttr.findOne({
      select: ['workOrderAttrId', 'refOrderNo'],
      where: {
        workOrderId: payload.workOrderId,
        isDeleted: false,
      },
    });
    if (order) {
      const response = await this.cancelBookingGojek(order.refOrderNo);
      if (response.statusCode == 200) {
        // TODO: update data
        await WorkOrderAttr.update(order.workOrderAttrId, {
          userIdUpdated: payload.userId,
          updatedTime: moment().toDate(),
        });
      }
      // TODO: handle success cancel Booking ??
      return response;
    } else {
      RequestErrorService.throwObj({
        message: 'Surat jalan tidak ditemukan',
      });
    }
  }

  static async createBookingPickup(
    payload: GojekBookingPickupVm,
  ): Promise<GojekBookingPickupResponseVm> {
    const result = new GojekBookingPickupResponseVm();
    result.status = 'ok';
    result.message = 'success';
    result.data = null;
    result.response = null;

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
              // find and update data to work order attr
              await this.findAndCreateOrder(
                payload.workOrderId,
                requestGojek.orderNo,
                payload.userId,
              );
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

  static async callbackOrder(payload: any) {
    // NOTE: mapping status gojek
    // 9000 'FINDING DRIVER'
    // 9010 'DRIVER_FOUND'
    // 9020 'PICKED_UP'
    // 9030 'DRIVER_NOT_FOUND'
    // 9040 'CUSTOMER_CANCELLED'
    // 9050 'COMPLETED'
    // =====================================
    switch (payload.type) {
      case 'CREATED':
        this.updateStatusOrder(payload, 9000);
        break;
      case 'DRIVER_FOUND':
        this.updateStatusOrder(payload, 9010);
        break;
      case 'PICKED_UP':
        this.updateStatusOrder(payload, 9020);
        break;
      case 'DRIVER_NOT_FOUND':
        this.updateStatusOrder(payload, 9030);
        break;
      case 'CUSTOMER_CANCELLED':
        this.updateStatusOrder(payload, 9040);
        break;
      case 'COMPLETED':
        this.updateStatusOrder(payload, 9050);
        break;
      default:
        PinoLoggerService.log(payload);
        break;
    }
    return true;
  }

  // Work Order ==============================================================
  private static async findAndCreateOrder(
    workOrderId: number,
    orderNumber: string,
    userId: number,
  ) {
    const timeNow = moment().toDate();
    // TODO: find WorkOrderAttr
    try {
      const order = await WorkOrderAttr.findOne({
        select: ['workOrderAttrId'],
        where: {
          workOrderId,
          isDeleted: false,
        },
      });

      if (order) {
        await WorkOrderAttr.update(order.workOrderAttrId,
          {
            refBookingType: 'CREATED',
            refOrderNo: orderNumber,
            refOrderCreatedTime: timeNow,
          },
        );
      } else {
        // NOTE: partnerId gojek from table partner
        const woAttr = await WorkOrderAttr.create({
          workOrderId,
          refOrderNo: orderNumber,
          refOrderCreatedTime: timeNow,
          partnerId: 1,
          userIdCreated: userId,
          userIdUpdated: userId,
          createdTime: timeNow,
          updatedTime: timeNow,
        });
        await WorkOrderAttr.insert(woAttr);
      }
      return true;
    } catch (error) {
      PinoLoggerService.error(error);
      return false;
    }
  }

  private static async updateStatusOrder(params: any, workOrderStatusId: number) {
    const timeNow = moment().toDate();
    const order = await WorkOrderAttr.findOne({
      select: ['workOrderAttrId', 'workOrderId', 'userIdCreated'],
      where: {
        refOrderNo: params.booking_id,
        isDeleted: false,
      },
    });

    if (order) {

      await WorkOrder.update(order.workOrderId, {
        workOrderStatusIdLast: workOrderStatusId,
      });

      await WorkOrderAttr.update(order.workOrderAttrId, {
        refBookingType: params.type,
        refStatus: params.status,
        refReceiverName: params.receiver_name,
        refDriverName: params.driver_name,
        refDriverPhone: params.driver_phone,
        refTotalDistanceInKms: params.total_distance_in_kms,
        refLiveTrackingUrl: params.live_tracking_url,
        refDeliveryEta: params.delivery_eta,
        refPickupEta: params.pickup_eta,
        refCancelledBy: params.cancelled_by,
        refCancellationReason: params.cancellation_reason,
      });

      // TODO: add awb history
      const woh = await WorkOrderHistory.create({
        workOrderId: order.workOrderId,
        workOrderStatusId,
        userId: params['user_id'],
        branchId: params['branch_id'],
        isFinal: params['is_final'],
        historyDateTime: params['updated_time'],
        userIdCreated: order.userIdCreated,
        createdTime: timeNow,
        userIdUpdated: order.userIdCreated,
        updatedTime: timeNow,
      });
      await WorkOrderHistory.insert(woh);

    } else {
      PinoLoggerService.log('#### Not Found!!!');
    }
    return true;
  }

  private static createWorkOrderHistory() {
    return null;
  }

  // Partner GOJEK ============================================================
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
    const result = await axios.get(url, options);
    return result.data;
  }

  private static async cancelBookingGojek(orderNo: string) {
    const url = `${this.gojekBaseUrl}booking/cancel`;
    const options = {
      headers: this.headerGojek,
    };
    const data = {
      orderNo,
    };

    const result = await axios.put(url, data, options);
    return result.data;
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
