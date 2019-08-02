import { AttachmentTms } from '../orm-entity/attachment-tms';
import { ConfigService } from './config.service';
import { Req, Res, Injectable, Logger } from '@nestjs/common';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import multerS3 = require('multer-s3');
import moment = require('moment');

const AWS_S3_BUCKET_NAME =
  ConfigService.get('cloudStorage.cloudBucket') || 'bucket_name';

const s3 = new AWS.S3({
  accessKeyId: ConfigService.get('cloudStorage.cloudAccessKeyId'),
  secretAccessKey: ConfigService.get('cloudStorage.cloudSecretAccessKey'),
  region: ConfigService.get('cloudStorage.cloudRegion'),
});

@Injectable()
export class ImageUploadService {
  constructor() {}

  // property multer upload
  upload = multer({
    storage: multerS3({
      s3,
      bucket: AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'public-read',
      key(req, file, cb) {
        cb(
          null,
          `attachments/${req.body.pathName}/${moment().format('Y/M/D')}/${
            file.originalname
          }`,
        );
      },
    }),
  }).array('upload', 1);

  async fileupload(@Req() req, @Res() res) {
    try {
      this.upload(req, res, async function(error) {
        if (error) {
          Logger.log(error);
          return res.status(404).json(`Failed to upload image file: ${error}`);
        }
        const imageS3 = req.files[0];
        const attachment = AttachmentTms.create({
          attachmentPath: imageS3.key,
          attachmentName: imageS3.originalname,
          filename: imageS3.originalname,
          userIdCreated: 1,
          userIdUpdated: 1,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
        });
        await AttachmentTms.save(attachment);

        Logger.debug(attachment, 'DEBUG');
        return res.status(201).json(imageS3);
      });
    } catch (error) {
      Logger.log(error);
      return res.status(400).json(`Failed to upload image file: ${error}`);
    }
  }
}
