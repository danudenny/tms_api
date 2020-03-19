import axios from 'axios';
import { IsNull, Not } from 'typeorm';
import { Branch } from '../../../../shared/orm-entity/branch';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { WorkOrder } from '../../../../shared/orm-entity/work-order';
import { WorkOrderAttr } from '../../../../shared/orm-entity/work-order-attr';
import { WorkOrderHistory } from '../../../../shared/orm-entity/work-order-history';
import { ConfigService } from '../../../../shared/services/config.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import {
    GojekBookingPayloadVm, GojekBookingPickupResponseVm, GojekBookingPickupVm,
    GojekBookingResponseVm,
    GojekCancelBookingVm,
} from '../../models/partner/gojek-booking-pickup.vm';
import moment = require('moment');
import { GojekBookingPodVm, GojekBookingPodResponseVm } from '../../models/partner/gojek-booking-pod.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrderPartner } from '../../../../shared/orm-entity/order-partner';
import { DoPodAttr } from '../../../../shared/orm-entity/do-pod-attr';
import { DoPodDeliver } from '../../../../shared/orm-entity/do-pod-deliver';
import { DoPodDeliverDetail } from '../../../../shared/orm-entity/do-pod-deliver-detail';
import { DoPodDeliverHistory } from '../../../../shared/orm-entity/do-pod-deliver-history';

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
        refBookingType: Not('CUSTOMER_CANCELLED'),
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
      const response = {
          statusCode: 400,
          message: 'Surat jalan tidak ditemukan',
      }
      return response;
    }
  }

  static async createBookingPickup(
    payload: GojekBookingPickupVm,
  ): Promise<GojekBookingPickupResponseVm> {
    const result = new GojekBookingPickupResponseVm();
    result.status = 'failed';
    result.message = `Layanan tidak bisa digunakan saat ini`;
    result.data = null;
    result.response = null;

    const pickupDetail = await PickupRequestDetail.findOne({
      where: {
        workOrderIdLast: payload.workOrderId,
        shipperLongitude: Not(IsNull()),
        shipperLatitude: Not(IsNull()),
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
          mobile1: Not(IsNull()),
          isDeleted: false,
        },
      });

      if (branch) {
        // NOTE: sample data for TEST ONLY
        // const data = {
        //   originContactName: 'SiCepat Ekspres Indonesia Pusat',
        //   originContactPhone: '6285860708711',
        //   originLatLong: '-6.16496,106.823236',
        //   originAddress: 'Jl. Ir. H. Juanda 3 No.17 - 19, RT.8/RW.2, Kb. Klp., Kecamatan Gambir, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10120',
        //   destinationContactName: 'SiCepat Ekspres Daan Mogot',
        //   destinationContactPhone: '6285860708711',
        //   destinationLatLong: '-6.166001,106.7766058',
        //   destinationAddress: 'Jalan Daan Mogot II No. 100, M-NN No.RT.6, RW.5, Duri Kepa, Kec. Kb. Jeruk, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11510',
        //   item: 'Paket Test Sicepat',
        // };

        const data = new GojekBookingPayloadVm();
        // TODO: handle phone number??
        // .replace(/[^0-9]/g,''); digit only
        // .replace(/^0/, '62'); replace zero to 62
        let shipperPhone = pickupDetail.shipperPhone;
        shipperPhone = shipperPhone.replace(/[^0-9]/g, '');
        shipperPhone = shipperPhone.replace(/^0/, '62');

        let branchPhone = branch.mobile1;
        branchPhone = branchPhone.replace(/[^0-9]/g, '');
        branchPhone = branchPhone.replace(/^0/, '62');

        // data shipper
        data.originContactName = pickupDetail.shipperName;
        data.originContactPhone = shipperPhone;
        data.originLatLong = `${pickupDetail.shipperLatitude},${pickupDetail.shipperLongitude}`;
        data.originAddress = pickupDetail.shipperAddress;

        // data branch
        data.destinationContactName = branch.branchName;
        data.destinationContactPhone = branchPhone;
        data.destinationLatLong = `${branch.latitude},${branch.longitude}`;
        data.destinationAddress = branch.address;
        data.item = pickupDetail.parcelContent || 'Paket Sicepat';

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
                payload.branchId,
              );
              result.data = data;
              result.response = requestGojek;
              result.status = 'ok';
              result.message = 'success';
            }
          } else {
            result.status = 'failed';
            result.message = `Tidak bisa digunakan di daerah Anda`;
          }
        }
      } else {
        result.status = 'failed';
        result.message = 'Gerai tidak ditemukan atau data tidak lengkap';
      }
    } else {
      // pickup request not found
      result.status = 'failed';
      result.message = 'Data tidak ditemukan atau data tidak lengkap';
    }

    return result;
  }

  // Gojek Delivery
  static async createBookingDelivery(
    payload: GojekBookingPodVm,
  ): Promise<GojekBookingPodResponseVm> {
    const result           = new GojekBookingPodResponseVm();
    result.status          = 'failed';
    result.message         = `Layanan tidak bisa digunakan saat ini`;
    result.data            = null;
    result.response        = null;
    // const authMeta         = AuthService.getAuthData();
    // const permissonPayload = AuthService.getPermissionTokenPayload();

    const branch = await Branch.findOne({ where: {
        // branchId : permissonPayload.branchId,
        branchId : 3,
        isDeleted: false,
    }});

    // NOTE: Check do pod deliver id and awb item id valid or not
    const doPodDeliver = await DoPodDeliver.findOne({ where: {
      awbItemId     : payload.awbItemId,
      doPodDeliverId: payload.doPodDeliverId,
    }});

    // NOTE: Check if do pod deliver right data
    // if (!doPodDeliver) {
    //   result.status  = 'failed';
    //   result.message = 'Data tidak sesuai';
    //   return result;
    // }

    if (branch) {
      const data = new GojekBookingPayloadVm();
      if (branch.latitude && branch.longitude) {
        // NOTE: Origin Data
        data.originAddress      = branch.address;
        data.originContactPhone = branch.phone1;
        data.originContactName  = branch.branchName;
        data.originLatLong      = `${branch.latitude},${branch.longitude}`;

        if (!data.originContactPhone) {
          result.status = 'failed';
          result.message = 'Data tidak lengkap, gerai tidak memiliki data no telpon';
          return result;
        }

        const pickReqDetail = await PickupRequestDetail.findOne({ where: { awbItemId: payload.awbItemId } });
        if (pickReqDetail) {
          if (pickReqDetail.recipientLatitude && pickReqDetail.recipientLongitude) {
            // NOTE: Destination Data
            data.destinationContactName  = pickReqDetail.recipientName;
            data.destinationAddress      = pickReqDetail.recipientAddress;
            data.destinationLatLong      = `${pickReqDetail.recipientLatitude},${pickReqDetail.recipientLongitude}`;
            data.destinationContactPhone = pickReqDetail.recipientPhone;
            data.item                    = pickReqDetail.parcelCategory;
            const calculate              = await this.getEstimatePrice(data.originLatLong, data.destinationLatLong);
            if (calculate) {
              const shipmentMethod = calculate[this.shipmentMethodGojek];
              if (shipmentMethod.serviceable) {
                const requestGojek = await this.createBooking(data);
                if (requestGojek) {
                  const detailData = {
                    response: requestGojek,
                    // userId  : authMeta.userId,
                    userId  : 3,
                    // branchId: permissonPayload.branchId,
                    branchId: 3,
                    payload,
                  };

                  await this.responProcessForPod(detailData);
                  result.data     = data;
                  result.response = requestGojek;
                  result.status   = 'ok';
                  result.message  = 'success';
                }
              } else {
                result.status  = 'failed';
                result.message = `Tidak bisa digunakan di daerah Anda`;
              }
            }
          } else {
            // NOTE: destination does not have latitude and longitude
            result.status  = 'failed';
            result.message = 'Alamat pengiriman resi tidak memiliki data latitude dan longitude';
          }
        } else {
          // NOTE: AWB Item Not found in table pickup request detail
          result.status  = 'failed';
          result.message = 'No resi tidak ditemukan';
        }
      } else {
        // NOTE: branch does not have latitude or longitude
        result.status  = 'failed';
        result.message = 'Gerai tidak memiliki data latitude dan longitude';
      }

    } else {
      // NOTE: branch not found
      result.status  = 'failed';
      result.message = 'Gerai tidak ditemukan';
    }
    return result;
  }

  static async cancelBookingDelivery(payload: GojekCancelBookingVm) {
    const doPodAttr = await DoPodAttr.findOne({ where: { refOrderNo: payload.orderNo, refBookingType: Not('CUSTOMER_CANCELED') } });
    const authMeta  = AuthService.getAuthData();
    if (doPodAttr) {
      let response = await this.cancelBookingGojek(payload.orderNo);
      if (response) {
        if (response.statusCode === 200) {
          await DoPodDeliverDetail.update({
            doPodDeliverId: doPodAttr.doPodDeliverId,
          },
          {
            awbStatusIdLast      : 14900,
            awbStatusDateTimeLast: moment().toDate(),
            userIdUpdated        : authMeta.userId,
            updatedTime          : moment().toDate(),
          });

          doPodAttr.refType              = 'CUSTOMER_CANCELLED';
          doPodAttr.updatedTime          = moment().toDate();
          doPodAttr.userIdUpdated        = 3; // superadmin
          doPodAttr.refOrderDispatchTime = moment().toDate();
          doPodAttr.refStatus            = 'cancelled';
          doPodAttr.save();
        }
        return response;
      } else {
        response = {
          status: 'failed',
          message: 'Saat ini sedang terjadi masalah pada partner, silakan coba beberapa saat lagi',
        };
        return response;
      }
    } else {
      const response = {
        status: 'failed',
        message: 'No order tidak ditemukan',
      };
      return response;
    }
  }

  private static async updateStatusDoPodDeliver(payload, status) {
    const doPodAttr = await DoPodAttr.findOne({ where: { refOrderNo: payload.booking_id } });
    if (doPodAttr) {
      const eventDate =  moment(payload.event_date).toDate();
      // NOTE: Update status
      doPodAttr.refBookingType        = payload.booking_type;
      doPodAttr.refStatus             = payload.status;
      doPodAttr.refReceiverName       = payload.receiver_name;
      doPodAttr.refLiveTrackingUrl    = payload.live_tracking_url;
      doPodAttr.refCancellationReason = payload.cancellation_reason;
      doPodAttr.refCancelledBy        = payload.cancelled_by;
      doPodAttr.refTotalDistanceInKms = payload.total_distance_in_kms;
      doPodAttr.refDriverName         = payload.driver_name;
      doPodAttr.refDriverPhone        = payload.driver_phone;
      doPodAttr.refDriverPhone2       = payload.driver_phone2;
      doPodAttr.refType               = payload.type;
      doPodAttr.refDriverPhone3       = payload.driver_phone3;
      doPodAttr.refDriverPhotoUrl     = payload.driver_photo_url;
      doPodAttr.refDeliveryEta        = payload.delivery_eta;
      doPodAttr.refPickupEta          = payload.pickup_eta;
      doPodAttr.updatedTime           = moment().toDate();
      doPodAttr.userIdUpdated         = 3;

      if (payload.type === 'CREATED') {
        doPodAttr.refOrderCreatedTime = eventDate;
      } else if (payload.type === 'COMPLETED') {
        doPodAttr.refOrderArrivalTime = eventDate;
      } else if (payload.type === 'CUSTOMER_CANCELLED') {
        doPodAttr.refOrderDispatchTime = eventDate;
      }

      doPodAttr.save();

      // NOTE: Update do pod deliver detail
      const doPodDeliverDetail = await DoPodDeliverDetail.findOne({
        doPodDeliverId: doPodAttr.doPodDeliverId,
      });
      if (doPodDeliverDetail) {
        doPodDeliverDetail.awbStatusIdLast       =  status;
        doPodDeliverDetail.awbStatusDateTimeLast =  moment().toDate();
        doPodDeliverDetail.updatedTime           =  moment().toDate();
        doPodDeliverDetail.save();

        // NOTE: Insert to do pod deliver detail history
        const doPodDeliverHistory                = DoPodDeliverHistory.create();
        doPodDeliverHistory.doPodDeliverDetailId = doPodDeliverDetail.doPodDeliverDetailId;
        doPodDeliverHistory.awbStatusId          = status;
        doPodDeliverHistory.awbStatusDateTime    = moment().toDate();
        doPodDeliverHistory.historyDateTime      = moment().toDate();
        doPodDeliverHistory.userIdCreated        = 3; // superadmin
        doPodDeliverHistory.userIdUpdated        = 3; // superadmin
        doPodDeliverHistory.createdTime          = moment().toDate();
        doPodDeliverHistory.updatedTime          = moment().toDate();
        await DoPodDeliverHistory.insert(doPodDeliverHistory);
      }
    }
  }

  private static async responProcessForPod(data: {
    response: any;
    userId: number;
    branchId: number;
    payload: GojekBookingPodVm
  }) {
    // NOTE: Insert to order partner
    const orderPartner         = OrderPartner.create();
    orderPartner.partnerId     = data.payload.partnerId;
    orderPartner.orderNo       = data.response.orderNo;
    orderPartner.isDelivery    = true;
    orderPartner.isPickup      = false;
    orderPartner.userIdCreated = data.userId;
    orderPartner.userIdUpdated = data.userId;
    orderPartner.updatedTime   = moment().toDate();
    orderPartner.createdTime   = moment().toDate();
    await OrderPartner.insert(orderPartner);

    // NOTE: Insert to do pod attr
    const doPodAttr          = DoPodAttr.create();
    doPodAttr.refOrderNo     = data.response.orderNo;
    doPodAttr.partnerId      = data.payload.partnerId;
    doPodAttr.branchId       = data.branchId;
    doPodAttr.doPodDeliverId = data.payload.doPodDeliverId;
    doPodAttr.createdTime    = moment().toDate();
    doPodAttr.updatedTime    = moment().toDate();
    doPodAttr.userIdCreated  = data.userId;
    doPodAttr.userIdUpdated  = data.userId;
    await DoPodAttr.insert(doPodAttr);

  }
  // End Gojek Delivery
  static async callbackOrder(payload: any) {
    // NOTE: mapping status gojek
    // 9000 'FINDING DRIVER'
    // 9010 'DRIVER_FOUND'
    // 9020 'PICKED_UP'
    // 9030 'DRIVER_NOT_FOUND'
    // 9040 'CUSTOMER_CANCELLED'
    // 9050 'COMPLETED'
    // =====================================
    const orderPartnerData = await OrderPartner.findOne({ where: { orderNo: payload.booking_id } });
    if (orderPartnerData.isDelivery) {
        // NOTE: Delivery
      switch (payload.type) {
        case 'CREATED':
          this.updateStatusDoPodDeliver(payload, 14500);
          break;
        case 'DRIVER_FOUND':
          this.updateStatusDoPodDeliver(payload, 14950);
          break;
        case 'PICKED_UP':
          this.updateStatusDoPodDeliver(payload, 14600);
          break;
        case 'DRIVER_NOT_FOUND':
          this.updateStatusDoPodDeliver(payload, 14800);
          break;
        case 'CUSTOMER_CANCELLED':
          this.updateStatusDoPodDeliver(payload, 14900);
          break;
        case 'COMPLETED':
          this.updateStatusDoPodDeliver(payload, 30000);
          break;
        default:
          PinoLoggerService.log(payload);
          break;
      }
    } else {
      // NOTE: Pickup
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
    }
    return true;
  }
  // Work Order ==============================================================
  private static async findAndCreateOrder(
    workOrderId: number,
    orderNumber: string,
    userId: number,
    branchId: number,
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
            branchId,
            userIdUpdated: userId,
          },
        );
      } else {
        // NOTE: partnerId gojek from table partner
        const woAttr = await WorkOrderAttr.create({
          workOrderId,
          refOrderNo: orderNumber,
          refOrderCreatedTime: timeNow,
          partnerId: 1,
          branchId,
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
      select: [
        'workOrderAttrId',
        'workOrderId',
        'refOrderCreatedTime',
        'branchId',
        'userIdCreated',
      ],
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
        userId: order.userIdCreated,
        branchId: order.branchId,
        historyDateTime: order.refOrderCreatedTime,
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
