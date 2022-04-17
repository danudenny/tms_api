import { PodAwbAttachment } from '../../shared/orm-entity/pod-awb-attachment';
import { PodWebAttachmentModel } from '../../shared/models/pod-web-attachment.model';
import { getManager } from 'typeorm';
import moment = require('moment');

export class PodAttachment {
  public static async upsertPodAttachment(data: PodWebAttachmentModel) {
    const timeNow = moment().toDate();
    let dataAttachment = await PodAwbAttachment.findOne({
      where: {
        awbNumber: data.awbNumber,
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
            userIdUpdated: data.userIdUpdated,
            updatedTime : timeNow,
          }
        );
      });
    } else {
      await getManager().transaction(async transactional => {
        const uuidv1 = require('uuid/v1');
        const dataInsert = PodAwbAttachment.create();
        dataInsert.id = uuidv1();
        dataInsert.awbItemId = data.awbItemId;
        dataInsert.awbNumber = data.awbNumber;
        dataInsert.attachmentTmsId = data.attachmentTmsId;
        dataInsert.awbStatusId = data.awbStatusId;
        dataInsert.photoType = data.photoType;
        dataInsert.createdTime = timeNow;
        dataInsert.userIdCreated = data.userIdCreated;
        dataInsert.updatedTime = timeNow;
        dataInsert.userIdUpdated = data.userIdUpdated;
        dataInsert.isDeleted = false;
        await transactional.insert(PodAwbAttachment, dataInsert);
      });
    }
  }
}