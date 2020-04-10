import { Injectable, Param } from '@nestjs/common';
import moment = require('moment');
import axios from 'axios';
import { RedisService } from '../../../../shared/services/redis.service';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AwbSendPartner } from '../../../../shared/orm-entity/awb-send-partner';
import { ConfigService } from '../../../../shared/services/config.service';
import { WorkOrder } from '../../../../shared/orm-entity/work-order';
import { WorkOrderHistory } from '../../../../shared/orm-entity/work-order-history';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { WorkOrderDetail } from '../../../../shared/orm-entity/work-order-detail';
import { SysCounter } from '../../../../shared/orm-entity/sys-counter';
import { AwbPartnerLog } from '../../../../shared/orm-entity/awb-partner-log';

@Injectable()
export class PartnerService {
  static postIndonesiaBaseUrl = ConfigService.get('posIndonesia.baseUrl');
  static async sendAwbPosIndonesia(payload: any): Promise<any> {
    let result = {};

    const redisStatus = await RedisService.get(`posindonesia:status`);
    // console.log('Status ' + redisStatus);
    if (redisStatus == '1') {
      return (result = {
        code: '422',
        message: 'ABORTED CAUSE PREVIOUS PROCESS IS RUNNING',
      });
    }

    // let totalProcess = 0;
    // let awbs = [];
    let retry = 0;
    let validAccessToken = false;
    let accessToken = '';

    while (validAccessToken == false && retry <= 2) {
      retry++;
      accessToken = await this.getAccessTokenPosIndonesia();
      console.log(accessToken);
      if (accessToken != '') {
        validAccessToken = true;
      }
    }

    if (validAccessToken) {
      let arrAwb = [];

      // Notes: Pos Indonesia Use All Awb
      const data = await this.getAwb();

      if (data) {
        arrAwb = await this.sendPosIndonesia(data, accessToken.toString());
      }
      result = {
        code: '200',
        message: 'Success',
        awb: arrAwb,
      };
    } else {
      result = {
        code: '422',
        message: 'Invalid Partner Access Token',
      };
    }

    return result;
  }

  static async getAccessTokenPosIndonesia() {
    let accessToken = '';
    let expiresIn = 3500;

    const redisData = await RedisService.get(`posindonesia:access-token`);
    if (redisData) {
      console.log('GET ACCESS TOKEN FROM REDIS');
      return redisData;
    }

    const urlToken =
      this.postIndonesiaBaseUrl +
      ConfigService.get('posIndonesia.tokenEndpoint');
    const params = {
      grant_type: 'client_credentials',
    };
    const auth = {
      username: ConfigService.get('posIndonesia.username'),
      password: ConfigService.get('posIndonesia.password'),
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const config = {
      auth,
      params,
      headers,
    };
    try {
      const response = await axios.post(urlToken, null, config);
      console.log(response);
      if (response.data.access_token) {
        accessToken = response.data.access_token;
        expiresIn = response.data.expires_in;
        await RedisService.setex(
          `posindonesia:access-token`,
          accessToken,
          Number(expiresIn) - 10,
        );
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response);
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    }

    return accessToken;
  }

  private static async getAwb(partnerId: number = 0): Promise<any> {
    const backDate = moment()
      .add(-1, 'days')
      .format('YYYY-MM-DD 00:00:00');

    const query = `
      SELECT
        prd.ref_awb_number as "refAwbNumber",
        prd.shipper_name as "shipperName",
        prd.shipper_phone as "shipperPhone",
        prd.shipper_address as "shipperAddress",
        prd.shipper_district as "shipperDistrict",
        prd.shipper_city as "shipperCity",
        prd.shipper_province as "shipperProvince",
        prd.shipper_zip as "shipperZip",
        prd.recipient_name as "recipientName",
        prd.recipient_phone as "recipientPhone",
        prd.recipient_address as "recipientAddress",
        prd.recipient_district as "recipientDistrict",
        prd.recipient_city as "recipientCity",
        prd.recipient_province as "recipientProvince",
        prd.recipient_zip as "recipientZip",
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
      INNER JOIN pickup_request pr ON prd.pickup_request_id=pr.pickup_request_id and pr.is_deleted=false
      LEFT JOIN awb_send_partner a ON prd.ref_awb_number=a.awb_number and a.is_deleted=false
      WHERE prd.created_time >= :backDate and (a.awb_number IS NULL OR a.is_send=false) and prd.is_deleted=false and prd.ref_awb_number is not null
      --ORDER BY prd.pickup_request_detail_id
      LIMIT 2000
    `;

    return await RawQueryService.queryWithParams(query, {
      backDate,
    });
  }

  private static async sendPosIndonesia(
    data: any,
    token: string,
  ): Promise<any> {
    const arrAwb = [];
    const partnerId = 74;

    await RedisService.setex(`posindonesia:status`, '1', 180);

    for (const awb of data) {
      const postPartner = await this.postPartnerPosIndonesia(awb, token);

      const timeNow = moment().toDate();
      let isSendPartner = false;
      if (postPartner['code'] == 200) {
        isSendPartner = true;
        arrAwb.push(awb.refAwbNumber);
      }

      if (awb.awbSendPartnerId == null) {
        const awbSendPartner = AwbSendPartner.create();
        awbSendPartner.partnerId = partnerId;
        awbSendPartner.awbNumber = awb.refAwbNumber;
        awbSendPartner.isSend = isSendPartner;
        awbSendPartner.sendCount = awb.sendCount + 1;
        awbSendPartner.lastSendDateTime = timeNow;
        awbSendPartner.responseCode = postPartner['code'];
        awbSendPartner.responseData = postPartner['data'];
        awbSendPartner.sendData = postPartner['sendData'];
        awbSendPartner.userIdCreated = 0;
        awbSendPartner.userIdUpdated = 0;

        await AwbSendPartner.insert(awbSendPartner);
      } else {
        await AwbSendPartner.update(awb.awbSendPartnerId, {
          isSend: isSendPartner,
          responseCode: postPartner['code'],
          responseData: postPartner['data'],
          sendData: postPartner['sendData'],
          sendCount: awb.sendCount + 1,
          lastSendDateTime: timeNow,
          userIdUpdated: 0,
          updatedTime: timeNow,
        });
      }
    }

    await RedisService.setex(`posindonesia:status`, '0', 1000);

    return arrAwb;
  }

  private static async postPartnerPosIndonesia(
    data: any,
    token: string,
  ): Promise<any> {
    const urlPost =
      this.postIndonesiaBaseUrl +
      ConfigService.get('posIndonesia.postAwbEndpoint');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    };

    const config = {
      headers,
    };
    const yearNow = moment().format('YY');

    const jsonData = {
      userid: 14,
      memberid: 'LOGSICEPAT04100A',
      orderid: 'SCP' + data.refAwbNumber,
      addresses: [
        {
          addresstype: 'senderlocation',
          customertype: 1,
          name: data.shipperName,
          phone: data.shipperPhone,
          email: '',
          address: data.shipperAddress,
          subdistrict: data.shipperDistrict,
          city: data.shipperCity,
          province: data.shipperProvince,
          zipcode: data.shipperZip,
          country: 'indonesia',
          geolang: 0,
          geolat: 0,
          description: '',
        },
        {
          addresstype: 'receiverlocation',
          customertype: 1,
          name: data.recipientName,
          phone: data.recipientPhone,
          email: data.pickupRequestEmail,
          address: data.recipientAddress,
          subdistrict: data.recipientDistrict,
          city: data.recipientCity,
          province: data.recipientProvince,
          zipcode: data.recipientZip,
          country: 'indonesia',
          geolang: 0,
          geolat: 0,
          description: '',
        },
      ],
      itemdetils: [
        {
          hscode: '0',
          origincountry: '0',
          description: '0',
          quantity: '0',
          value: '0',
        },
      ],
      itemproperties: {
        itemtypeid: 1,
        productid: '871238',
        valuegoods: 0,
        weight: data.totalWeight * 1000,
        length: data.parcelLength,
        width: data.parcelWidth,
        height: data.parcelHeight,
        codvalue: data.codValue,
        pin: 0,
        itemdesc: data.parcelContent,
      },
      paymentvalues: [
        {
          name: 'fee',
          value: 1000,
        },
        {
          name: 'insurance',
          value: 0,
        },
      ],
      taxes: [
        {
          name: 'fee',
          value: 10,
        },
        {
          name: 'insurance',
          value: 0,
        },
      ],
      services: [
        {
          name: 'cod',
          value: 0,
        },
        {
          name: 'pickup',
          value: 0,
        },
        {
          name: 'delivery',
          value: 0,
        },
        {
          name: 'insurance',
          value: 0,
        },
        {
          name: 'genreceipt',
          value: 0,
        },
        {
          name: 'printreceipt',
          value: 0,
        },
      ],
    };

    let result = {};
    try {
      console.log('#### START POST AWB POS INDONESIA');
      const response = await axios.post(urlPost, jsonData, config);
      result = {
        code: response.status,
        data: response.data,
        sendData: jsonData,
      };
      console.log(response);
      console.log(response.data);
      console.log(response.status);
      console.log(response.headers);
    } catch (error) {
      if (error.response) {
        result = {
          code: error.response.status,
          data: error.response.data,
          sendData: '',
        };
        console.log(error.response);
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      }
    }

    return result;
  }

  static async dropAwbPosIndonesia(payload: any): Promise<any> {
    let result = {};
    const timeNow = moment().toDate();
    const workOrderUpdated = [];
    const workOrderCreated = [];

    // let totalProcess = 0;
    // let awbs = [];
    let paramAwb = '';
    let paramBranchCode = '';
    let paramPartnerId = '';
    paramAwb = payload.awb;
    paramAwb = paramAwb.substring(3, 15);
    paramBranchCode = payload.branch_code;
    paramPartnerId = payload.partner_id;

    // Notes: Pos Indonesia Use All Awb
    const data = await this.getAwbWorkOrderId(paramAwb);
    let workOrderIdLast = null;
    let pickupRequestId = null;
    let workOrderStatusIdLast = null;
    let refAwbNumber = null;
    let pickupRequestDetailId = null;
    let paramBranchPartnerId = null;
    let awbItemId = null;
    let pickupRequestAddress;
    let encryptAddress255;
    let encryptMerchantName;
    let pickupRequestName;
    let pickupRequestContactNo ;
    let pickupRequestEmail;
    let pickupRequestNotes;
    let paramworkOrdeStatusIdPick;

    const arrDropStatus = [7050, 7060, 7070, 7100];
    const arrPickStatus = [4950, 5000];
    const err = '';

    const dataBranch = await this.getBranchPartnerId(paramBranchCode);

    for (const item of data) {
      workOrderIdLast = item.work_order_id_last;
      pickupRequestId = item.pickup_request_id;
      workOrderStatusIdLast = item.work_order_status_id_last;
      refAwbNumber = item.ref_awb_number;
      pickupRequestDetailId = item.pickup_request_detail_id;
      awbItemId = item.awb_item_id;
      pickupRequestAddress = item.pickup_request_address;
      encryptAddress255 = item.encrypt_address255;
      encryptMerchantName = item.encrypt_merchant_name;
      pickupRequestName = item.pickup_request_name;
      pickupRequestContactNo = item.pickup_request_contact_no;
      pickupRequestEmail = item.pickup_request_email;
      pickupRequestNotes = item.pickup_request_notes;
      paramworkOrdeStatusIdPick = item.work_order_status_id_pick;
    }

    for (const itemBranch of dataBranch) {
      paramBranchPartnerId = itemBranch.branch_partner_id;
    }

    if (refAwbNumber != null) {
      const dataWorkOrderCode = await this.getDataWorkOrderCode(timeNow);
      if (arrDropStatus.indexOf(Math.floor(workOrderStatusIdLast)) > -1) {
        result = {
          code: '422',
          message: 'Awb Already Drop Status',
        };
        const paramsAwbPartnerLog = {
          partner_id: paramPartnerId,
          awb_number: refAwbNumber,
          request_data: payload.body,
          response_code: 422,
          response_data: 'Awb Already Drop Status',
          user_id: '1',
          created_time: timeNow,
          updated_time: timeNow,
        };
        const dataParamsAwbPartnerLog = await this.getDataAwbPartnerLog(
          paramsAwbPartnerLog,
        );
        const awb_partner_log = await AwbPartnerLog.insert(
          dataParamsAwbPartnerLog,
        );
        return result;
      } else {
        if (paramBranchPartnerId == null) {
          result = {
            code: '422',
            message: 'Branch code not found',
          };
          const paramsAwbPartnerLog = {
            partner_id: paramPartnerId,
            awb_number: refAwbNumber,
            request_data: payload.body,
            response_code: 422,
            response_data: 'Branch code not Status',
            user_id: '1',
            created_time: timeNow,
            updated_time: timeNow,
          };
          const dataParamsAwbPartnerLog = await this.getDataAwbPartnerLog(
            paramsAwbPartnerLog,
          );
          const awb_partner_log = await AwbPartnerLog.insert(
            dataParamsAwbPartnerLog,
          );
          return result;
        } else {
          // Tambahan Kur
          if (arrPickStatus.indexOf(Math.floor(paramworkOrdeStatusIdPick)) > -1) {
            result = {
              code: '422',
              message: 'Awb Already Pick Status',
            };
            const paramsAwbPartnerLog = {
              partner_id: paramPartnerId,
              awb_number: refAwbNumber,
              request_data: payload.body,
              response_code: 422,
              response_data: 'Awb Already Pick Status',
              user_id: '1',
              created_time: timeNow,
              updated_time: timeNow,
            };
            const dataParamsAwbPartnerLog = await this.getDataAwbPartnerLog(
              paramsAwbPartnerLog,
            );
            const awb_partner_log = await AwbPartnerLog.insert(
              dataParamsAwbPartnerLog,
            );
            return result;
          }
          // end of tambahn kur
          if (workOrderIdLast === null) {
            const paramsWorkOrder = {
              work_order_code: dataWorkOrderCode,
              work_order_date: timeNow,
              pickup_schedule_date_time: timeNow,
              work_order_status_id_last: '7050',
              work_order_status_id_pick: null,
              branch_id_assigned: '0',
              branch_id: '0',
              is_member: true,
              work_order_type: 'AUTOMATIC',
              branch_partner_id: paramBranchPartnerId,
              partner_id_assigned: paramPartnerId,
              pickup_address: pickupRequestAddress,
              encrypt_address255: encryptAddress255,
              merchant_name: pickupRequestName,
              encrypt_merchant_name: encryptMerchantName,
              pickup_phone: pickupRequestContactNo,
              pickup_email: pickupRequestEmail,
              pickup_notes: pickupRequestNotes,
              total_awb_qty: 1,
              user_id: '1',
              created_time: timeNow,
              updated_time: timeNow,
            };
            const dataWorkOrder = await this.getDataWorkOrder(paramsWorkOrder);
            const workOrder = await WorkOrder.insert(dataWorkOrder);

            // console.log(work_order);
            // console.log(work_order.raw[0].work_order_id);

            const paramsWorkOrderDetail = {
              work_order_id: workOrder.raw[0].work_order_id,
              pickup_request_id: pickupRequestId,
              work_order_status_id_last: '7050',
              work_order_status_id_pick: null,
              awb_item_id: awbItemId,
              user_id: '1',
              created_time: timeNow,
              updated_time: timeNow,
            };

            const dataWorkOrderDetail = await this.getDataWorkOrderDetail(
              paramsWorkOrderDetail,
            );
            const work_order_detail = await WorkOrderDetail.insert(
              dataWorkOrderDetail,
            );

            console.log(work_order_detail);

            const paramsWorkOrderHistory = {
              work_order_id: workOrder.raw[0].work_order_id,
              work_order_date: workOrder.raw[0].work_order_date,
              pickup_request_id: pickupRequestId,
              work_order_status_id_last: '7050',
              work_order_status_id_pick: null,
              branch_id: '1481',
              branch_partner_id: paramBranchPartnerId,
              partner_id: paramPartnerId,
              is_final: true,
              user_id: '1',
              created_time: timeNow,
              updated_time: timeNow,
            };

            const dataWorkOrderHistory = await this.getDataWorkOrderHistory(
              paramsWorkOrderHistory,
            );
            const work_order_history = await WorkOrderHistory.insert(
              dataWorkOrderHistory,
            );

            await PickupRequestDetail.update(pickupRequestDetailId, {
              workOrderIdLast: workOrder.raw[0].work_order_id,
              userIdUpdated: 1,
              updatedTime: timeNow,
            });

            result = {
              code: '200',
              message: 'Success',
              awb: paramAwb,
            };
            const paramsAwbPartnerLog = {
              partner_id: paramPartnerId,
              awb_number: refAwbNumber,
              request_data: payload.body,
              response_code: 200,
              response_data: result,
              user_id: '1',
              created_time: timeNow,
              updated_time: timeNow,
            };
            const dataParamsAwbPartnerLog = await this.getDataAwbPartnerLog(
              paramsAwbPartnerLog,
            );
            const awb_partner_log = await AwbPartnerLog.insert(
              dataParamsAwbPartnerLog,
            );
            return result;
          } else {
            await WorkOrder.update(workOrderIdLast, {
              workOrderStatusIdLast: 7050,
              workOrderStatusIdPick: null,
              branchPartnerId: paramBranchPartnerId,
              partnerIdAssigned: parseInt(paramPartnerId, 10),
              userIdUpdated: 1,
              updatedTime: timeNow,
            });

            await WorkOrderDetail.update(
              { workOrderId: workOrderIdLast },
              {
                workOrderStatusIdLast: 7050,
                workOrderStatusIdPick: null,
                userIdUpdated: 1,
                updatedTime: timeNow,
              },
            );
            // console.log(workOrderIdLast);
            const workOrder = await WorkOrder.findOne({
              workOrderId: workOrderIdLast,
            });
            // console.log('anjing');
            // console.log(workOrder);
            if (workOrder == undefined) {
              // const paramsWorkOrderHistory = {
              //   work_order_id: workOrderIdLast,
              //   work_order_date: timeNow,
              //   pickup_request_id: pickupRequestId,
              //   work_order_status_id_last: '7050',
              //   work_order_status_id_pick: null,
              //   branch_id: '1481',
              //   is_final: true,
              //   user_id: '1',
              //   created_time: timeNow,
              //   updated_time: timeNow,
              // };
              // const dataWorkOrderHistory = await this.getDataWorkOrderHistory(
              //   paramsWorkOrderHistory,
              // );
              // const work_order_history = await WorkOrderHistory.insert(
              //   dataWorkOrderHistory,
              // );
              // await WorkOrder.update(workOrderIdLast, {
              //   workOrderHistoryIdLast:
              //     work_order_history.raw[0].work_order_history_id,
              //   userIdUpdated: 1,
              //   updatedTime: timeNow,
              // });
            } else {
              const paramsWorkOrderHistory = {
                work_order_id: workOrder.workOrderId,
                work_order_date: workOrder.workOrderDate,
                pickup_request_id: pickupRequestId,
                work_order_status_id_last: '7050',
                work_order_status_id_pick: null,
                branch_id: '1481',
                branch_partner_id: paramBranchPartnerId,
                partner_id: paramPartnerId,
                is_final: true,
                user_id: '1',
                created_time: timeNow,
                updated_time: timeNow,
              };
              const dataWorkOrderHistory = await this.getDataWorkOrderHistory(
                paramsWorkOrderHistory,
              );
              const work_order_history = await WorkOrderHistory.insert(
                dataWorkOrderHistory,
              );
              await WorkOrder.update(workOrderIdLast, {
                workOrderHistoryIdLast:
                  work_order_history.raw[0].work_order_history_id,
                userIdUpdated: 1,
                updatedTime: timeNow,
              });
            }

            result = {
              code: '200',
              message: 'Success',
              awb: paramAwb,
            };
            const paramsAwbPartnerLog = {
              partner_id: paramPartnerId,
              awb_number: refAwbNumber,
              request_data: payload.body,
              response_code: 200,
              response_data: result,
              user_id: '1',
              created_time: timeNow,
              updated_time: timeNow,
            };
            const dataParamsAwbPartnerLog = await this.getDataAwbPartnerLog(
              paramsAwbPartnerLog,
            );
            const awb_partner_log = await AwbPartnerLog.insert(
              dataParamsAwbPartnerLog,
            );
            return result;
          }
        }
      }
    } else {
      result = {
        code: '422',
        message: 'Invalid AWB Number',
      };
      const paramsAwbPartnerLog = {
        partner_id: paramPartnerId,
        awb_number: refAwbNumber,
        request_data: payload.body,
        response_code: 422,
        response_data: 'Invalid AWB Number',
        user_id: '1',
        created_time: timeNow,
        updated_time: timeNow,
      };
      const dataParamsAwbPartnerLog = await this.getDataAwbPartnerLog(
        paramsAwbPartnerLog,
      );
      const awb_partner_log = await AwbPartnerLog.insert(
        dataParamsAwbPartnerLog,
      );
      return result;
    }

    return result;
  }

  private static async getAwbWorkOrderId(awb: string): Promise<any> {
    // const backDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');

    const query = `
      SELECT
        prd.ref_awb_number,
        prd.work_order_id_last,
        prd.pickup_request_id,
        prd.pickup_request_detail_id,
        wo.work_order_status_id_last,
        prd.awb_item_id,
        pr.pickup_request_address,
				pr.encrypt_address255,
				pr.encrypt_merchant_name,
        pr.pickup_request_name,
        pr.pickup_schedule_date_time,
        pr.pickup_request_contact_no,
        pr.pickup_request_email,
        pr.pickup_request_notes,
        wo.work_order_status_id_pick
      FROM pickup_request_detail prd
      INNER JOIN pickup_request pr on prd.pickup_request_id = pr.pickup_request_id AND pr.is_deleted=FALSE
      LEFT JOIN work_order wo on prd.work_order_id_last = wo.work_order_id AND wo.is_deleted=FALSE
      WHERE
        prd.ref_awb_number = :awb AND
        prd.is_deleted = FALSE
    `;

    return await RawQueryService.queryWithParams(query, {
      awb,
    });
  }

  private static async getBranchPartnerId(
    branchPartnerCode: string,
  ): Promise<any> {
    // const backDate = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');

    const query = `
      SELECT
        branch_partner_id,
        branch_partner_code,
        branch_partner_name
      FROM branch_partner prd
      WHERE
        branch_partner_code = :branchPartnerCode AND
        is_deleted = FALSE
    `;

    return await RawQueryService.queryWithParams(query, {
      branchPartnerCode,
    });
  }

  public static async getDataWorkOrderCode(workOrderTime: any): Promise<any> {
    let workOrderCode = '';
    let prefix = '';
    let lastNumber = 0;
    const timeNow = moment().toDate();
    // $prefix = $prefix = 'SPK' .; '/' . date('ym', strtotime($work_order_time)) .; '/';
    prefix = `SPK/${moment(workOrderTime).format('YYMM')}/`;
    // console.log(prefix);
    const code = await SysCounter.findOne({
      where: {
        key: prefix,
        isDeleted: false,
      },
    });
    // console.log(code);
    if (code == undefined) {
      lastNumber = 1;
      const paramsSysCounter = {
        key: prefix,
        counter: lastNumber,
        created_time: timeNow,
        updated_time: timeNow,
      };
      const dataParamsSysCounter = await this.getDataSysCounter(
        paramsSysCounter,
      );
      const sys_counter = await SysCounter.insert(dataParamsSysCounter);
    } else {
      lastNumber = Math.floor(code.counter) + 1;
      await SysCounter.update(code.sysCounterId, {
        counter: lastNumber,
        updatedTime: timeNow,
      });
    }

    workOrderCode = prefix + lastNumber.toString().padStart(5, '0');
    // console.log(workOrderCode);
    return workOrderCode;
    // wo;
  }

  public static async getDataWorkOrder(params: {}): Promise<any> {
    // const timeNow = moment().toDate();
    const wo = await WorkOrder.create({
      workOrderCode: params['work_order_code'],
      workOrderDate: params['work_order_date'],
      pickupScheduleDateTime: params['pickup_schedule_date_time'],
      workOrderStatusIdLast: params['work_order_status_id_last'],
      workOrderStatusIdPick: params['work_order_status_id_pick'],
      branchIdAssigned: params['branch_id_assigned'],
      userId: params['user_id'],
      branchId: params['branch_id'],
      isMember: params['is_member'],
      workOrderType: params['work_order_type'],
      branchPartnerId: params['branch_partner_id'],
      partnerIdAssigned: params['partner_id_assigned'],
      pickupAddress: params['pickup_address'],
      encryptAddress255: params['encrypt_address255'],
      merchantName: params['merchant_name'],
      encryptMerchantName: params['encrypt_merchant_name'],
      pickupPhone: params['pickup_phone'],
      pickupEmail: params['pickup_email'],
      pickupNotes: params['pickup_notes'],
      totalAwbQty: params['total_awb_qty'],
      userIdCreated: params['user_id'],
      createdTime: params['created_time'],
      userIdUpdated: params['user_id'],
      updatedTime: params['updated_time'],
    });

    return wo;
  }

  public static async getDataWorkOrderDetail(params: {}): Promise<any> {
    // const timeNow = moment().toDate();
    const wod = await WorkOrderDetail.create({
      workOrderId: params['work_order_id'],
      pickupRequestId: params['pickup_request_id'],
      workOrderStatusIdLast: params['work_order_status_id_last'],
      workOrderStatusIdPick: params['work_order_status_id_pick'],
      awbItemId: params['awb_item_id'],
      userIdCreated: params['user_id'],
      createdTime: params['created_time'],
      userIdUpdated: params['user_id'],
      updatedTime: params['updated_time'],
    });

    return wod;
  }

  public static async getDataWorkOrderHistory(params: {}): Promise<any> {
    // const timeNow = moment().toDate();
    const woh = await WorkOrderHistory.create({
      workOrderId: params['work_order_id'],
      workOrderStatusId: params['work_order_status_id_last'],
      userId: params['user_id'],
      branchId: params['branch_id'],
      branchPartnerId: params['branch_partner_id'],
      partnerId: params['partner_id'],
      isFinal: params['is_final'],
      historyDateTime: params['updated_time'],
      userIdCreated: params['user_id'],
      createdTime: params['created_time'],
      userIdUpdated: params['user_id'],
      updatedTime: params['updated_time'],
    });

    return woh;
  }

  public static async getDataAwbPartnerLog(params: {}): Promise<any> {
    // const timeNow = moment().toDate();
    // test
    const apl = await AwbPartnerLog.create({
      partnerId: params['partner_id'],
      awbNumber: params['awb_number'],
      requestData: params['request_data'],
      responseCode: params['response_code'],
      responseData: params['response_data'],
      userIdCreated: params['user_id'],
      createdTime: params['created_time'],
      userIdUpdated: params['user_id'],
      updatedTime: params['updated_time'],
    });

    return apl;
  }

  public static async getDataSysCounter(params: {}): Promise<any> {
    const syscount = await SysCounter.create({
      key: params['key'],
      counter: params['counter'],
      createdTime: params['created_time'],
      updatedTime: params['updated_time'],
    });

    return syscount;
  }
}
