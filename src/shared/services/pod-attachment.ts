import { PodAwbAttachment } from '../../shared/orm-entity/pod-awb-attachment';
import { PodWebAttachmentModel } from '../../shared/models/pod-web-attachment.model';
import { OrionRepositoryService } from '../../shared/services/orion-repository.service';
import { ImgProxyHelper } from '../../shared/helpers/imgproxy-helper'
import { getManager } from 'typeorm';
import moment = require('moment');
import { OrderManualHelper } from '../helpers/order-manual-helpers';

export class PodAttachment {
  public static async upsertPodAttachment(data: PodWebAttachmentModel) {
    const timeNow = moment().toDate();
    let dataAttachment = await PodAwbAttachment.findOne({
      select: ['id'],
      where: {
        awbItemId: data.awbItemId,
        awbStatusId: data.awbStatusId,
        isDeleted: false
      }
    });

    if (dataAttachment) {
      await getManager().transaction(async transactional => {
        await transactional.update(PodAwbAttachment,
          {
            id: dataAttachment.id,
          },
          {
            awbNumber: data.awbNumber,
            awbItemId: data.awbItemId,
            attachmentTmsId: data.attachmentTmsId,
            awbStatusId: data.awbStatusId,
            photoType: data.photoType,
          }
        );
      });
    } else {
      await getManager().transaction(async transactional => {
        const dataInsert = PodAwbAttachment.create();
        dataInsert.awbItemId = data.awbItemId;
        dataInsert.awbNumber = data.awbNumber;
        dataInsert.attachmentTmsId = data.attachmentTmsId;
        dataInsert.awbStatusId = data.awbStatusId;
        dataInsert.photoType = data.photoType;
        dataInsert.isDeleted = false;
        await transactional.insert(PodAwbAttachment, dataInsert);
      });
    }
  }

  public static async findAttachment(awbNumber:string): Promise<any>{
    const repo = new OrionRepositoryService(PodAwbAttachment, 't1');
    const q = repo.findAllRaw();

    q.selectRaw(
      ['t1.photo_type', 'type'],
      ['t2.url', 'url'],
      ['t1.awb_number', 'awbNumber'],
      ['t2.created_time', 'createdTime']
    );

    q.innerJoin(e => e.attachment, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );

    q.andWhere(e => e.awbNumber, w => w.equals(awbNumber));
    q.andWhere(e => e.isDeleted, w => w.isFalse());

    let data = await q.exec();
    data = await data.sort(await OrderManualHelper.orderManual('createdTime', 'desc'));

    for(let i = 0; i < data.length; i++){
      data[i].url = ImgProxyHelper.sicepatProxyUrl(data[i].url);
    }

    return data;
  }
}