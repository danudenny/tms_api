import moment = require('moment');
import { HttpStatus } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckAwbPayloadVm, CheckAwbResponseVM } from '../../models/internal-sortir.vm';
import { BranchSortirLogQueueService } from '../../../queue/services/branch-sortir-log-queue.service';

export class InternalSortirService {

  static async checkAwb(
    payload: CheckAwbPayloadVm,
  ): Promise<CheckAwbResponseVM> {
    const partner = AuthService.getPartnerTokenPayload();
    return await this.checkAwbProcess(payload);
  }

  private static async checkAwbProcess(
    payload: CheckAwbPayloadVm,
    // partnerId: number,
    // dropPartnerType: string,
  ): Promise<any> {
    const result = new CheckAwbResponseVM();
    const data = [];
    let zip_code;
    let is_cod;
    let district_code;
    const branchSortirLogId = '';
    const ArrChute = [];

    const dateNow = moment().toDate();
    const rawQueryAwb = `
      SELECT
        consignee_zip,
        is_cod,
        awb_number
      FROM awb
      WHERE
        awb_number = '${escape(payload.tracking_number)}'
      ;
    `;
    const resultDataAwb = await RawQueryService.query(rawQueryAwb);
    if (resultDataAwb.length > 0 ) {
      for (let a = 0; a < resultDataAwb.length; a++) {
        zip_code = resultDataAwb[a].consignee_zip;
        is_cod = resultDataAwb[a].is_cod;
      }

      if ((is_cod) || (is_cod == true)) {
        is_cod = true;
      } else {
        is_cod = false;
      }

      if ((zip_code == null) || (zip_code.trim() == '')) {
        // Jika ZIPCODE tidak ada, Search By District
        const rawQueryStt = `
          SELECT
            ts.nostt,
            ts.tujuan
          FROM temp_stt ts
          WHERE
            ts.nostt = '${escape(payload.tracking_number)}'
          ;
        `;
        const resultDataStt = await RawQueryService.query(rawQueryStt);
        if (resultDataStt.length > 0 ) {
          for (let a = 0; a < resultDataStt.length; a++) {
            district_code = resultDataStt[a].tujuan;
          }
          const rawQuery = `
            SELECT bs.*
            FROM branch_sortir bs
            INNER JOIN branch b ON bs.branch_id_lastmile = b.branch_id AND b.is_deleted = FALSE
            INNER JOIN district d ON b.district_id = d.district_id AND d.is_deleted = FALSE
            WHERE
              bs.is_deleted = FALSE AND
              d.district_code = '${escape(district_code)}' AND
              bs.is_cod = ${escape(is_cod)} AND
              bs.branch_id = ${payload.sorting_branch_id}
            ;
          `;
          const resultData = await RawQueryService.query(rawQuery);
          if (resultData.length > 0 ) {
            result.message = 'Check Spk Success';

            for (let a = 0; a < resultData.length; a++) {
              ArrChute.push(resultData[a].no_chute);
              await this.upsertBranchSortirLog(
                result.message,
                dateNow,
                0,
                payload.sorting_branch_id,
                payload.tracking_number,
                resultData[a].no_chute,
                resultData[a].branch_id_lastmile,
                resultData[a].is_cod,
                1,
              );
            }
            data.push({
              state: 0,
              tracking_number: payload.tracking_number,
              chute_number: ArrChute,
              request_time: moment().format('DD/MM/YYYY, h:mm:ss a'),
            });
            result.statusCode = HttpStatus.OK;
            result.data = data;
            return result;
          } else {
            data.push({
              state: 1,
              tracking_number: payload.tracking_number,
            });
            result.statusCode = HttpStatus.BAD_REQUEST;
            result.message = `Can't Find Chute For AWB: ` + payload.tracking_number;
            result.data = data;

            await this.upsertBranchSortirLog(
              result.message,
              dateNow,
              1,
              payload.sorting_branch_id,
              payload.tracking_number,
              null,
              null,
              false,
              1,
            );
            return result;
          }
        } else {
          data.push({
            state: 1,
            tracking_number: payload.tracking_number,
          });
          result.statusCode = HttpStatus.BAD_REQUEST;
          result.message = `Zip Code not found`;
          result.data = data;

          await this.upsertBranchSortirLog(
            result.message,
            dateNow,
            1,
            payload.sorting_branch_id,
            payload.tracking_number,
            null,
            null,
            false,
            1,
          );
          return result;
        }
      }

      const rawQuerySubDistrict = `
        SELECT
          district_id,
          sub_district_id
        FROM sub_district
        WHERE
          zip_code = '${escape(zip_code)}' AND
          is_deleted = FALSE
        LIMIT 1
      `;
      const resultDataSubDistrict = await RawQueryService.query(rawQuerySubDistrict);
      if (resultDataSubDistrict.length > 0 ) {
        if (is_cod == true) {
          const rawQuery = `
            SELECT bs.*
            FROM branch_sortir bs
            WHERE
              bs.is_deleted = FALSE AND
              bs.is_cod = ${escape(is_cod)} AND
              bs.branch_id = ${payload.sorting_branch_id}
            ;
          `;
          const resultData = await RawQueryService.query(rawQuery);
          if (resultData.length > 0 ) {
            result.message = 'Check Spk Success';
            for (let a = 0; a < resultData.length; a++) {
              ArrChute.push(resultData[a].no_chute);

              await this.upsertBranchSortirLog(
                result.message,
                dateNow,
                0,
                payload.sorting_branch_id,
                payload.tracking_number,
                resultData[a].no_chute,
                resultData[a].branch_id_lastmile,
                resultData[a].is_cod,
                1,
              );
            }
            data.push({
              state: 0,
              tracking_number: payload.tracking_number,
              chute_number: ArrChute,
              request_time: moment().format('DD/MM/YYYY, h:mm:ss a'),
            });
            result.statusCode = HttpStatus.OK;
            result.data = data;
            return result;
          } else {
            data.push({
              state: 1,
              tracking_number: payload.tracking_number,
            });
            result.statusCode = HttpStatus.BAD_REQUEST;
            result.message = `Can't Find Chute COD For AWB: ` + payload.tracking_number;
            result.data = data;

            branchSortirLogId; await this.upsertBranchSortirLog(
              result.message,
              dateNow,
              1,
              payload.sorting_branch_id,
              payload.tracking_number,
              null,
              null,
              false,
              1,
            );
            return result;
          }
        } else {
          const rawQuery = `
            SELECT bs.*
            FROM branch_sortir bs
            INNER JOIN branch_sub_district d ON bs.branch_id_lastmile  = d.branch_id AND d.is_deleted = FALSE
            WHERE
              bs.is_deleted = FALSE AND
              d.sub_district_id = ${resultDataSubDistrict[0].sub_district_id} AND
              bs.is_cod = ${escape(is_cod)} AND
              bs.branch_id = ${payload.sorting_branch_id}
            ;
          `;
          const resultData = await RawQueryService.query(rawQuery);
          // console.log(rawQuery);
          if (resultData.length > 0 ) {
            result.message = 'Check Spk Success';

            for (let a = 0; a < resultData.length; a++) {
              ArrChute.push(resultData[a].no_chute);

              await this.upsertBranchSortirLog(
                result.message,
                dateNow,
                0,
                payload.sorting_branch_id,
                payload.tracking_number,
                resultData[a].no_chute,
                resultData[a].branch_id_lastmile,
                resultData[a].is_cod,
                1,
              );
            }
            data.push({
              state: 0,
              tracking_number: payload.tracking_number,
              chute_number: ArrChute,
              request_time: moment().format('DD/MM/YYYY, h:mm:ss a'),
            });
            result.statusCode = HttpStatus.OK;
            result.data = data;
            return result;

          } else {
            data.push({
              state: 1,
              tracking_number: payload.tracking_number,
            });
            result.statusCode = HttpStatus.BAD_REQUEST;
            result.message = `Can't Find Chute For AWB: ` + payload.tracking_number;
            result.data = data;

            await this.upsertBranchSortirLog(
              result.message,
              dateNow,
              1,
              payload.sorting_branch_id,
              payload.tracking_number,
              null,
              null,
              false,
              1,
            );
            return result;
          }
        }
      } else {
        data.push({
          state: 1,
          tracking_number: payload.tracking_number,
        });
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.message = `Can't Find District For: ` + payload.tracking_number;
        result.data = data;
        await this.upsertBranchSortirLog(
          result.message,
          dateNow,
          1,
          payload.sorting_branch_id,
          payload.tracking_number,
          null,
          null,
          false,
          1,
        );
        return result;
      }
    } else {
      data.push({
        state: 1,
        tracking_number: payload.tracking_number,
      });
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = `Can't Find AWB: ` + payload.tracking_number;
      result.data = data;

      await this.upsertBranchSortirLog(
        result.message,
        dateNow,
        1,
        payload.sorting_branch_id,
        payload.tracking_number,
        null,
        null,
        false,
        1,
      );
      return result;
    }

  }

  private static async upsertBranchSortirLog(
    message: string,
    scanDate: Date,
    state: 0|1,
    branchId: string | number,
    awbNumber: string | number,
    noChute: number | string,
    branchIdLastmile: number | string,
    isCod: boolean,
    userId: number = 1,
  ) {

    BranchSortirLogQueueService.perform(
      message,
      scanDate,
      state,
      branchId,
      awbNumber,
      noChute,
      branchIdLastmile,
      isCod,
      userId,
    );
  }
}
