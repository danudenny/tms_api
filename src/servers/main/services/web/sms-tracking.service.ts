import {
  SmsTrackingStoreMessagePayloadVm,
  SmsTrackingListMessagePayloadVm,
  SmsTrackingStoreShiftPayloadVm,
  SmsTrackingListShiftPayloadVm,
  SmsTrackingListUserPayloadVm,
  SmsTrackingDeleteMessagePayloadVm,
  SmsTrackingUpdateMessagePayloadVm,
} from '../../models/sms-tracking-payload.vm';
import {
  SmsTrackingListMessageResponseVm,
  SmsTrackingStoreMessageResponseVm,
  SmsTrackingStoreShiftResponseVm,
  SmsTrackingListShiftResponseVm,
  SmsTrackingListUserResponseVm,
  SmsTrackingUpdateMessageResponseVm,
} from '../../models/sms-tracking-response.vm';
import moment = require('moment');
import { async } from 'rxjs/internal/scheduler/async';
import { SmsTrackingShift } from '../../../../shared/orm-entity/sms-tracking-shift';
import {AuthService} from '../../../../shared/services/auth.service';
import {SmsTrackingMessage} from '../../../../shared/orm-entity/sms-tracking-message';
import {OrionRepositoryService} from '../../../../shared/services/orion-repository.service';
import {SmsTrackingUser} from '../../../../shared/orm-entity/sms-tracking-user';
import { In, getConnection } from 'typeorm';

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
  static async updateMessage(
    payload: SmsTrackingUpdateMessagePayloadVm,
  ): Promise<SmsTrackingUpdateMessageResponseVm> {
    const result = new SmsTrackingStoreMessageResponseVm();
    try {
      const db = await SmsTrackingMessage.query(`SELECT * FROM sms_tracking_message WHERE sms_tracking_message_id = ${payload.smsTrackingMessageId}`);
      const authMeta = AuthService.getAuthData();

      const updateSmsTrackingMessage = await getConnection()
      .createQueryBuilder().update(SmsTrackingMessage).set({
          sentTo: payload.sentTo,
          isRepeated: payload.isRepeated,
          isRepeatedOver: payload.isRepeatedOver,
          note: payload.note,
          awbStatusId: payload.awbStatusId,
          userIdCreated: authMeta.userId,
          updatedTime: moment().toDate(),
          userIdUpdated: authMeta.userId,
      }).where(`sms_tracking_message_id = ${payload.smsTrackingMessageId}`, {sms_tracking_message_id: 8 })
      .returning(['smsTrackingMessageId'])
      .execute();

      const response = await updateSmsTrackingMessage;
      result.smsTrackingMessageId = response.raw[0].sms_tracking_message_id;
      result.message = 'Berhasil Menyimpan sms tracking - message';
      result.status = 'success';
      return result;

    } catch (error) {
        result.message = 'Gagal Menyimpan Data sms tracking - message';
        result.status = 'error';
        return result;
    }
  }
  static async deleteMessage(payload: SmsTrackingDeleteMessagePayloadVm) {
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
}
