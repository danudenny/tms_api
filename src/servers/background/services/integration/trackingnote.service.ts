import { HttpStatus } from '@nestjs/common';

import moment = require('moment');
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { TrackingNoteResponseVm } from '../../models/trackingnote.response.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { DatabaseConfig } from '../../config/database/db.config';
import * as sql from 'mssql';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { AwbHistoryLastSyncPod } from '../../../../shared/orm-entity/awb-history-last-sync-pod';

export class TrackingNoteService {
  static async findLastAwbHistory(
    payload: BaseMetaPayloadVm,
  ): Promise<TrackingNoteResponseVm> {
    const result = new TrackingNoteResponseVm();
    const awbHistoryLastSyncPod = await AwbHistoryLastSyncPod.findOne({
      where: {
        isDeleted: false,
      },
    });
    if (awbHistoryLastSyncPod) {
      const data = await this.getRawAwbHistory(awbHistoryLastSyncPod.awbHistoryId);
      if (data) {
        this.insertTmsTrackingNote(awbHistoryLastSyncPod, data);
        result.data = data;
      } else {
        RequestErrorService.throwObj(
          {
            message: 'Awb History Not Found (' + awbHistoryLastSyncPod.awbHistoryId + ')',
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    } else {
      RequestErrorService.throwObj(
        {
          message: 'Last Awb History Empty',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return result;
  }

  private static async getRawAwbHistory(awbHistoryId: number): Promise<any> {
    const query = `
      SELECT
        ah.awb_history_id as "awbHistoryId",
        a.awb_number as "receiptNumber",
        COALESCE(ah.history_date, ah.created_time) as "trackingDateTime",
        s.awb_status_id as "awbStatusId",
        s.awb_status_group as "trackingType",
        e.fullname as "courierName",
        e."nik",
        b.branch_code as "branchCode",
        ah.note_internal as "noteInternal",
        ah.note_public as "notePublic",
        ah.awb_note as "noteTms",
        ah.receiver_name as "receiverName",
        s.awb_visibility as "isPublic"
      FROM awb_history ah
      INNER JOIN awb_item ai on ai.awb_item_id=ah.awb_item_id and ai.is_deleted=false
      INNER JOIN awb a on a.awb_id=ai.awb_id and a.is_deleted=false
      INNER JOIN awb_status s on ah.awb_status_id=s.awb_status_id and s.send_tracking_note=10 and s.is_deleted=false
      LEFT JOIN employee e on ah.employee_id_driver=e.employee_id and e.is_deleted=false
      LEFT JOIN branch b on ah.branch_id=b.branch_id and b.is_deleted=false
      WHERE ah.awb_history_id > :awbHistoryId and ah.is_deleted=false
      ORDER BY awb_history_id
      LIMIT 2000;
    `;
    return await RawQueryService.queryWithParams(query, {
      awbHistoryId,
    });
  }

  private static async getRawLastAwbHistory(): Promise<any> {
    const query = `
      SELECT *
      FROM awb_history_last_sync
      LIMIT 1;
    `;
    return await RawQueryService.query(query);
  }

  private static async insertTmsTrackingNote(awbHistoryLastSyncPod: any, data: any): Promise<any> {
    // Connect to POD
    const conn = await DatabaseConfig.getPodDbConn();
    const transaction = new sql.Transaction(conn);

    transaction.begin( (err: any) => {
        // ... error checks
      let lastSyncId = 0;
      let ctr = 0;
        // Bulk Insert Prepare Table
        // const table = new sql.Table('TmsTrackingNote');
        // table.columns.add('AwbHistoryId', sql.Int, {nullable: false});
        // table.columns.add('ReceiptNumber', sql.VarChar, {nullable: false});
        // table.columns.add('TrackingDateTime', sql.DateTime, {nullable: false});
        // table.columns.add('AwbStatusId', sql.Int, {nullable: false});
        // table.columns.add('TrackingType', sql.VarChar, {nullable: true});
        // table.columns.add('CourierName', sql.VarChar, {nullable: true});
        // table.columns.add('Nik', sql.VarChar, {nullable: true});
        // table.columns.add('BranchCode', sql.VarChar, {nullable: true});
        // table.columns.add('NoteInternal', sql.VarChar, {nullable: true});
        // table.columns.add('NotePublic', sql.VarChar, {nullable: true});
        // table.columns.add('NoteTms', sql.VarChar, {nullable: true});
        // table.columns.add('UsrCrt', sql.VarChar, {nullable: true});
        // table.columns.add('UsrUpd', sql.VarChar, {nullable: true});
        // table.columns.add('DtmCrt', sql.DateTime, {nullable: false});
        // table.columns.add('DtmUpd', sql.DateTime, {nullable: false});
        // table.columns.add('ReceiverName', sql.VarChar, {nullable: true});
        //  table.columns.add('IsPublic', sql.Boolean, {nullable: true});

      for (const item of data) {
        lastSyncId = item.awbHistoryId;
        // table.rows.add(lastSyncId, item.receiptNumber, item.trackingDateTime, item.awbStatusId, item.trackingType,
        //   item.courierName, item.nik, item.branchCode,
        //   // item.noteInternal, // item.notePublic, item.noteTms,
        //   'TMS', 'TMS', new Date(), new Date());
        // break;
        const request = conn.request();
        request.input('AwbHistoryId', sql.Int, item.awbHistoryId);
        request.input('ReceiptNumber', sql.VarChar, item.receiptNumber);
        request.input('TrackingDateTime', sql.DateTime, moment(item.trackingDateTime).add(7, 'hours').toDate());
        request.input('AwbStatusId', sql.Int, item.awbStatusId);
        request.input('TrackingType', sql.VarChar, item.trackingType);
        request.input('CourierName', sql.VarChar, item.courierName);
        request.input('Nik', sql.VarChar, item.nik);
        request.input('BranchCode', sql.VarChar, item.branchCode);
        request.input('NoteInternal', sql.VarChar, item.noteInternal);
        request.input('NotePublic', sql.VarChar, item.notePublic);
        request.input('NoteTms', sql.VarChar, item.noteTms);
        request.input('UsrCrt', sql.VarChar, 'TMS');
        request.input('UsrUpd', sql.VarChar, 'TMS');
        request.input('DtmCrt', sql.DateTime, moment().add(7, 'hours').toDate());
        request.input('DtmUpd', sql.DateTime, moment().add(7, 'hours').toDate());
        request.input('ReceiverName', sql.VarChar, item.receiverName);
        let isPublic = 0;
        if (item.isPublic === 20) {
          isPublic = 1;
        }
        request.input('IsPublic', sql.Bit, isPublic);

        request.query(`
          insert into TmsTrackingNoteStaging (
            AwbHistoryId, ReceiptNumber, TrackingDateTime, AwbStatusId, TrackingType, CourierName, Nik, BranchCode, NoteInternal, NotePublic, NoteTms, UsrCrt, UsrUpd, DtmCrt, DtmUpd, ReceiverName, IsPublic
            )
          values (
            @AwbHistoryId, @ReceiptNumber, @TrackingDateTime, @AwbStatusId, @TrackingType, @CourierName, @Nik, @BranchCode, @NoteInternal, @NotePublic, @NoteTms, @UsrCrt, @UsrUpd, @DtmCrt, @DtmUpd, @ReceiverName, @IsPublic
          )`, (err, result) => {
            if (!err) {
              ctr++;
              if (ctr == data.length) {
                AwbHistoryLastSyncPod.update(awbHistoryLastSyncPod.awbHistoryLastSyncPodId, {
                  awbHistoryId: lastSyncId,
                  updatedTime: new Date(),
                });
                transaction.commit(err => {
                  if (err) {
                    console.log('[ERROR TRANSACTION] :: ' + err);
                    transaction.rollback(err => {
                      if (err) {
                        console.log('[ERROR ROLLBACK TRANSACTION] :: ' + err);
                      } else {
                        console.log('[ROLLBACKED TRANSACTION]===================');
                      }
                    });
                  } else {
                    console.log('[COMMITTED]===================');
                  }
                });
                console.log('[ALL SUCCESS] Last awb history id === ' + lastSyncId);
              }
            } else {
              if (lastSyncId != 0) {
                transaction.rollback(err => {
                  if (err) {
                    console.log('[ERROR ROLLBACK] :: ' + err);
                  } else {
                    console.log('[ROLLBACKED]===================');
                  }
                });
                console.log('[ERROR STOP] Last awb history id === ' + lastSyncId);
              }
              RequestErrorService.throwObj({
                message: err,
              },
                HttpStatus.UNPROCESSABLE_ENTITY,
              );
            }
          },
        );
      }

        // const request = conn.request();
        // request.bulk(table, (err, result) => {
        //   // ... error checks
        //   if (!err) {
        //     // AwbHistoryLastSyncPod.update(awbHistoryLastSyncPod.awbHistoryLastSyncPodId, {
        //     //   awbHistoryId: lastSyncId,
        //     //   updatedTime: new Date(),
        //     // });
        //     // console.log('[ALL SUCCESS] Last awb history id === ' + lastSyncId);
        //   } else {
        //     console.log('[ERROR STOP] Tracking Note Service === ' + err);
        //     RequestErrorService.throwObj({
        //       message: err,
        //     },
        //       HttpStatus.UNPROCESSABLE_ENTITY,
        //     );
        //   }
        // });
    });
  }
}
