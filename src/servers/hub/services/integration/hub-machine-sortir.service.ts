import moment = require('moment');
import { HttpStatus } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { CheckAwbPayloadVm, CheckAwbResponseVM } from '../../models/hub-machine-sortir.vm';
import { BranchSortirLogQueueService } from '../../../queue/services/branch-sortir-log-queue.service';
import { BranchSortirLogSummary } from '../../../../shared/orm-entity/branch-sortir-log-summary';
import { getConnection } from 'typeorm';
import { District } from '../../../../shared/orm-entity/district';
import { RedisService } from '../../../../shared/services/redis.service';

export class HubMachineSortirService {

  static async deleteKeyRedis(payload): Promise<any> {
    const key = payload.key;
    const data = await RedisService.get(key, true);

    const result = { statusCode : HttpStatus.OK, message: '' };
    if (data) {
      // delete key redis
      const deleteKey = await RedisService.del(key);
      if (deleteKey) {
        result.message = `Key ${key} has been deleted`;
      } else {
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.message = `delete key failed`;
      }

    } else {
      result.message = `Key ${key} not found`;
    }

    return result;
  }

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
    // let district_id;
    let is_cod;
    let district_code;
    let branchSortirLogSummaryId;
    const ArrChute = [];
    let paramBranchIdLastmile: number = null;
    let paramChute;
    let cod_nilai;
    let tujuan;
    const dateNow = moment().toDate();

    const checkResiHasGsQuery = `SELECT
      b.bag_number
    FROM
      bag_item_awb bia
      INNER JOIN bag_item bi ON bi.bag_item_id = bia.bag_item_id AND bi.is_deleted = FALSE
      INNER JOIN bag b ON b.bag_id = bi.bag_id AND b.branch_id = ${payload.sorting_branch_id} AND b.is_deleted = FALSE
      INNER JOIN awb_item ai ON ai.awb_item_id = bia.awb_item_id AND ai.is_deleted = FALSE
      INNER JOIN awb a ON a.awb_id = ai.awb_id AND a.awb_number = '${escape(payload.tracking_number)}' AND a.is_deleted = FALSE
    WHERE bia.is_sortir = TRUE
    AND bia.is_deleted = FALSE LIMIT 1`;
    const resultCheckResiHasGS = await RawQueryService.query(checkResiHasGsQuery);
    if (resultCheckResiHasGS.length > 0 ) {
      data.push({
        state: 1,
        tracking_number: payload.tracking_number,
        branch_id_lastmile: paramBranchIdLastmile,
      });
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = `AWB: ` + payload.tracking_number + ` already have bag, with bag number : ` + resultCheckResiHasGS[0].bag_number;
      result.data = data;
      return result;
    }

    const rawQueryAwb = `
      SELECT
        codbiaya,
        codnilai,
        tujuan,
        berat
      FROM temp_stt
      WHERE
      nostt = '${escape(payload.tracking_number)}'
      ;
    `;
    const resultDataAwb = await RawQueryService.query(rawQueryAwb);
    if (resultDataAwb.length > 0 ) {
      for (let a = 0; a < resultDataAwb.length; a++) {
        tujuan = resultDataAwb[a].tujuan;
        // cod_biaya = resultDataAwb[a].codbiaya;
        cod_nilai = resultDataAwb[a].codnilai;
      }

      if(cod_nilai > 0) {
        is_cod = true;
      } else {
        is_cod = false;
      }

      if (!tujuan) {
        data.push({
          state: 1,
          tracking_number: payload.tracking_number,
          is_cod,
        });
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.message = `District NULL for AWB: ` + payload.tracking_number;
        result.data = data;

        // Remark Sementara karena Wayzim mau testing pke mesin distaging
        // await this.upsertBranchSortirLog(
        //   result.message,
        //   dateNow,
        //   1,
        //   payload.sorting_branch_id,
        //   payload.tracking_number,
        //   null,
        //   null,
        //   false,
        //   1,
        // );

        // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
        //   result.message,
        //   0,
        //   dateNow,
        //   payload.sorting_branch_id,
        //   payload.tracking_number,
        //   null,
        //   null,
        //   is_cod,
        // );

        return result;
      }
      // Cek District ID
      let resultDistrict = await District.findOne({
        districtCode: tujuan,
        isDeleted: false,
      });
      if (!resultDistrict) {
        data.push({
          state: 1,
          tracking_number: payload.tracking_number,
          is_cod,
        });
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.message = `Can't Find District for AWB: ` + payload.tracking_number;
        result.data = data;

        // Remark Sementara karena Wayzim mau testing pke mesin distaging
        // await this.upsertBranchSortirLog(
        //   result.message,
        //   dateNow,
        //   1,
        //   payload.sorting_branch_id,
        //   payload.tracking_number,
        //   null,
        //   null,
        //   false,
        //   1,
        // );

        // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
        //   result.message,
        //   0,
        //   dateNow,
        //   payload.sorting_branch_id,
        //   payload.tracking_number,
        //   null,
        //   null,
        //   is_cod,
        // );

        return result;
      }

      const rawQuerySubDistrict = `
        SELECT
          branch_id
        FROM district_mapping_detail
        WHERE
          district_id = '${resultDistrict.districtId}' AND
          is_deleted = FALSE
        LIMIT 1
      `;
      const resultDataSubDistrict = await RawQueryService.query(rawQuerySubDistrict);
      if (resultDataSubDistrict.length > 0 ) {
        if (is_cod == true) {
          // const rawQuery = `
          //   SELECT bs.*
          //   FROM branch_sortir bs
          //   WHERE
          //     bs.is_deleted = FALSE AND
          //     bs.branch_id_lastmile=${resultDataSubDistrict[0].branch_id} AND
          //     bs.is_cod = ${escape(is_cod)} AND
          //     bs.branch_id = ${payload.sorting_branch_id}
          //   ;
          // `;
          const rawQuery = `
            SELECT bs.*
            FROM branch_sortir bs
            INNER JOIN district_mapping_detail dmd ON bs.branch_id_lastmile = dmd.branch_id and dmd.is_deleted = FALSE
            WHERE
              bs.is_deleted = FALSE AND
              bs.is_cod = ${escape(is_cod)} AND
              bs.branch_id = ${payload.sorting_branch_id} AND
              dmd.district_id='${resultDistrict.districtId}'
          `;

          const resultData = await RawQueryService.query(rawQuery);
          if (resultData.length > 0 ) {
            const combineChute = [];
            result.message = 'Check Spk Success';
            for (let a = 0; a < resultData.length; a++) {
              ArrChute.push(resultData[a].no_chute);

              // Remark Sementara karena Wayzim mau testing pke mesin distaging
              // await this.upsertBranchSortirLog(
              //   result.message,
              //   dateNow,
              //   0,
              //   payload.sorting_branch_id,
              //   payload.tracking_number,
              //   resultData[a].no_chute,
              //   resultData[a].branch_id_lastmile,
              //   resultData[a].is_cod,
              //   1,
              // );
              paramBranchIdLastmile = Number(resultData[a].branch_id_lastmile),
                paramChute = resultData[a].no_chute;
              if (paramChute) {
                combineChute.push(paramChute);
              }
            }

            // Remark Sementara karena Wayzim mau testing pke mesin distaging
            // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
            //   result.message,
            //   1,
            //   dateNow,
            //   payload.sorting_branch_id,
            //   payload.tracking_number,
            //   paramBranchIdLastmile,
            //   combineChute.join(','),
            //   is_cod,
            // );

            data.push({
              state: 0,
              tracking_number: payload.tracking_number,
              chute_number: ArrChute,
              request_time: moment().format('YYYY/MM/DD HH:mm:ss'),
              is_cod,
              branch_id_lastmile: paramBranchIdLastmile,
            });
            result.statusCode = HttpStatus.OK;
            result.data = data;
            return result;
          } else {
            data.push({
              state: 1,
              tracking_number: payload.tracking_number,
              is_cod,
              branch_id_lastmile: paramBranchIdLastmile,
            });
            result.statusCode = HttpStatus.BAD_REQUEST;
            result.message = `Can't Find Chute COD For AWB: ` + payload.tracking_number;
            result.data = data;

            // Remark Sementara karena Wayzim mau testing pke mesin distaging
            // await this.upsertBranchSortirLog(
            //   result.message,
            //   dateNow,
            //   1,
            //   payload.sorting_branch_id,
            //   payload.tracking_number,
            //   null,
            //   null,
            //   false,
            //   1,
            // );

            // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
            //   result.message,
            //   0,
            //   dateNow,
            //   payload.sorting_branch_id,
            //   payload.tracking_number,
            //   null,
            //   null,
            //   is_cod,
            // );

            return result;
          }
        } else {
          // const rawQuery = `
          //   SELECT bs.*
          //   FROM branch_sortir bs
          //   WHERE
          //     bs.is_deleted = FALSE AND
          //     bs.branch_id_lastmile=${resultDataSubDistrict[0].branch_id} AND
          //     bs.is_cod = ${escape(is_cod)} AND
          //     bs.branch_id = ${payload.sorting_branch_id}
          //   ;
          // `;
         
          const rawQuery = `
            SELECT bs.*
            FROM branch_sortir bs
            INNER JOIN district_mapping_detail dmd ON bs.branch_id_lastmile = dmd.branch_id and dmd.is_deleted = FALSE
            WHERE
              bs.is_deleted = FALSE AND
              bs.is_cod = ${escape(is_cod)} AND
              bs.branch_id = ${payload.sorting_branch_id} AND
              dmd.district_id='${resultDistrict.districtId}'
          `;
          const resultData = await RawQueryService.query(rawQuery);
          
          if (resultData.length > 0 ) {
            result.message = 'Check Spk Success';
            const combineChute = [];
            for (let a = 0; a < resultData.length; a++) {
              ArrChute.push(resultData[a].no_chute);

              // Remark Sementara karena Wayzim mau testing pke mesin distaging
              // await this.upsertBranchSortirLog(
              //   result.message,
              //   dateNow,
              //   0,
              //   payload.sorting_branch_id,
              //   payload.tracking_number,
              //   resultData[a].no_chute,
              //   resultData[a].branch_id_lastmile,
              //   resultData[a].is_cod,
              //   1,
              // );
              paramBranchIdLastmile = Number(resultData[a].branch_id_lastmile),
                paramChute = resultData[a].no_chute;
              if (paramChute) {
                combineChute.push(paramChute);
              }
            }

            // Remark Sementara karena Wayzim mau testing pke mesin distaging
            // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
            //   result.message,
            //   1,
            //   dateNow,
            //   payload.sorting_branch_id,
            //   payload.tracking_number,
            //   paramBranchIdLastmile,
            //   combineChute.join(','),
            //   is_cod,
            // );

            data.push({
              state: 0,
              tracking_number: payload.tracking_number,
              chute_number: ArrChute,
              request_time: moment().format('YYYY/MM/DD HH:mm:ss'),
              is_cod,
              branch_id_lastmile: paramBranchIdLastmile,
            });
            result.statusCode = HttpStatus.OK;
            result.data = data;
            return result;

          } else {
            data.push({
              state: 1,
              tracking_number: payload.tracking_number,
              is_cod,
              branch_id_lastmile: paramBranchIdLastmile,
            });
            result.statusCode = HttpStatus.BAD_REQUEST;
            result.message = `Can't Find Chute For AWB: ` + payload.tracking_number;
            result.data = data;

            // Remark Sementara karena Wayzim mau testing pke mesin distaging
            // await this.upsertBranchSortirLog(
            //   result.message,
            //   dateNow,
            //   1,
            //   payload.sorting_branch_id,
            //   payload.tracking_number,
            //   null,
            //   null,
            //   false,
            //   1,
            // );

            // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
            //   result.message,
            //   0,
            //   dateNow,
            //   payload.sorting_branch_id,
            //   payload.tracking_number,
            //   null,
            //   null,
            //   false,
            // );

            return result;
          }
        }
      } else {
        data.push({
          state: 1,
          tracking_number: payload.tracking_number,
          is_cod,
          branch_id_lastmile: paramBranchIdLastmile,
        });
        result.statusCode = HttpStatus.BAD_REQUEST;
        result.message = `Can't Find District For: ` + payload.tracking_number;
        result.data = data;

        // Remark Sementara karena Wayzim mau testing pke mesin distaging
        // await this.upsertBranchSortirLog(
        //   result.message,
        //   dateNow,
        //   1,
        //   payload.sorting_branch_id,
        //   payload.tracking_number,
        //   null,
        //   null,
        //   false,
        //   1,
        // );

        // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
        //   result.message,
        //   0,
        //   dateNow,
        //   payload.sorting_branch_id,
        //   payload.tracking_number,
        //   null,
        //   null,
        //   false,
        // );

        return result;
      }
    } else {
      data.push({
        state: 1,
        tracking_number: payload.tracking_number,
        is_cod,
        branch_id_lastmile: paramBranchIdLastmile,
      });
      result.statusCode = HttpStatus.BAD_REQUEST;
      result.message = `Can't Find AWB: ` + payload.tracking_number;
      result.data = data;

      // Remark Sementara karena Wayzim mau testing pke mesin distaging
      // await this.upsertBranchSortirLog(
      //   result.message,
      //   dateNow,
      //   1,
      //   payload.sorting_branch_id,
      //   payload.tracking_number,
      //   null,
      //   null,
      //   false,
      //   1,
      // );

      // branchSortirLogSummaryId = await this.upsertBranchSortirLogSummary(
      //   result.message,
      //   0,
      //   dateNow,
      //   payload.sorting_branch_id,
      //   payload.tracking_number,
      //   null,
      //   null,
      //   false,
      // );

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
    let branchSortirLogSummary ;
    let paramBranchSortirLogSummaryId;

    // branchSortirLogSummary = await BranchSortirLogSummary.findOne({
    //   where: {
    //     awbNumber,
    //     isDeleted: false,
    //   },
    // });

    // let branchSortirLogSummary;
    const masterQueryRunner = getConnection().createQueryRunner('master');
    try {
      branchSortirLogSummary = await getConnection()
        .createQueryBuilder(BranchSortirLogSummary, 'ctd')
        .setQueryRunner(masterQueryRunner)
        .where('ctd.awbNumber = :paramAwbNumber AND ctd.isDeleted = false', {
          paramAwbNumber: awbNumber,
        })
        .getOne();
    } finally {
      await masterQueryRunner.release();
    }

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
