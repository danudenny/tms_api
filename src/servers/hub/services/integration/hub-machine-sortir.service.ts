import moment = require('moment');
import { HttpStatus } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckAwbPayloadVm, CheckAwbResponseVM } from '../../models/hub-machine-sortir.vm';
import { BranchSortirLogQueueService } from '../../../queue/services/branch-sortir-log-queue.service';
import { BranchSortirLogSummary } from '../../../../shared/orm-entity/branch-sortir-log-summary';

export class HubMachineSortirService {

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
    let district_id;
    let is_cod;
    let district_code;
    let branchSortirLogSummaryId;
    const ArrChute = [];
    let paramBranchIdLastmile;
    let paramChute;

    const dateNow = moment().toDate();
    const rawQueryAwb = `
      SELECT
        is_cod,
        awb_number,
        to_id
      FROM awb
      WHERE
        awb_number = '${escape(payload.tracking_number)}'
      ;
    `;
    const resultDataAwb = await RawQueryService.query(rawQueryAwb);
    if (resultDataAwb.length > 0 ) {
      for (let a = 0; a < resultDataAwb.length; a++) {
        district_id = resultDataAwb[a].to_id;
        is_cod = resultDataAwb[a].is_cod;
      }

      if ((is_cod) || (is_cod == true)) {
        is_cod = true;
      } else {
        is_cod = false;
      }
      if(!district_id) {
        data.push({
          state: 1,
          tracking_number: payload.tracking_number,
        });
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.message = `District NULL for AWB: ` + payload.tracking_number;
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

        branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
          result.message,
          0,
          dateNow,
          payload.sorting_branch_id,
          payload.tracking_number,
          null,
          null,
          is_cod,
        );

        return result;
      }
      const rawQuerySubDistrict = `
        SELECT
          branch_id
        FROM district_mapping_detail
        WHERE
          district_id = '${escape(district_id)}' AND
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
            const combineChute = [];
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
              paramBranchIdLastmile = resultData[a].branch_id_lastmile,
              paramChute = resultData[a].no_chute;
              if (paramChute) {
                combineChute.push(paramChute);
              }
            }

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              1,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              paramBranchIdLastmile,
              combineChute.join(','),
              is_cod,
            );

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

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              0,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              null,
              null,
              is_cod,
            );

            return result;
          }
        } else {
          const rawQuery = `
            SELECT bs.*
            FROM branch_sortir bs
            WHERE
              bs.is_deleted = FALSE AND
              bs.branch_id_lastmile=${resultDataSubDistrict[0].branch_id} AND
              bs.is_cod = ${escape(is_cod)} AND
              bs.branch_id = ${payload.sorting_branch_id}
            ;
          `;
          console.log(rawQuery);
          const resultData = await RawQueryService.query(rawQuery);
          // console.log(rawQuery);
          if (resultData.length > 0 ) {
            result.message = 'Check Spk Success';
            const combineChute = [];
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
              paramBranchIdLastmile = resultData[a].branch_id_lastmile,
              paramChute = resultData[a].no_chute;
              if (paramChute) {
                combineChute.push(paramChute);
              }
            }

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              1,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              paramBranchIdLastmile,
              combineChute.join(','),
              is_cod,
            );

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

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              0,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              null,
              null,
              false,
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

        branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
          result.message,
          0,
          dateNow,
          payload.sorting_branch_id,
          payload.tracking_number,
          null,
          null,
          false,
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

      branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
        result.message,
        0,
        dateNow,
        payload.sorting_branch_id,
        payload.tracking_number,
        null,
        null,
        false,
      );

      return result;
    }

  }

  private static async checkAwbProcessSubDistric(
    payload: CheckAwbPayloadVm,
    // partnerId: number,
    // dropPartnerType: string,
  ): Promise<any> {
    const result = new CheckAwbResponseVM();
    const data = [];
    let zip_code;
    let is_cod;
    let district_code;
    let branchSortirLogSummaryId;
    const ArrChute = [];
    let paramBranchIdLastmile;
    let paramChute;

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
            const combineChute = [];
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
              paramBranchIdLastmile = resultData[a].branch_id_lastmile,
              paramChute = resultData[a].no_chute;
              if (paramChute) {
                combineChute.push(paramChute);
              }
            }

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              1,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              paramBranchIdLastmile,
              combineChute.join(','),
              is_cod,
            );

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

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              0,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              null,
              null,
              is_cod,
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
            const combineChute = [];
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
              paramBranchIdLastmile = resultData[a].branch_id_lastmile,
              paramChute = resultData[a].no_chute;
              if (paramChute) {
                combineChute.push(paramChute);
              }
            }

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              1,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              paramBranchIdLastmile,
              combineChute.join(','),
              is_cod,
            );

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

            branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
              result.message,
              0,
              dateNow,
              payload.sorting_branch_id,
              payload.tracking_number,
              null,
              null,
              false,
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

        branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
          result.message,
          0,
          dateNow,
          payload.sorting_branch_id,
          payload.tracking_number,
          null,
          null,
          false,
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

      branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
        result.message,
        0,
        dateNow,
        payload.sorting_branch_id,
        payload.tracking_number,
        null,
        null,
        false,
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

  private static async upsertBranchSortirLogSummary(
    message: string,
    paramSucceed: number,
    scanDate: Date,
    branchId: string | number,
    awbNumber: string,
    paramBranchIdLastmile: number,
    paramChuteNumber: string,
    paramIsCod: boolean,
    userId: number = 1,
  ) {
    let branchSortirLogSummary = null;
    let paramBranchSortirLogSummaryId;

    branchSortirLogSummary = await BranchSortirLogSummary.findOne({
      where: {
        awbNumber,
        isDeleted: false,
      },
    });

    if (branchSortirLogSummary) {
      paramBranchSortirLogSummaryId = branchSortirLogSummary.branchSortirLogSummaryId;
      const dateStr = moment(scanDate).format('YYYY-MM-DD 00:00:00');

      await BranchSortirLogSummary.update({
        branchSortirLogSummaryId: paramBranchSortirLogSummaryId,
      }, {
        scanDate: dateStr,
        isSucceed: paramSucceed,
        reason: message,
        branchId: parseInt(branchId.toString()),
        branchIdLastmile: paramBranchIdLastmile,
        chuteNumber: paramChuteNumber,
        isCod: paramIsCod,
        updatedTime: moment().toDate(),
      });
    } else {
      const dateStr = moment(scanDate).format('YYYY-MM-DD 00:00:00');

      const createBranchSortirLogSummary = BranchSortirLogSummary.create({
        scanDate: dateStr,
        branchId: parseInt(branchId.toString()),
        awbNumber,
        isSucceed: paramSucceed,
        reason: message,
        branchIdLastmile: paramBranchIdLastmile,
        chuteNumber: paramChuteNumber,
        isCod: paramIsCod,
        createdTime: scanDate,
        updatedTime: scanDate,
        userIdCreated: userId,
        userIdUpdated: userId,
      });
      await BranchSortirLogSummary.save(createBranchSortirLogSummary);
      paramBranchSortirLogSummaryId = createBranchSortirLogSummary.branchSortirLogSummaryId;
    }

    return paramBranchSortirLogSummaryId;
  }
}
