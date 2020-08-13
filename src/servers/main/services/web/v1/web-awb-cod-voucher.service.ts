// #region import
import { getManager } from 'typeorm';

import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { CodBankStatement } from '../../../../../shared/orm-entity/cod-bank-statement';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { CodVoucher } from '../../../../../shared/orm-entity/cod-voucher';
import { CodVoucherDetail } from '../../../../../shared/orm-entity/cod-voucher-detail';
import {
    WebCodVoucherPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebCodVoucherSuccessResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';

import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { error } from 'winston';
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';

// #endregion
export class V1WebAwbCodVoucherService {

  static async getAllVouchers(): Promise<any> {
    const data = [];
    const dataVouchers = await CodVoucher.find();
    for (const voucher of dataVouchers) {
      const dataVoucherDetail = await CodVoucherDetail.find({
        where: {
          codVoucherId: voucher.codVoucherId,
        },
      });

      data.push({
        ...voucher,
        voucherDetail: dataVoucherDetail,
      });
    }

    if (data.length) {
      const result = {};
      result['data'] = data;
      return result;
    } else {
      throw new BadRequestException('Data tidak ditemukan!');
    }
  }

  static async divaSettlement(
    payload: WebCodVoucherPayloadVm,
  ): Promise<WebCodVoucherSuccessResponseVm> {
    const dataError = [];
    let responseCode = '00';
    let responseMessage = 'Success';
    const timeNow = moment().toDate();

    let amountTransfer = 0;
    let codVoucherNo = '';
    let codVoucherDate = timeNow.toISOString();
    let codVoucherId = '';
    let awbNumbers = [];

    amountTransfer = payload.amountTransfer;
    codVoucherNo = payload.codVoucherNo;
    codVoucherDate = payload.codVoucherDate;
    awbNumbers = payload.awbNumbers;

    if (!amountTransfer) {
      responseCode = '01';
      responseMessage = 'FAILED';
      dataError.push('amountTransfer is required and have to be positive non-zero number');
    }

    if (!codVoucherNo) {
      responseCode = '01';
      responseMessage = 'FAILED';
      dataError.push('codVoucherNo is required');
    }

    if (!codVoucherDate) {
      responseCode = '01';
      responseMessage = 'FAILED';
      dataError.push('codVoucherDate is required');
    }

    if (awbNumbers && !Array.isArray(awbNumbers)) {
      responseCode = '01';
      responseMessage = 'FAILED';
      dataError.push('awbNumbers have to be an array.');
    }

    if (awbNumbers && Array.isArray(awbNumbers) && awbNumbers.length < 1) {
      responseCode = '01';
      responseMessage = 'FAILED';
      dataError.push('awbNumbers is required and not empty array.');
    }

    const isDataVerified = await this.verifyData(awbNumbers, (errorMessage: string) => {
      responseCode = '01';
      responseMessage = 'FAILED';
      dataError.push(errorMessage);
      console.log(errorMessage);
    });

    if (isDataVerified) {
      const voucher = await CodVoucher.findOne({
        where: {
          codVoucherNo,
          isDeleted: false,
        },
      });

      if (!voucher) {
        const paramsVoucher = {
          cod_voucher_no: codVoucherNo,
          cod_voucher_date: codVoucherDate,
          cod_voucher_service: 'DIVA',
          amount_transfer: amountTransfer,
          is_settlement: false,
          created_time: timeNow,
          updated_time: timeNow,
        };

        const dataVoucher = await this.getDataVoucher(paramsVoucher);
        const voucher_log = await CodVoucher.insert(dataVoucher);

        if (voucher_log && voucher_log.identifiers.length > 0) {
          codVoucherId = voucher_log.identifiers[0].codVoucherId;
        } else {
          responseCode = '01';
          responseMessage = 'FAILED';
          const errorMessage = 'Failed when insert voucher to DB';
          dataError.push(errorMessage);
          console.log(errorMessage);
        }
      } else {
        codVoucherId = voucher.codVoucherId;
      }

      if (codVoucherId) {
        for (const awbNumber of awbNumbers) {
          // Create voucher detail with unsettled status
          const paramsVoucherDetail = {
            cod_voucher_id: codVoucherId,
            awb_number: awbNumber,
            created_time: timeNow,
            updated_time: timeNow,
          };
          const dataVoucherDetail = await this.getDataVoucherDetail(paramsVoucherDetail);
          await CodVoucherDetail.insert(dataVoucherDetail);
        }
      }
    }

    const result = new WebCodVoucherSuccessResponseVm();
    result.responseCode = responseCode;
    result.responseMessage = responseMessage;
    result.dataError = dataError;
    return result;
  }

  private static async verifyData(awbNumbers: any[], cbError: any): Promise<boolean> {
    const errors = [];
    for (const awbNumber of awbNumbers) {
      const awbValid = await this.isAwbNumberValid(awbNumber);
      if (!awbValid) {
        errors.push(`Error for ${awbNumber}`);
        cbError(`Awb number for ${awbNumber} is not valid (must be 12 length)`);
      } else {
        const awbExist = await this.isAwbNumberExist(awbNumber);
        if (awbExist) {
          const awbDuplicated = await this.isAwbNumberDuplicated(awbNumber);
          if (awbDuplicated) {
            errors.push(`Error for ${awbNumber}`);
            cbError(`Awb number for ${awbNumber} is duplicated.`);
          }
        } else {
          errors.push(`Error for ${awbNumber}`);
          cbError(`Awb number for ${awbNumber} is does not exist.`);
        }
      }
    }

    if (errors.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  private static async isAwbNumberDuplicated(awbNumber: number): Promise<boolean> {
    // check awb is not duplicated
    const awbDuplicated = await CodVoucherDetail.findOne({
      select: ['awbNumber'],
      where: {
        awbNumber,
        isDeleted: false,
      },
    });

    return !!awbDuplicated;
  }

  private static async isAwbNumberExist(awbNumber: number): Promise<boolean> {
    // check awb status mush valid dlv
    const awbValid = await AwbItemAttr.findOne({
      select: ['awbNumber'],
      where: {
        awbNumber,
        isDeleted: false,
      },
    });

    return !!awbValid;
  }

  private static async isAwbNumberValid(awbNumber: string): Promise<boolean> {
    let check = 0;
    if (awbNumber.length !== 12) {
      check = 1;
    }

    if (check === 1) {
      return false;
    }

    return true;
  }

  public static async getDataVoucher(params: {}): Promise<CodVoucher> {
    const voucher = await CodVoucher.create({
      codVoucherNo: params['cod_voucher_no'],
      codVoucherDate: params['cod_voucher_date'],
      codVoucherService: params['cod_voucher_service'],
      amountTransfer: params['amount_transfer'],
      createdTime: params['created_time'],
      updatedTime: params['updated_time'],
    });

    return voucher;
  }

  public static async getDataVoucherDetail(params: {}): Promise<CodVoucherDetail> {
    const voucherDetail = await CodVoucherDetail.create({
      codVoucherId: params['cod_voucher_id'],
      awbNumber: params['awb_number'],
      createdTime: params['created_time'],
      updatedTime: params['updated_time'],
    });

    return voucherDetail;
  }
}
