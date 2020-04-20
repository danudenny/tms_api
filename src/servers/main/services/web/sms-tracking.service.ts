import {
  SmsTrackingStorePayloadVm,
  SmsTrackingListPayloadVm,
} from '../../models/sms-tracking-payload.vm';
import {
  SmsTrackingListResponseVm,
  SmsTrackingStoreResponseVm,
} from '../../models/sms-tracking-response.vm';
import { SmsTrackingMessage } from 'src/shared/orm-entity/sms-tracking-message';
import { AuthService } from 'src/shared/services/auth.service';
import moment = require('moment');
import { OrionRepositoryService } from 'src/shared/services/orion-repository.service';
import { async } from 'rxjs/internal/scheduler/async';

export class SmsTrackingService {
  static async save(
    payload: SmsTrackingStorePayloadVm,
  ): Promise<SmsTrackingStoreResponseVm> {
    const result = new SmsTrackingStoreResponseVm();
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
      result.message = 'Berhasil Menyimpan sms tracking';
      result.status = 'sukses';
      return result;
    } catch (error) {
      result.smsTrackingMessageId = null;
      result.message = 'Gagal menyimpan data sms tracking';
      result.status = 'error';
      return result;
    }
  }

  static async list(
    payload: SmsTrackingListPayloadVm,
  ): Promise<SmsTrackingListResponseVm> {
    // mapping search field and operator default ilike
    payload.fieldResolverMap['sentTo'] = 't1.sent_to';
    payload.fieldResolverMap['isRepeated'] = 't1.is_repeated';
    const repo = new OrionRepositoryService(SmsTrackingMessage, 't1');

    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.sms_tracking_message_id', 'smsTrackingSmsId'],
      ['t1.sent_to', 'sentTo'],
      ['t1.is_repeated', 'isRepeated'],
      ['t1.note', 'note'],
    );
    q.orderBy({ createdTime: 'DESC' });
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    const result = new SmsTrackingListResponseVm();
    result.buildPaging(payload.page, payload.limit, total);
    result.data = data;

    return result;
  }
}
