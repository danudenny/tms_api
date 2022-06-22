import { HttpStatus, Injectable } from '@nestjs/common';
import { BranchSortirLogSummary } from '../../../../shared/orm-entity/branch-sortir-log-summary';
import { LogwayzimPayloadVm, LogwayzimResponseVm } from '../../models/log-wayzim.response.vm';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import moment = require('moment');
import { BranchSortir } from '../../../../shared/orm-entity/branch-sortir';
import { getManager } from 'typeorm';
import { BranchSortirLogDetail } from '../../../../shared/orm-entity/branch-sortir-log-detail';

@Injectable()
export class LogWayzimServices {
  static async insertBranchSortirSummary(
    payload: LogwayzimPayloadVm,
  ): Promise<LogwayzimResponseVm> {
    const generateErrorResult = (message: string): LogwayzimResponseVm => {
      const errResult = new LogwayzimResponseVm();
      errResult.statusCode = HttpStatus.BAD_REQUEST;
      errResult.message = message;
      PinoLoggerService.log(`ERROR LOG WAYZIM: ${message}`);
      return errResult;
    };

    try {

      if (!payload.branch_id) {
        return generateErrorResult('branch_id cannot null');
      }

      if (!payload.awb_number) {
        return generateErrorResult('awb_number cannot null');
      }
      const keyAwbCheck = ['noread', 'overcycle'];
      const awb = payload.awb_number.replace(/\s/g, '').toLowerCase();
      const checkExistData = await this.checkBranchSortirLogSummary(awb, payload.branch_id);
      const scanDate = moment(payload.scan_date).format('YYYY-MM-DD 00:00:00');
      const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
      const branchIdLastmile = payload.branch_id_lastmile;
      // if (payload.is_cod == true && !keyAwbCheck.includes(awb)) {
      //   // add branchId Last Miles
      //   const getBranchSortir = await this.getBranchSortir(payload.branch_id);
      //   console.log('getBranchSortir', getBranchSortir);
      //   if (getBranchSortir) {
      //     branchIdLastMile = getBranchSortir.branchIdLastmile;
      //   }
      // }

      const upsertPayload = {
        branchId: payload.branch_id,
        awbNumber: awb,
        isSucceed: payload.is_succeed,
        reason: payload.reason,
        sealNumber: payload.seal_number,
        chuteNumber: payload.chute_number,
        isCod: payload.is_cod,
        scanDate,
        createdTime: dateNow,
        updatedTime: dateNow,
        userIdCreated: 1,
        userIdUpdated: 1,
        branchIdLastmile,
      };

      if (checkExistData > 0 && !keyAwbCheck.includes(awb)) {
        delete upsertPayload.createdTime;
        // delete upsertPayload.branchIdLastMile;
        await BranchSortirLogSummary.update({ awbNumber: payload.awb_number }, upsertPayload);
      } else {
        await BranchSortirLogSummary.insert(upsertPayload);
      }
      if (!keyAwbCheck.includes(awb)) {
        const insertBranchSortirDetailObj = {
          scanDate,
          userIdCreated: 1,
          userIdUpdated: 1,
          branchId: payload.branch_id,
          awbNumber: awb,
          noChute: payload.chute_number,
          isCod: payload.is_cod,
          isSucceed: payload.is_succeed,
          reason: payload.reason,
          branchIdLastmile,
          createdTime: dateNow,
          updatedTime: dateNow,
        };
        // @ts-ignore
        await BranchSortirLogDetail.insert(insertBranchSortirDetailObj);
      }

      const result = new LogwayzimResponseVm();
      result.statusCode = HttpStatus.OK;
      result.message = `Success Insert AWB`;
      return result;
    } catch (e) {
      return generateErrorResult('internal server error');
    }
  }

  static async getBranchSortir(branchId: number) {
    return BranchSortir
      .getRepository()
      .createQueryBuilder('branchSortir')
      .select(['branchSortir.branchIdLastmile'])
      .where({
        branchId,
      })
      .getOne();
  }

  static async checkBranchSortirLogSummary(awbNumber: string, branchId: number) {
    return BranchSortirLogSummary
      .getRepository()
      .createQueryBuilder('branchSortirLog')
      .select([
        'branchSortirLog.branchSortirLogSummaryId',
      ])
      .where({
        awbNumber,
        branchId,
      })
      .getCount();
  }

}
