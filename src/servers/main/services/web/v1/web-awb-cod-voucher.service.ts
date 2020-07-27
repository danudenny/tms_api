// #region import
import { createQueryBuilder, getManager, Not } from 'typeorm';

import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { CodBankStatement } from '../../../../../shared/orm-entity/cod-bank-statement';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { CodVoucher } from '../../../../../shared/orm-entity/cod-voucher';
import { CodVoucherDetail } from '../../../../../shared/orm-entity/cod-voucher-detail';
import {
    WebCodVoucherPayloadVm
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebCodVoucherSuccessResponseVm
} from '../../../models/cod/web-awb-cod-response.vm';

import moment = require('moment');

// #endregion
export class V1WebAwbCodVoucherService {

  static async getAllVouchers() : Promise<any> {
    const data = [];
    const dataVouchers = await CodVoucher.find();
    for (const voucher of dataVouchers) {
      const dataVoucherDetail = await CodVoucherDetail.find({
        where: {
          codVoucherId: voucher.codVoucherId
        }
      });

      data.push({
        ...voucher,
        voucherDetail: dataVoucherDetail
      }) 
    }

    return {
      data
    }
  }

  static async divaSettlement(
    payload: WebCodVoucherPayloadVm,
  ): Promise<WebCodVoucherSuccessResponseVm> {
    let dataError = [];
    let responseCode = '00';
    let responseMessage = 'Success';
    const timeNow = moment().toDate();
    
    let amountTransfer = 0;
    let codVoucherNo = '';
    let codVoucherDate = timeNow.toISOString();
    let awbNumbers = [];
    let countDuplicatedAwbNumbers = 0;

    amountTransfer = payload.amountTransfer;
    codVoucherNo = payload.codVoucherNo;
    codVoucherDate = payload.codVoucherDate;
    awbNumbers = payload.awbNumbers;

    if (!amountTransfer) {
      responseCode = "01";
      responseMessage = 'FAILED';
      dataError.push('amountTransfer is required and have to be positive non-zero number');
    }

    if (!codVoucherNo) {
      responseCode = "01";
      responseMessage = 'FAILED';
      dataError.push('codVoucherNo is required');
    }

    if (!codVoucherDate) {
      responseCode = "01";
      responseMessage = 'FAILED';
      dataError.push('codVoucherDate is required');
    }
    
    if (awbNumbers && !Array.isArray(awbNumbers)) {
      responseCode = "01";
      responseMessage = 'FAILED';
      dataError.push('awbNumbers have to be an array.');
    }
    
    if (awbNumbers && Array.isArray(awbNumbers) && awbNumbers.length < 1) {
      responseCode = "01";
      responseMessage = 'FAILED';
      dataError.push('awbNumbers is required and not empty array.');
    }

    let codVoucherId = '';
    const voucher = await CodVoucher.findOne({
      where: {
        codVoucherNo: codVoucherNo,
        isDeleted: false,
      },
    });

    if (!voucher) {
      const paramsVoucher = {
        cod_voucher_no: codVoucherNo,
        cod_voucher_date: codVoucherDate,
        cod_voucher_service: 'DIVA',
        amount_transfer: amountTransfer,
        created_time: timeNow,
        updated_time: timeNow
      };

      const dataVoucher = await this.getDataVoucher(paramsVoucher);
      const voucher_log = await CodVoucher.insert(dataVoucher);

      if (voucher_log && voucher_log.identifiers.length > 0) {
        codVoucherId = voucher_log.identifiers[0].codVoucherId;
      } else {
        responseCode = '01';
        responseMessage = 'FAILED';
        let errorMessage = 'Failed when insert voucher to DB';
        dataError.push(errorMessage);
        console.log(errorMessage);
      }
    } else {
      codVoucherId = voucher.codVoucherId;
    }

    if (codVoucherId !== '') {
      await this.createVoucherDetailbyVoucherId(codVoucherId, awbNumbers, timeNow, (errorMessage, isDuplicated) => {
        dataError.push(errorMessage);
        if (isDuplicated) countDuplicatedAwbNumbers++;
        console.log(errorMessage);
      })
    }

    if (countDuplicatedAwbNumbers === awbNumbers.length) {
      responseCode = '01';
      responseMessage = 'FAILED';
    }

    const result = new WebCodVoucherSuccessResponseVm();
    result.responseCode = responseCode;
    result.responseMessage = responseMessage;
    result.dataError = dataError;
    return result;
  }

  private static async createVoucherDetailbyVoucherId(
    codVoucherId:string, awbNumbers:any[], timeNow:Date, cbError:any
  ): Promise<any> {
    for (const awbNumber of awbNumbers) {
      const awbValid = await this.isValidStatusAwb(awbNumber);
      if (awbValid) {
        const awbDuplicated = await this.isAwbDuplicatedInVoucher(awbNumber);
        if (!awbDuplicated) {
          let isSettlement = false;
          const transactionExist = await this.isTransactionExistByAwbNumber(awbNumber);
          if (transactionExist) {
            isSettlement = true;
            // TODO: CREATE BANK STATEMENT IF TRANSACTION IS EXISTS
          }

          const paramsVoucherDetail = {
            cod_voucher_id: codVoucherId,
            awb_number: awbNumber,
            is_settlement: isSettlement,
            created_time: timeNow,
            updated_time: timeNow
          };
  
          const dataVoucherDetail = await this.getDataVoucherDetail(paramsVoucherDetail);
          await CodVoucherDetail.insert(dataVoucherDetail);
        } else {
          cbError(`Awb number for ${awbNumber} is duplicated.`, true);
        }
      } else {
        cbError(`Awb number for ${awbNumber} is does not exist.`, false);
      }
    }
  }

  private static async isAwbDuplicatedInVoucher(awbNumber: number): Promise<boolean> {
    // check awb status mush valid dlv
    const awbDuplicated = await CodVoucherDetail.findOne({
      select: ['awbNumber'],
      where: {
        awbNumber,
        isDeleted: false,
      },
    });
    if (awbDuplicated) {
      return true;
    } else {
      return false;
    }
  }

  private static async isValidStatusAwb(awbNumber: number): Promise<boolean> {
    // check awb status mush valid dlv
    const awbValid = await AwbItemAttr.findOne({
      select: ['awbNumber'],
      where: {
        awbNumber,
        isDeleted: false,
      },
    });
    if (awbValid) {
      return true;
    } else {
      return false;
    }
  }

  private static async isTransactionExistByAwbNumber(awbNumber: number): Promise<boolean> {
    // check awb status mush valid dlv
    const transactionExist = await CodTransactionDetail.findOne({
      select: ['awbNumber'],
      where: {
        awbNumber,
        isDeleted: false,
      },
    });
    if (transactionExist) {
      return true;
    } else {
      return false;
    }
  }

  public static async getDataVoucher(params: {}): Promise<CodVoucher> {
    const voucher = await CodVoucher.create({
      codVoucherNo: params['cod_voucher_no'],
      codVoucherDate: params['cod_voucher_date'],
      codVoucherService: params['cod_voucher_service'],
      amountTransfer: params['amount_transfer'],
      createdTime: params['created_time'],
      updatedTime: params['updated_time']
    });

    return voucher;
  }

  public static async getDataVoucherDetail(params: {}): Promise<CodVoucherDetail> {
    const voucherDetail = await CodVoucherDetail.create({
      codVoucherId: params['cod_voucher_id'],
      awbNumber: params['awb_number'],
      isSettlement: params['is_settlement'],
      createdTime: params['created_time'],
      updatedTime: params['updated_time']
    });

    return voucherDetail;
  }
}
