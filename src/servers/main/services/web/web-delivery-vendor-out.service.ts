import { AwbService } from '../v1/awb.service';
import { WebDeliveryVendorOutPayload, WebDeliveryVendorOutSendPayload } from '../../models/web-delivery-vendor-out-payload.vm';
import { WebDeliveryVendorOutResponseVm, WebDeliveryVendorOutResponse } from '../../models/web-delivery-vendor-out-response.vm';
import moment = require('moment');
import { AuthService } from '../../../../shared/services/auth.service';
import { AwbStatusService } from '../master/awb-status.service';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { PartnerLogistic } from '../../../../shared/orm-entity/partner-logistic';
import { RedisService } from '../../../../shared/services/redis.service';
import { AwbDeliveryVendorQueueService } from '../../../queue/services/awb-delivery-vendor-queue.service';
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import e = require('express');
import { PrinterService } from '../../../../shared/services/printer.service';
import { VendorLogisticService } from '../../../../shared/services/vendor.logistic.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { RequestErrorService } from '../../../../shared/services/request-error.service';

export class WebDeliveryVendorOutService {
  static async validateAWB(payload: WebDeliveryVendorOutPayload): Promise<WebDeliveryVendorOutResponseVm> {
    const result = new WebDeliveryVendorOutResponseVm();
    const dataItem = [];
    for (const awbNumber of payload.scanValue) {
      const awb = await AwbService.validAwbNumber(awbNumber);
      const response = new WebDeliveryVendorOutResponse();
      if (awb) {
        const checkValidAwbStatusIdLast = await AwbStatusService.checkValidAwbStatusIdLast(awb, false, false);
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
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthData();
    const dataItem = [];
    for (const awbNumber of payload.scanValue) {
      const response = new WebDeliveryVendorOutResponse();
      const awb = await AwbItemAttr.findOne({
        select: ['awbNumber', 'awbItemId'],
        where: {
          awbNumber: awbNumber,
          isDeleted: false,
        }
      });

      const vendor = await PartnerLogistic.findOne({
        select: ['partnerLogisticId', 'partnerLogisticName'],
        where: {
          partnerLogisticId: payload.vendor_id,
          isDeleted: false,
        }
      });

      if (awb && vendor) {
        const holdRedis = await RedisService.lockingWithExpire(
          `hold:scanoutvendor:${awb.awbItemId}`,
          'locking',
          60,
        );

        if (holdRedis) {
          try {
            AwbDeliveryVendorQueueService.createJobSendVendor(
              awb.awbItemId,
              AWB_STATUS.OUT_BRANCH,
              permissonPayload.branchId,
              authMeta.userId,
              vendor.partnerLogisticName,
              payload.vendor_id,
              payload.order_vendor_code,
            )
            response.status = 'ok';
            response.message = `Resi ${awbNumber} berhasil di proses.`;
            RedisService.del(`hold:scanoutvendor:${awb.awbItemId}`);
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

    result.data = dataItem;
    return result;
  }

  static async printVendor(res: e.Response, vendorCode: string) {
    const authMeta = AuthService.getAuthMetadata();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const currentBranch = await RepositoryService.branch
      .loadById(permissonPayload.branchId)
      .select({
        branchName: true,
    });

    if (!currentBranch) {
      RequestErrorService.throwObj({
        message: 'Gerai asal tidak ditemukan',
      });
    }

    const currentUser = await RepositoryService.user
      .loadById(authMeta.userId)
      .select({
        userId: true, 
        employee: {
          nickname: true,
        },
    });

    if (!currentUser) {
      RequestErrorService.throwObj({
        message: 'User tidak ditemukan',
      });
    }

    let data = await VendorLogisticService.getDataSuratJalan(vendorCode);
    let dataPrint = {
      data : {
        vendorCode : vendorCode,
        userDriver : {
          nameDriver : data.data.vendor_name,
          vehicleNumber: '-'
        }
      }
    }

    let awb = [];
    let totalItem = 0;
    let totalCod = 0;
    for(let datax of data.data.details){
      totalItem++;
      totalCod = totalCod + datax.cod_value;
      awb.push({
        awbNumber : datax.awb_no,
        consigneeName : datax.receiver_name,
        isCod : datax.cod_value > 0 ? true : false,
        totalCodValue : datax.cod_value,
        alamat : datax.receiver_address
      })
    }
    //remapping
    let dataMeta ={
      meta :{
        currentBranchName : currentBranch.branchName,
        date : '12',
        time : '12',
        currentUserName : currentUser.employee.nickname,
        totalItems : totalItem,
        totalCod : totalCod
      }
    }

    const jsreportParams = {
      dataPrint,
      dataMeta,
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
    const pickupData = await this.getPickupData(payload.user_id);
    for (const awbNumber of payload.awbNumber) {
      const dataAwb = await this.getRawAwb(awbNumber);
      const response = new ScanOutPropertyAwbResponse();
      if (dataAwb) {
        // mapping data
        response.awbNumber = dataAwb.awbnumber;
        response.status = "ok";
        response.message = "Resi " + dataAwb.awbnumber + " berhasil mendapatkan datanya";
        response.reference_no = dataAwb.reference_no;
        response.pickup_name = pickupData.pickup_name;
        response.pickup_address = pickupData.pickup_adress;
        response.pickup_phone = pickupData.pickup_phone;
        response.pickup_email = pickupData.pickup_email;
        response.pickup_postal_code = parseInt(pickupData.pickup_postal_code);
        response.pickup_contact = pickupData.pickup_contact;
        response.pickup_latitude = pickupData.pickup_latitude;
        response.pickup_longitude = pickupData.pickup_longitude;
        response.pickup_district_id = parseInt(pickupData.pickup_district_id);
        response.pickup_district_code = pickupData.pickup_district_code;
        response.service_type_code = dataAwb.service_type_code;
        response.quantity = parseInt(dataAwb.quantity);
        response.total_item = parseInt(dataAwb.total_item);
        response.weight = parseInt(dataAwb.weight);
        response.volumetric = dataAwb.volumetric;
        response.description_item = dataAwb.description_item;
        response.item_value = parseInt(dataAwb.item_value);
        response.insurance_flag = parseInt(dataAwb.insurance_flag);
        response.insurance_type_code = dataAwb.insurance_type_code;
        response.insurance_value = parseInt(dataAwb.insurance_value);
        response.cod_flag = parseInt(dataAwb.cod_flag);
        response.cod_value = parseInt(dataAwb.cod_value);
        response.shipper_name = dataAwb.shipper_name;
        response.shipper_phone = dataAwb.shipper_phone;
        response.shipper_email = dataAwb.shipper_email;
        response.shipper_contact = dataAwb.shipper_contact;
        response.destination_district_code = dataAwb.destination_district_code;
        response.destination_district_id = parseInt(dataAwb.destination_district_id);
        response.receiver_name = dataAwb.receiver_name;
        response.receiver_address = dataAwb.receiver_address;
        response.receiver_phone = dataAwb.receiver_phone;
        response.receiver_postal_code = parseInt(dataAwb.receiver_postal_code);
        response.receiver_contact = dataAwb.receiver_contact;
        response.special_instruction = dataAwb.special_instruction;
        response.return_district_code = dataAwb.return_district_code;
        response.return_phone = dataAwb.return_phone;
        response.return_contact = dataAwb.return_contact;
        response.return_address = dataAwb.return_address;
      }
      dataItem.push(response);
    }
    result.data = dataItem
    return result;
  }

  // private method
  private static async getRawAwb(awbNumber: string): Promise<any> {
    const query = `
    select
        a.awb_number as awbNumber,
        a.awb_number as reference_no,
        ai.item_qty as quantity,
        a.total_item as total_item,
        a.total_weight_real_rounded as weight,
        concat(ai.length,'x',ai.width,'x', ai.height) as volumetric,
        ai.item_description as description_item,
        prd.parcel_value as item_value,
        case when prd.insurance_value = 0 then 1 else 2 end as insurance_flag,
        case when prd.insurance_value != 0 then 'INS01' else null end as insurance_type_code,
        prd.insurance_value as insurance_value, --kasih kondisi kalau 0 = 1
        case when a.is_cod = true then 1 else 2 end as cod_flag,
        ai.cod_value as cod_value,
        a.consignee_name as receiver_name,
        a.consignee_address as receiver_address,
        a.consignee_phone as receiver_phone,
        a.consignee_zip as receiver_postal_code,
        a.consignee_name as receiver_contact,
        a.claim_special_case as special_instruction,
        ca.customer_account_name as shipper_name,
        ca.phone1 as shipper_phone,
        ca.email1 as shipper_email,
        ca.mobile1 as shipper_contact,
        dt.district_code as destination_district_code,
        dt.district_id as destination_district_id
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
      WHERE a.awb_number = :awbNumber
      AND a.is_deleted = false
      LIMIT 1;
    `;

    const rawData = await RawQueryService.queryWithParams(query, {
      awbNumber,
    });
    return rawData ? rawData[0] : null;
  }

  private static async getPickupData(userID: number): Promise<any> {
    const query = `
    SELECT e.fullname as pickup_name,
      c.address as pickup_adress,
      e.phone1 as pickup_phone,
      a.email as pickup_email,
      e.zip_code_id_card as pickup_postal_code,
      e.fullname as pickup_contact,
      c.latitude as pickup_latitude,
      c.longitude as pickup_longitude,
      d.district_code as pickup_district_code,
      d.district_id as pickup_district_id,
      d.district_code as return_district_code,
      e.phone1 as return_phone,
      e.fullname as return_contact,
      c.address as return_address
    FROM users a
      JOIN user_role b on a.user_id = b.user_id
      JOIN branch c on b.branch_id = c.branch_id
      JOIN district d on c.district_id = d.district_id
      JOIN employee e on a.employee_id = e.employee_id
    WHERE a.user_id = :userID
    ;`;

    const rawData = await RawQueryService.queryWithParams(query, {
      userID,
    });
    return rawData ? rawData[0] : null;
  }

}