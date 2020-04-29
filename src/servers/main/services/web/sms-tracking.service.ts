import {
  SmsTrackingStoreMessagePayloadVm,
  SmsTrackingListMessagePayloadVm,
  SmsTrackingStoreShiftPayloadVm,
  SmsTrackingListShiftPayloadVm,
} from '../../models/sms-tracking-payload.vm';
import {
  SmsTrackingListMessageResponseVm,
  SmsTrackingStoreMessageResponseVm,
  SmsTrackingStoreShiftResponseVm,
  SmsTrackingListShiftResponseVm,
} from '../../models/sms-tracking-response.vm';
import { SmsTrackingMessage } from 'src/shared/orm-entity/sms-tracking-message';
import { AuthService } from 'src/shared/services/auth.service';
import moment = require('moment');
import { OrionRepositoryService } from 'src/shared/services/orion-repository.service';
import { async } from 'rxjs/internal/scheduler/async';
import { SmsTrackingShift } from '../../../../shared/orm-entity/sms-tracking-shift';

export class SmsTrackingService {
  static async storeMessage(
    payload: SmsTrackingStoreMessagePayloadVm,
  ): Promise<SmsTrackingStoreMessageResponseVm> {
    const result = new SmsTrackingStoreMessageResponseVm();
    if (payload.sentTo != 'Sender' && payload.sentTo != 'Recepient') {
      result.smsTrackingMessageId = null;
      result.message = `Label Penerima harus 'Sender' atau 'Recepient'`;
      result.status = 'error';
      return result;
    }
    try {
      const authMeta = AuthService.getAuthData();
      const smsTrackingMessage = SmsTrackingMessage.create({
        sentTo: payload.sentTo,
        isRepeated: payload.isRepeated,
        note: payload.note,
        userIdCreated: authMeta.userId,
        createdTime: moment().toDate(),
        updatedTime: moment().toDate(),
        userIdUpdated: authMeta.userId,
      });
      const response = await SmsTrackingMessage.save(smsTrackingMessage);
      result.smsTrackingMessageId = response.smsTrackingMessageId;
      result.message = 'Berhasil Menyimpan sms tracking - message';
      result.status = 'sukses';
      return result;
    } catch (error) {
      result.smsTrackingMessageId = null;
      result.message = 'Gagal menyimpan data sms tracking - message';
      result.status = 'error';
      return result;
    }
  }

  static async listMessage(
    payload: SmsTrackingListMessagePayloadVm,
  ): Promise<SmsTrackingListMessageResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['sentTo'] = 't1.sent_to';
    payload.fieldResolverMap['isRepeated'] = 't1.is_repeated';
    const repo = new OrionRepositoryService(SmsTrackingMessage, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.sms_tracking_message_id', 'smsTrackingMessageId'],
      ['t1.sent_to', 'sentTo'],
      ['t1.is_repeated', 'isRepeated'],
      ['t1.note', 'note'],
    );
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

    try {
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
    } catch (error) {
      result.smsTrackingShiftId = null;
      result.message = 'Gagal menyimpan data sms tracking - shift';
      result.status = 'error';
      return result;
    }

    return result;
  }

  static async listShift(
    payload: SmsTrackingListShiftPayloadVm,
  ): Promise<SmsTrackingListShiftResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['sentTo'] = 't1.sent_to';
    payload.fieldResolverMap['isRepeated'] = 't1.is_repeated';
    const repo = new OrionRepositoryService(SmsTrackingShift, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.sms_tracking_shift_id', 'smsTrackingShiftId'],
      ['t1.work_from', 'workFrom'],
      ['t1.work_to', 'sentTo'],
    );
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
}
