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
}