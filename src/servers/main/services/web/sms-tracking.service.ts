import {
  SmsTrackingStoreMessagePayloadVm,
  SmsTrackingListMessagePayloadVm,
  SmsTrackingStoreShiftPayloadVm,
  SmsTrackingListShiftPayloadVm,
  SmsTrackingListUserPayloadVm,
  SmsTrackingDeleteUserPayloadVm,
  GenerateReportSmsTrackingPayloadVm,
} from '../../models/sms-tracking-payload.vm';
import {
  SmsTrackingListMessageResponseVm,
  SmsTrackingStoreMessageResponseVm,
  SmsTrackingStoreShiftResponseVm,
  SmsTrackingListShiftResponseVm,
  SmsTrackingListUserResponseVm,
} from '../../models/sms-tracking-response.vm';
import moment = require('moment');
import { async } from 'rxjs/internal/scheduler/async';
import { SmsTrackingShift } from '../../../../shared/orm-entity/sms-tracking-shift';
import { AuthService } from '../../../../shared/services/auth.service';
import { SmsTrackingMessage } from '../../../../shared/orm-entity/sms-tracking-message';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { SmsTrackingUser } from '../../../../shared/orm-entity/sms-tracking-user';
import { In, createQueryBuilder } from 'typeorm';
import fs = require('fs');
import xlsx = require('xlsx');
import { ExportToCsv } from 'export-to-csv';
import express = require('express');
import { format } from 'path';
import { isEmpty } from 'lodash';

export class SmsTrackingService {
  static async storeMessage(
    payload: SmsTrackingStoreMessagePayloadVm,
  ): Promise<SmsTrackingStoreMessageResponseVm> {
    const result = new SmsTrackingStoreMessageResponseVm();
    const authMeta = AuthService.getAuthData();
    const smsTrackingMessage = SmsTrackingMessage.create({
      sentTo: payload.sentTo,
      isRepeated: payload.isRepeated,
      isRepeatedOver: payload.isRepeatedOver,
      note: payload.note,
      awbStatusId: payload.awbStatusId,
      userIdCreated: authMeta.userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
    });
    const response = await SmsTrackingMessage.save(smsTrackingMessage);
    result.smsTrackingMessageId = response.smsTrackingMessageId;
    result.message = 'Berhasil Menyimpan sms tracking - message';
    result.status = 'success';
    return result;
  }

  static async listMessage(
    payload: SmsTrackingListMessagePayloadVm,
  ): Promise<SmsTrackingListMessageResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['sentTo'] = 't1.sent_to';
    payload.fieldResolverMap['isRepeated'] = 't1.is_repeated';
    payload.fieldResolverMap['isRepeatedOver'] = 't1.is_repeated_over';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'sentTo',
      },
      {
        field: 'note',
      },
    ];
    if (!payload.limit) {
      payload.limit = 1000;
    }
    const repo = new OrionRepositoryService(SmsTrackingMessage, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.innerJoin(e => e.awbStatus, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.smsTrackingUser, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.selectRaw(
      ['t1.sms_tracking_message_id::integer', 'smsTrackingMessageId'],
      ['t1.sent_to', 'sentTo'],
      ['t1.is_repeated', 'isRepeated'],
      ['t1.note', 'note'],
      ['t1.is_repeated_over', 'isRepeatedOver'],
      ['t2.awb_status_id', 'awbStatusId'],
      ['t2.awb_status_name', 'awbStatusName'],
      ['t3.sms_tracking_user_id::integer', 'sentTo'],
      ['t3.sms_tracking_user_name', 'sentToName'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderBy({ createdTime: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new SmsTrackingListMessageResponseVm();
    result.buildPaging(payload.page, payload.limit, total);
    result.data = data;

    return result;
  }

  static async storeShift(
    payload: SmsTrackingStoreShiftPayloadVm,
  ): Promise<SmsTrackingStoreShiftResponseVm> {
    const result = new SmsTrackingStoreShiftResponseVm();

    if (!moment(payload.workFrom, 'HH:mm', true).isValid() ||
      !moment(payload.workTo, 'HH:mm', true).isValid()) {
      result.smsTrackingShiftId = null;
      result.message = `Salah format payload workFrom dan workTo`;
      result.status = 'error';
      return result;
    }

    const authMeta = AuthService.getAuthData();
    const smsTrackingShift = SmsTrackingShift.create({
      workFrom: payload.workFrom,
      workTo: payload.workTo,
      userIdCreated: authMeta.userId,
      createdTime: moment().toDate(),
      updatedTime: moment().toDate(),
      userIdUpdated: authMeta.userId,
    });
    const response = await SmsTrackingShift.save(smsTrackingShift);
    result.smsTrackingShiftId = response.smsTrackingShiftId;
    result.message = 'Berhasil Menyimpan sms tracking - shift';
    result.status = 'sukses';
    return result;

    return result;
  }

  static async listShift(
    payload: SmsTrackingListShiftPayloadVm,
  ): Promise<SmsTrackingListShiftResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['workFrom'] = 't1.work_from';
    payload.fieldResolverMap['workTo'] = 't1.work_to';
    const repo = new OrionRepositoryService(SmsTrackingShift, 't1');
    if (!payload.limit) {
      payload.limit = 1000;
    }
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.sms_tracking_shift_id::integer', 'smsTrackingShiftId'],
      ['t1.work_from', 'workFrom'],
      ['t1.work_to', 'workTo'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderBy({
      createdTime: 'DESC',
    });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new SmsTrackingListShiftResponseVm();
    result.buildPaging(payload.page, payload.limit, total);
    result.data = data;

    return result;
  }

  static async userList(
    payload: SmsTrackingListUserPayloadVm,
  ): Promise<SmsTrackingListUserResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['createdTime'] = 't1.created_time';
    payload.fieldResolverMap['sentTo'] = 't1.sms_tracking_user_id';
    payload.fieldResolverMap['phone'] = 't1.phone';

    // mapping search field and operator default ilike
    payload.globalSearchFields = [
      {
        field: 'sentToName',
      },
      {
        field: 'phone',
      },
    ];
    if (!payload.limit) {
      payload.limit = 1000;
    }
    const repo = new OrionRepositoryService(SmsTrackingUser, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.sms_tracking_user_id::integer', 'smsTrackingUserId'],
      ['t1.sms_tracking_user_name', 'name'],
      ['t1.phone', 'phone'],
    );
    q.andWhere(e => e.isDeleted, w => w.isFalse());
    q.orderBy({
      createdTime: 'DESC',
    });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new SmsTrackingListUserResponseVm();
    result.buildPaging(payload.page, payload.limit, total);
    result.data = data;

    return result;
  }
  static async deleteUser(payload: SmsTrackingDeleteUserPayloadVm) {
    const data = payload.trackingMessageId;
    try {
      const db = await SmsTrackingMessage.update({ smsTrackingMessageId: In(data) }, {
        isDeleted: true,
      });
      const result = {
        status: 'success',
        message: 'Berhasil Menghapus Data',
      };
      db.raw = result;
      return db.raw;
    } catch (error) {
      return { status: 'error', message: 'Gagal Menghapus Data' };
    }
  }

  public static async export(
    res: express.Response,
    date: string,
    id: number,
  ) {
    // query get all sms tracking message
    let qb = createQueryBuilder();
    qb.addSelect('stm.is_repeated_over', 'isRepeatedOver');
    qb.addSelect('stm.is_repeated', 'isRepeated');
    qb.addSelect('stm.awb_status_id', 'awbStatusId');
    qb.from('sms_tracking_message', 'stm');
    qb.andWhere('stm.is_deleted = false');
    const smsTrackingMessage = await qb.getRawMany();

    // query get sms tracking shift on id
    qb = createQueryBuilder();
    qb.addSelect('sts.work_from', 'workFrom');
    qb.addSelect('sts.work_to', 'workTo');
    qb.from('sms_tracking_shift', 'sts');
    qb.andWhere('sts.is_deleted = false');
    qb.andWhere(`sts.sms_tracking_shift_id = '${id}'`);
    const smsTrackingShift = await qb.getRawOne();

    const date7DayBefore = moment(date, 'YYYY-MM-DD').subtract(7, 'd')
      .format('YYYY-MM-DD');
    const workFromDT = moment(smsTrackingShift.workFrom, 'hh:mm A');
    const workToDT = moment(smsTrackingShift.workTo, 'hh:mm A');

    // query get data for excel
    qb = createQueryBuilder();
    qb.addSelect('awb.awb_number', 'waybill'); // waybill

    qb.addSelect(`(
      REPLACE(stm.note, '[waybill]', awb.awb_number)
    )`, 'note');
    qb.addSelect('abs.awb_status_name', 'awbStatusName');
    qb.addSelect('prd.recipient_phone', 'recipientPhone');
    qb.addSelect('prd.recipient_name', 'recipientName');
    qb.addSelect('prd.shipper_phone', 'senderPhone');
    qb.addSelect('prd.shipper_name', 'senderName');
    qb.addSelect('stu.sms_tracking_user_name', 'sentTo');
    qb.addSelect('abs.awb_status_name', 'awbStatusName');

    qb.addSelect(`
      CASE
        WHEN (stu.sms_tracking_user_name = 'Recipient' AND prd.recipient_phone ~ '^([/08|/+62][0-9]{10,13})$') THEN 'valid'
        WHEN (stu.sms_tracking_user_name = 'Sender' AND prd.shipper_phone ~ '^([/08|/+62][0-9]{10,13})$') THEN 'valid'
        ELSE 'invalid'
      END
    `, 'statusPhone');
    qb.from('sms_tracking_message', 'stm');
    qb.innerJoin(
      'sms_tracking_user',
      'stu',
      'stu.sms_tracking_user_id = stm.sent_to AND stu.is_deleted = false',
    );
    qb.innerJoin(
      'awb_item_attr',
      'aia',
      'aia.awb_status_id_last = stm.awb_status_id AND aia.is_deleted = false',
    );
    qb.innerJoin(
      'awb_status',
      'abs',
      'aia.awb_status_id_last = abs.awb_status_id AND abs.is_deleted = false',
    );
    qb.innerJoin(
      'awb',
      'awb',
      'awb.awb_id = aia.awb_id AND awb.is_deleted = false',
    );
    qb.innerJoin(
      'pickup_request_detail',
      'prd',
      'prd.ref_awb_number = awb.ref_awb_number AND prd.is_deleted = false',
    );

    // query filter by shift awb status
    smsTrackingMessage.forEach(data => {
      if (data.isRepeatedOver && data.isRepeated) { // filter 7 hari kebelakang
        qb.orWhere(`(
          aia.awb_status_id_last = '${data.awbStatusId}' AND
          aia.updated_time >= '${date7DayBefore} 00:00:00' AND
          aia.updated_time <= '${date} 23:59:59'
        )`);
      } else if (data.isRepeatedOver && !data.isRepeated) { // filter dalam lingkup jam shifting dan 7 hari kebelakang
        if (workToDT.isAfter(workFromDT)) {
          qb.orWhere(`(
            aia.awb_status_id_last = '${data.awbStatusId}' AND
            aia.updated_time >= '${date7DayBefore} 00:00:00' AND
            aia.updated_time <= '${date} 23:59:59' AND
            CAST(aia.updated_time AS TIME) >= '${smsTrackingShift.workFrom}' AND
            CAST(aia.updated_time AS TIME) <= '${smsTrackingShift.workTo}'
          )`);
        } else {
          qb.orWhere(`(
            aia.awb_status_id_last = '${data.awbStatusId}' AND
            aia.updated_time >= '${date7DayBefore} 00:00:00' AND
            aia.updated_time <= '${date} 23:59:59' AND
            (
              CAST(aia.updated_time AS TIME) <= '${smsTrackingShift.workFrom}' OR
              CAST(aia.updated_time AS TIME) >= '${smsTrackingShift.workTo}'
            )
          )`);
        }
      } else if (!data.isRepeatedOver && data.isRepeated) { // filter diluar lingkup jam shifting dan 7 hari kebelakang
        console.log('filter diluar lingkup jam shifting dan 7 hari kebelakang ' + data.awbStatusId);
        if (workToDT.isAfter(workFromDT)) {
          qb.orWhere(`(
            aia.awb_status_id_last = '${data.awbStatusId}' AND
            aia.updated_time >= '${date7DayBefore} 00:00:00' AND
            aia.updated_time <= '${date} 23:59:59' AND
            CAST(aia.updated_time AS TIME) < '${smsTrackingShift.workFrom}' AND
            CAST(aia.updated_time AS TIME) > '${smsTrackingShift.workTo}'
          )`);
        } else {
          qb.orWhere(`(
            aia.awb_status_id_last = '${data.awbStatusId}' AND
            aia.updated_time >= '${date7DayBefore} 00:00:00' AND
            aia.updated_time <= '${date} 23:59:59' AND
            (
              CAST(aia.updated_time AS TIME) > '${smsTrackingShift.workFrom}' OR
              CAST(aia.updated_time AS TIME) < '${smsTrackingShift.workTo}'
            )
          )`);
        }
      } else { // filter hanya dalam lingkup jam shifting pada tanggal request
        if (workToDT.isAfter(workFromDT)) {
          qb.orWhere(`(
            aia.awb_status_id_last = '${data.awbStatusId}' AND
            aia.updated_time >= '${date} 00:00:00' AND
            aia.updated_time <= '${date} 23:59:59' AND
            CAST(aia.updated_time AS TIME) >= '${smsTrackingShift.workFrom}' AND
            CAST(aia.updated_time AS TIME) <= '${smsTrackingShift.workTo}'
          )`);
        } else {
          qb.orWhere(`(
            aia.awb_status_id_last = '${data.awbStatusId}' AND
            aia.updated_time >= '${date} 00:00:00' AND
            aia.updated_time <= '${date} 23:59:59' AND
            (
              CAST(aia.updated_time AS TIME) <= '${smsTrackingShift.workFrom}' OR
              CAST(aia.updated_time AS TIME) >= '${smsTrackingShift.workTo}'
            )
          )`);
        }
      }
    });
    const data = await qb.getRawMany();
    const listValid = [];
    const listInvalid = [];
    let header = [];
    let temp = null;

    // // override header with first index data, header:[status, phone, note]
    // if (!isEmpty(data)) {
    //   header = [
    //     data[0].awbStatusName,
    //     data[0].sentTo === 'Sender' ? data[0].senderPhone : data[0].recipientPhone,
    //     data[0].note,
    //   ];
    //   data.shift();
    // }
    // mapping data to object excel
    data.map(function (detail) {
      const content = {};
      if (detail.sentTo === 'Sender') {
        if (detail.statusPhone === 'valid') {
          content['Waybill Number'] = detail.waybill;
          content['Phone'] = detail.senderPhone;
          content['Name of Recipient'] = detail.note;
          listValid.push(content);
        } else {
          content['Waybill Number'] = detail.waybill;
          content['Name of Sender'] = detail.senderName;
          content['Phone of Sender'] = detail.senderPhone;
          content['Name of Recipient'] = detail.recipientName;
          content['Phone of Recipient'] = detail.recipientPhone;
          content['Sigesit'] = detail.driverName; //
          content['Position'] = detail.BranchName; //
          content['Remark'] = detail.packageNote; //
          content['Tracking Type'] = detail.awbStatusName;
          content['Agency Code'] = detail.representativeName; //
          content['Note of SMS'] = detail.note;
          listInvalid.push(content);
        }
      } else if (detail.sentTo === 'Recipient') {
        if (detail.statusPhone === 'valid') {
          content[header[0]] = detail.awbStatusName;
          content[header[1]] = detail.recipientPhone;
          content[header[2]] = detail.note;
          listValid.push(content);
        } else {
          content['Waybill Number'] = detail.waybill;
          content['Name of Sender'] = detail.senderName;
          content['Phone of Sender'] = detail.senderPhone;
          content['Name of Recipient'] = detail.recipientName;
          content['Phone of Recipient'] = detail.recipientPhone;
          content['Sigesit'] = detail.driverName; //
          content['Position'] = detail.BranchName; //
          content['Remark'] = detail.packageNote; //
          content['Tracking Type'] = detail.awbStatusName;
          content['Agency Code'] = detail.representativeName; //
          content['Note of SMS'] = detail.note;
          listInvalid.push(content);
        }
      }
    });

    // NOTE: create excel using unique name
    const fileName = 'data_' + moment().format('YYMMDD_HHmmss') + '.xlsx';
    try {
      const newWB = xlsx.utils.book_new();
      const newWS = xlsx.utils.json_to_sheet(listValid);
      const newWS2 = xlsx.utils.json_to_sheet(listInvalid);
      xlsx.utils.book_append_sheet(newWB, newWS, 'Sheet1');
      xlsx.utils.book_append_sheet(newWB, newWS2, 'Sheet2');
      xlsx.writeFile(newWB, fileName);

      // const buffExcel = fs.createReadStream(fileName);
      const filestream = fs.createReadStream(fileName);
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // const attachment = await AttachmentService.uploadFileBufferToS3(
      //   buffExcel,
      //   fileName,
      //   mimeType,
      //   'sms-tracking-excel',
      // );

      res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
      res.setHeader('Content-type', mimeType);
      filestream.pipe(res);
    } catch (error) {
      console.log('error ketika download excel sms-tracking');
    } finally {
      if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
      }
    }
  }
}
