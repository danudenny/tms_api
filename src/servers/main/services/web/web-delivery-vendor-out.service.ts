import { AwbService } from '../v1/awb.service';
import {
  WebDeliveryVendorOutPayload,
  WebDeliveryVendorOutSendPayload,
  ScanOutPropertyAwbPayloadVm,
  WebDeliveryTrackingVendorPayload
} from '../../models/web-delivery-vendor-out-payload.vm';
import {
  WebDeliveryVendorOutResponseVm,
  WebDeliveryVendorOutResponse,
  ScanOutPropertyAwbResponseVm,
  ScanOutPropertyAwbResponse,
  WebDeliveryTrackingVendorResponse,
  WebDeliveryTrackingVendorResponseVm
} from '../../models/web-delivery-vendor-out-response.vm';
import { PrintVendorOutPayloadQueryVm } from '../../models/print-vendor-out-payload.vm';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbStatusService } from '../master/awb-status.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { PartnerLogistic } from '../../../../shared/orm-entity/partner-logistic';
import { RedisService } from '../../../../shared/services/redis.service';
import { AwbDeliveryVendorQueueService } from '../../../queue/services/awb-delivery-vendor-queue.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import e = require('express');
import { PrinterService } from '../../../../shared/services/printer.service';
import { VendorLogisticService } from '../../../../shared/services/vendor.logistic.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { Branch } from '../../../../shared/orm-entity/branch';
import { User } from '../../../../shared/orm-entity/user';

export class WebDeliveryVendorOutService {
  static async validateAWB(payload: WebDeliveryVendorOutPayload): Promise<WebDeliveryVendorOutResponseVm> {
    const result = new WebDeliveryVendorOutResponseVm();
    const dataItem = [];
    for (const awbNumber of payload.scanValue) {
      const awb = await AwbService.validAwbNumber(awbNumber);
      const response = new WebDeliveryVendorOutResponse();
      if (awb) {
        const checkValidAwbStatusIdLast = await AwbStatusService.checkValidAwbStatusIdLast(awb, true, false);
        if (checkValidAwbStatusIdLast.isValid) {
          response.status = 'ok';
          response.message = `Resi ${awbNumber} Berhasil di Validasi`;
        } else {
          response.status = 'error';
          response.message = checkValidAwbStatusIdLast.message;
        }
      } else {
        response.status = 'error';
        response.message = `Resi ${awbNumber} Tidak di Temukan`;
      }

      response.awbNumber = awbNumber;
      dataItem.push(response);
    }

    result.data = dataItem
    return result;
  }

  static async scanVendor(payload: WebDeliveryVendorOutSendPayload): Promise<WebDeliveryVendorOutResponseVm> {
    const result = new WebDeliveryVendorOutResponseVm();
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const permissonPayloadToken = AuthService.getPermissionToken();
    const dataItem = [];
    let awbSendVendor = [];

    if(payload.branch_id <= 0){
      RequestErrorService.throwObj({
        message: 'Branch tidak ditemukan',
      });
    }

    const vendor = await PartnerLogistic.findOne({
      select: ['partnerLogisticId', 'partnerLogisticName'],
      where: {
        partnerLogisticId: payload.vendor_id,
        isDeleted: false,
      }
    });

    for (const awbNumber of payload.scanValue) {
      const response = new WebDeliveryVendorOutResponse();
      if (vendor) {
        const holdRedis = await RedisService.lockingWithExpire(
          `hold:scanoutvendor:${awbNumber}`,
          'locking',
          60,
        );

        if (holdRedis) {
          try {
            AwbDeliveryVendorQueueService.createJobSendVendor(
              awbNumber,
              AWB_STATUS.OUT_BRANCH,
              permissonPayload.branchId,
              authMeta.userId,
              vendor.partnerLogisticName,
              payload.vendor_id,
              payload.order_vendor_code,
              permissonPayloadToken,
              payload.notes
            )
            awbSendVendor.push(awbNumber)
            response.status = 'ok';
            response.message = `Resi ${awbNumber} berhasil di proses.`;
            RedisService.del(`hold:scanoutvendor:${awbNumber}`);
          } catch (err) {
            response.status = 'error';
            response.message = `Gangguan Server: ${err.message}`;
          }
        } else {
          response.status = 'error';
          response.message = `Server Busy: Resi ${awbNumber} sedang di proses.`;
        }
      } else {
        if (vendor) {
          response.status = 'error';
          response.message = `Resi ${awbNumber} tidak ditemukan.`;
        } else {
          response.status = 'error';
          response.message = `Vendor tidak ditemukan.`;
        }
      }
      response.awbNumber = awbNumber;
      dataItem.push(response);
    }
    
    try {
      const holdRedis = await RedisService.lockingWithExpire(
        `hold:scanoutvendor:${payload.order_vendor_code}`,
        'locking',
        60,
      );
      
      if(holdRedis){
        await VendorLogisticService.sendVendor(awbSendVendor, payload.vendor_id, payload.order_vendor_code, authMeta.userId, permissonPayloadToken, payload.notes);
        RedisService.del(`hold:scanoutvendor:${payload.order_vendor_code}`);
      }else{
        RequestErrorService.throwObj({
          message: `Server Busy: Surat jalan ${payload.order_vendor_code} sedang di proses.`,
        });
      }

      
    } catch (err) {
      RequestErrorService.throwObj({
        message: 'Gagal mengirimkan data ke vendor',
      });
    }

    result.data = dataItem;
    return result;
  }

  static async printVendor(res: e.Response, queryParams: PrintVendorOutPayloadQueryVm) {
    if(queryParams.orderVendorCode.includes("%20")){
      queryParams.orderVendorCode = queryParams.orderVendorCode.replace(/%20/g," ");
    }

    const currentBranch = await Branch.findOne({
      select: ['branchName'],
      where: {
        branchId: queryParams.branchId,
        isDeleted: false
      },
    });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const currentUser = await User.findOne({
      select: ['userId', 'firstName', 'username', 'lastName'],
      where: {
        userId: queryParams.userId,
      }
    })

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    let data = await VendorLogisticService.getDataSuratJalan(queryParams.orderVendorCode, queryParams.userId);
    // console.log(data.data)
    // let data = {
    //   "data": {
    //       "order_vendor_code": "SAP12345",
    //       "delivery_date": "2022-08-21T11:22:08Z",
    //       "vendor_id": "443614be-241d-11ed-9891-a15adc6ec386",
    //       "vendor_name": "SAP",
    //       "branch_name" : "ABC",
    //       "details": [
    //           {
    //               "awb_no": "100018551113",
    //               "order_status": "done",
    //               "message": "",
    //               "cod_value": 0,
    //               "pickup_name": "Head Office Juanda",
    //               "receiver_name": "Bambang",
    //               "receiver_address": "Sulses",
    //               "receiver_phone": "085214235212",
    //               "total_weight" : 10.5,
    //           },
    //           {
    //               "awb_no": "100018551114",
    //               "order_status": "failed",
    //               "message": "Ada kesalahan data",
    //               "cod_value": 150000,
    //               "pickup_name": "Head Office Juanda",
    //               "receiver_name": "Bambang",
    //               "receiver_address": "Sulses",
    //               "receiver_phone": "085214235212",
    //               "total_weight" : 10.6,
    //           }
    //       ],
    //       "paging": {
    //           "currentPage": 1,
    //           "nextPage": 0,
    //           "prevPage": 0,
    //           "totalPage": 1,
    //           "totalData": 2,
    //           "limit": 2
    //       }
    //   },
    //   "code": "200000",
    //   "statusCode": 200,
    //   "latency": "6.64 ms"
    // }

    let awb = [];
    let totalItem = 0;
    let totalCod = 0;
    let totalFinalWeight = 0;
    let branchName = '-';
    for (let datax of data.data.details) {
      totalItem++;
      totalCod = totalCod + datax.cod_value;
      totalFinalWeight = Number(totalFinalWeight) + Number(datax.weight);
      branchName = datax.branch_name;
      awb.push({
        awbNumber: datax.awb_no,
        consigneeName: datax.receiver_name,
        isCod: datax.cod_value > 0 ? true : false,
        totalCodValue: datax.cod_value,
        alamat: datax.receiver_address
      })
    }
    //remapping
    const currentDate = moment();
    const jsreportParams = {
      data: {
        vendorCode: queryParams.orderVendorCode,
        branchName: branchName,
        userDriver: {
          nameDriver: data.data.vendor_name,
          vehicleNumber: '-'
        },
        dataAWB: awb,
        totalFinalWeight : Math.round(totalFinalWeight * 100)/100
      },
      meta: {
        currentBranchName: currentBranch.branchName,
        date: currentDate.format('DD/MM/YY'),
        time: currentDate.format('HH:mm'),
        currentUserName: currentUser.firstName,
        totalItems: totalItem,
        totalCod: totalCod
      }
    };
    
    const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: 'surat-jalan-vendor',
          templateData: jsreportParams,
          printCopy: 1,
        },
      ],
      listPrinterName,
    });
  }

  static async awb(
    payload: ScanOutPropertyAwbPayloadVm,
  ): Promise<ScanOutPropertyAwbResponseVm> {
    const result = new ScanOutPropertyAwbResponseVm();
    const dataItem = [];
    const [pickupData, dataAwb] = await Promise.all([
      this.getPickupData(payload.user_id, payload.branch_id),
      this.getRawAwb(payload.awbNumber)
    ]);

    for (const dataAwbx of dataAwb) {
      const response = new ScanOutPropertyAwbResponse();
      if (dataAwbx) {
        // mapping data
        response.awbNumber = dataAwbx.awbnumber;
        response.status = "ok";
        response.message = "Resi " + dataAwbx.awbnumber + " berhasil mendapatkan datanya";
        response.reference_no = dataAwbx.reference_no;
        response.pickup_name = pickupData.pickup_name == null || pickupData.pickup_name == "" || pickupData.pickup_name === undefined ? '-' : pickupData.pickup_name;
        response.pickup_address = pickupData.pickup_address == null ||  pickupData.pickup_address == "" || pickupData.pickup_address === undefined ? '-' : pickupData.pickup_address; 
        response.pickup_phone = pickupData.pickup_phone == null || pickupData.pickup_phone == "" || pickupData.pickup_phone === undefined ? '-' : pickupData.pickup_phone;
        response.pickup_email = pickupData.pickup_email == null || pickupData.pickup_email == "" || pickupData.pickup_email === undefined ? '-' : pickupData.pickup_email;
        response.pickup_contact = pickupData.pickup_contact == null || pickupData.pickup_contact == "" || pickupData.pickup_contact === undefined ? '-' : pickupData.pickup_contact;
        response.pickup_latitude = pickupData.pickup_latitude;
        response.pickup_longitude = pickupData.pickup_longitude;
        response.pickup_district_id = parseInt(pickupData.pickup_district_id);
        response.pickup_district_code = pickupData.pickup_district_code == null || pickupData.pickup_district_code == "" || pickupData.pickup_district_code === undefined ? '-' : pickupData.pickup_district_code;
        response.origin_id = pickupData.origin_id == null || pickupData.origin_id == "" || pickupData.origin_id == undefined || pickupData.origin_id <= 0 ? 0 : parseInt(pickupData.origin_id);
        response.pickup_city = pickupData.pickup_city == null || pickupData.pickup_city == "" || pickupData.pickup_city == undefined ? '-' : pickupData.pickup_city;
        response.service_type_code = dataAwbx.service_type_code;
        response.quantity = parseInt(dataAwbx.quantity);
        response.total_item = parseInt(dataAwbx.total_item);
        response.weight = parseFloat(dataAwbx.weight);
        response.volumetric = "4x4x4";
        response.description_item = dataAwbx.description_item;
        response.item_value = parseInt(dataAwbx.item_value);
        response.insurance_flag = parseInt(dataAwbx.insurance_flag);
        response.insurance_type_code = dataAwbx.insurance_type_code;
        response.insurance_value = parseInt(dataAwbx.insurance_value);
        response.cod_flag = parseInt(dataAwbx.cod_flag);
        response.cod_value = parseInt(dataAwbx.cod_value);
        response.shipper_name = dataAwbx.shipper_name == null || dataAwbx.shipper_name == "" || dataAwbx.shipper_name === undefined ? '-' : dataAwbx.shipper_name;
        response.shipper_address = dataAwbx.shipper_address == null || dataAwbx.shipper_address === undefined || dataAwbx.shipper_address == "" ? '-' : dataAwbx.shipper_address;
        response.shipper_phone = dataAwbx.shipper_phone == null || dataAwbx.shipper_phone == "" || dataAwbx.shipper_phone === undefined ? '-' : dataAwbx.shipper_phone;
        response.shipper_email = dataAwbx.shipper_email == null || dataAwbx.shipper_email == "" || dataAwbx.shipper_email === undefined ? '-' : dataAwbx.shipper_email;
        response.shipper_contact = dataAwbx.shipper_contact == null || dataAwbx.shipper_contact == ""  || dataAwbx.shipper_contact === undefined ? '-' : dataAwbx.shipper_contact;
        response.destination_district_code = dataAwbx.destination_district_code;
        response.destination_district_id = parseInt(dataAwbx.destination_district_id);
        response.receiver_name = dataAwbx.receiver_name == null || dataAwbx.receiver_name === undefined || dataAwbx.receiver_name == "" ? '-' : dataAwbx.receiver_name;
        response.receiver_address = dataAwbx.receiver_address == null || dataAwbx.receiver_address === undefined || dataAwbx.receiver_address == "" ? '-' : dataAwbx.receiver_address;
        response.receiver_phone = dataAwbx.receiver_phone == null || dataAwbx.receiver_phone === undefined || dataAwbx.receiver_phone == "" ? '-' : dataAwbx.receiver_phone;
        response.receiver_postal_code = parseInt(dataAwbx.receiver_postal_code);
        response.receiver_contact = dataAwbx.receiver_contact == null || dataAwbx.receiver_phone === undefined || dataAwbx.receiver_phone == "" ? '-' : dataAwbx.receiver_phone;
        response.shipper_city = dataAwbx.shipper_city == null || dataAwbx.shipper_city === undefined || dataAwbx.shipper_city == "" ? '-' : dataAwbx.shipper_city;
        response.shipper_city = dataAwbx.shipper_city == null || dataAwbx.shipper_city === undefined || dataAwbx.shipper_city == "" ? '-' : dataAwbx.shipper_city;
        response.receiver_city = dataAwbx.receiver_city == null || dataAwbx.receiver_city === undefined || dataAwbx.receiver_city == "" ? '-' : dataAwbx.receiver_city;
        response.shipper_province = dataAwbx.shipper_province == null || dataAwbx.shipper_province === undefined || dataAwbx.shipper_province == "" ? '-' : dataAwbx.shipper_province;
        response.receiver_province = dataAwbx.receiver_province == null || dataAwbx.receiver_province === undefined || dataAwbx.receiver_province == "" ? '-' : dataAwbx.receiver_province;
        response.special_instruction = dataAwbx.special_instruction;
        response.return_district_code = dataAwbx.return_district_code;
        response.return_phone = dataAwbx.return_phone;
        response.return_contact = dataAwbx.return_contact;
        response.return_address = dataAwbx.return_address;
      }
      if (response.awbNumber != undefined) {
        dataItem.push(response);
      }
    }
    result.data = dataItem
    return result;
  }

  // private method
  private static async getRawAwb(awbNumber: string[]): Promise<any> {
    const query = `
    select
        a.awb_number as awbNumber,
        a.awb_number as reference_no,
        ai.item_qty as quantity,
        a.total_item as total_item,
        a.total_weight_real_rounded::numeric(10, 2) as weight,
        concat(ai.length,'x',ai.width,'x', ai.height) as volumetric,
        ai.item_description as description_item,
        prd.parcel_value as item_value,
        prd.insurance_value as insurance_flag,
        prd.insurance_value as insurance_value,
        a.is_cod as cod_flag,
        prd.cod_value as cod_value,
        a.consignee_name as receiver_name,
        a.consignee_address as receiver_address,
        a.consignee_phone as receiver_phone,
        a.consignee_zip as receiver_postal_code,
        a.consignee_name as receiver_contact,
        a.claim_special_case as special_instruction,
        ca.customer_account_name as shipper_name,
	      prd.shipper_address as shipper_address,
        ca.phone1 as shipper_phone,
        ca.email1 as shipper_email,
        ca.mobile1 as shipper_contact,
        dt.district_code as destination_district_code,
        dt.district_id as destination_district_id,
        prd.shipper_city as shipper_city,
        prd.recipient_city as receiver_city ,
        prd.recipient_province as receiver_province,
        prd.shipper_province as shipper_province
      FROM awb a
        INNER JOIN awb_item ai ON a.awb_id = ai.awb_id AND ai.is_deleted = false
        LEFT JOIN package_type pt ON pt.package_type_id = a.package_type_id
        LEFT JOIN customer_account ca ON ca.customer_account_id = a.customer_account_id
        LEFT JOIN branch b ON b.branch_id = a.branch_id
        LEFT JOIN pickup_request_detail prd ON ai.awb_item_id = prd.awb_item_id
        LEFT JOIN district df ON df.district_id = a.from_id AND a.from_type = 40
        LEFT JOIN district dt ON dt.district_id = a.to_id AND a.to_type = 40
        LEFT JOIN branch bt ON bt.branch_id = dt.branch_id_delivery
        LEFT JOIN representative r ON r.representative_id = bt.representative_id
        LEFT JOIN awb_status ast ON ast.awb_status_id = ai.awb_status_id_last
        LEFT JOIN branch bl on bl.branch_id = a.branch_id_last
        LEFT JOIN payment_method p ON p.payment_method_id = a.payment_method_id
        LEFT JOIN bag_item bi ON bi.bag_item_id = ai.bag_item_id_last AND bi.is_deleted = false
        LEFT JOIN bag ba ON ba.bag_id = bi.bag_id AND ba.is_deleted = false
        LEFT JOIN do_pod_deliver_detail dpd ON dpd.awb_id = a.awb_id
          AND dpd.awb_status_id_last <> 14000 AND dpd.is_deleted = false
        LEFT JOIN do_pod_return_detail dprd ON dprd.awb_id = a.awb_id
          AND dprd.awb_status_id_last in (25650, 25000) AND dprd.is_deleted = false
        LEFT JOIN awb_return ar ON ar.origin_awb_id = ai.awb_id AND ar.is_deleted = false
        LEFT JOIN awb_substitute asub ON asub.awb_number = a.awb_number
      WHERE a.awb_number = '${awbNumber[0]}'
      AND a.is_deleted = false;
    `;

    const rawData = await RawQueryService.query(query);
    return rawData;
  }

  private static async getPickupData(userID: number, branchID: number): Promise<any> {
    const query1 = `
    SELECT e.fullname as pickup_name, 
    e.phone1 as pickup_phone,
    a.email as pickup_email,
    e.fullname as pickup_contact,
    e.phone1 as return_phone,
    e.fullname as return_contact
    FROM users a 
    INNER JOIN employee e on a.employee_id = e.employee_id
    WHERE a.user_id = :userID;
    `

    const query2 = `
    SELECT 
    c.address as pickup_address,
    c.latitude as pickup_latitude,
    c.longitude as pickup_longitude,
    d.district_code as pickup_district_code,
    d.district_id as pickup_district_id,
    d.district_code as return_district_code,
    c.address as return_address,
    c.origin_id as origin_id,
    f.city_name as pickup_city
    FROM branch c 
    INNER JOIN district d on c.district_id = d.district_id
    INNER JOIN city f on d.city_id = f.city_id
    WHERE c.branch_id = :branchID;
    `

    const [rawDataUserPickup, rawDataBranchPickup] = await Promise.all([
      RawQueryService.queryWithParams(query1, {
        userID
      }),
      RawQueryService.queryWithParams(query2, {
        branchID
      })
    ]);

    const rawData = Object.assign(rawDataUserPickup.length > 0 ? rawDataUserPickup[0] : {}, rawDataBranchPickup.length > 0 ? rawDataBranchPickup[0] : {});
    return rawData ? rawData : null;
  }

  //webhook tracking
  static async insertTracking(payload: WebDeliveryTrackingVendorPayload): Promise<WebDeliveryTrackingVendorResponseVm> {
    const result = new WebDeliveryTrackingVendorResponseVm();
    const dataItem = [];
    for (const dataAWB of payload.scanValue) {
      const response = new WebDeliveryTrackingVendorResponse();
      const awb = await AwbItemAttr.findOne({
        select: ['awbNumber', 'awbItemId'],
        where: {
          awbNumber: dataAWB.awbNumber,
          isDeleted: false,
        }
      });

      if (awb) {
        const holdRedis = await RedisService.lockingWithExpire(
          `hold:scanoutvendor:${awb.awbItemId}`,
          'locking',
          60,
        );

        if (holdRedis) {
          try {
            AwbDeliveryVendorQueueService.createJobInserTracking(
              dataAWB.awbNumber,
              dataAWB.awbStatusId,
              dataAWB.noteInternal,
              dataAWB.notePublic,
              dataAWB.latitude,
              dataAWB.longitude,
              dataAWB.branchId,
              dataAWB.userId,
              dataAWB.urlPhoto,
              dataAWB.urlPhotoSignature,
              dataAWB.urlPhotoRetur,
              dataAWB.orderVendorCode,
              dataAWB.isCod,
              dataAWB.codValue
            )

            response.status = 'ok';
            response.message = `Resi ${dataAWB.awbNumber} berhasil di proses.`;
            RedisService.del(`hold:scanoutvendor:${awb.awbItemId}`);
          } catch (err) {
            response.status = 'error';
            response.message = `Gangguan Server: ${err.message}`;
          }
        } else {
          response.status = 'error';
          response.message = `Server Busy: Resi ${dataAWB.awbNumber} sedang di proses.`;
        }
      } else {
        response.status = 'error';
        response.message = `Vendor tidak ditemukan.`;
      }

      response.awbNumber = dataAWB.awbNumber;
      dataItem.push(response);
    }

    result.data = dataItem;
    return result;
  }
}