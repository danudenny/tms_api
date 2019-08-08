import { AttachmentTms } from '../orm-entity/attachment-tms';
import { ConfigService } from './config.service';
import { Req, Res, Injectable, Logger } from '@nestjs/common';
import * as multer from 'multer';
import * as AWS from 'aws-sdk';
import multerS3 = require('multer-s3');
import moment = require('moment');
import util = require('util');

const AWS_S3_BUCKET_NAME =
  ConfigService.get('cloudStorage.cloudBucket') || 'bucket_name';

const s3 = new AWS.S3({
  accessKeyId: ConfigService.get('cloudStorage.cloudAccessKeyId'),
  secretAccessKey: ConfigService.get('cloudStorage.cloudSecretAccessKey'),
  region: ConfigService.get('cloudStorage.cloudRegion'),
});

export class ImageUploadService {
  constructor() {}

  // property multer upload
  static upload = multer({
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

  static async fileUpload(@Req() req) {
    let result;
    try {
      const upload = util.promisify(this.upload);
      await upload(req, null);
      const imageS3 = req.files[0];

      // save image attachment on table
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

      result = attachment;
    } catch (error) {
      Logger.log(error);
      return `Failed to upload image file: ${error}`;
    }
    return result;
  }

  // https://medium.com/@mayneweb/upload-a-base64-image-data-from-nodejs-to-aws-s3-bucket-6c1bd945420f
}
