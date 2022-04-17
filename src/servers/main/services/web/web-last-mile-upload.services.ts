import { WebLastMileUploadResponseVm } from '../../models/web-last-mile-upload-response.vm';
import { WebLastMileUploadPayloadVm } from '../../models/web-last-mile-upload-payload.vm';
import { AuthService } from '../../../../shared/services/auth.service';
import { AttachmentTms } from '../../../../shared/orm-entity/attachment-tms';
import { AttachmentService } from '../../../../shared/services/attachment.service';

export class WebLastMileUploadService {
  static async uploadFile(payload : WebLastMileUploadPayloadVm, file): Promise<WebLastMileUploadResponseVm>{
    const result = new WebLastMileUploadResponseVm();
    let attachmentId = null;

    let attachment = await AttachmentTms.findOne({
      where: {
        fileName: file.originalname,
      }
    });

    if (attachment) {
      attachmentId = attachment.attachmentTmsId;
      result.message = 'ok'
      result.status = 'success';
    }else{
      const pathId = `tms-delivery-${payload.photoType}`;
      attachment = await AttachmentService.uploadFileBufferToS3(
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
    }

    result.attachmentTmsId = attachmentId;
    return result;
  }
}