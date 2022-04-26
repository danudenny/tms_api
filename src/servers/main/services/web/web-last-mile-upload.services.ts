import { WebLastMileUploadResponseVm } from '../../models/web-last-mile-upload-response.vm';
import { WebLastMileUploadPayloadVm } from '../../models/web-last-mile-upload-payload.vm';
import { AttachmentService } from '../../../../shared/services/attachment.service';

export class WebLastMileUploadService {
  static async uploadFile(payload : WebLastMileUploadPayloadVm, file): Promise<WebLastMileUploadResponseVm>{
    const result = new WebLastMileUploadResponseVm();
    const uuidv1 = require('uuid/v1');
    let attachmentId = null;
    file.originalname = await uuidv1()+'.'+file.originalname.split('.').pop();
    const pathId = `tms-delivery-${payload.photoType}`;
      let attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        pathId,
      );

      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
        result.message = 'ok'
        result.status = 'success';
      }else{
        attachmentId = 0;
        result.message = 'Gambar gagal upload'
        result.status = 'error';
      }

    result.attachmentTmsId = attachmentId;
    return result;
  }
}