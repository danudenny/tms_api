import { HttpException } from '@nestjs/common';
import express = require('express');

import { FILE_PROVIDER } from '../constants/file-provider.constant';
import { AttachmentTms } from '../orm-entity/attachment-tms';
import { AwsS3Service } from './aws-s3.service';
import { ConfigService } from './config.service';

export class AttachmentService {
  public static async uploadFileBufferToS3(
    fileBuffer: Buffer,
    fileOriginalName: string,
    fileMime: string,
    pathId?: string,
    bucketName?: string,
  ) {
    if (!bucketName && ConfigService.has('cloudStorage.cloudBucket')) {
      bucketName = ConfigService.get('cloudStorage.cloudBucket');
    }

    const uploadResponse = await AwsS3Service.uploadFileBuffer(
      fileBuffer,
      fileOriginalName,
      fileMime,
      pathId,
      bucketName,
    );

    const url = `https://${bucketName}.s3.amazonaws.com/${uploadResponse.awsKey}`;

    const attachment = AttachmentTms.create({
      s3BucketName: bucketName,
      fileMime,
      fileProvider: FILE_PROVIDER.AWS_S3,
      attachmentPath: uploadResponse.awsKey,
      attachmentName: fileOriginalName,
      fileName: fileOriginalName,
      url,
      userIdCreated: 1,
      userIdUpdated: 1,
    });
    return AttachmentTms.save(attachment);
  }

  public static async uploadFileBase64(
    base64String: string,
    pathId?: string,
    bucketName?: string,
  ) {
    if (!bucketName && ConfigService.has('cloudStorage.cloudBucket')) {
      bucketName = ConfigService.get('cloudStorage.cloudBucket');
    }
    const uuidv1 = require('uuid/v1');

    const fileRandomName = uuidv1();
    const uploadResponse = await AwsS3Service.uploadFileBase64(
      base64String,
      fileRandomName,
      pathId,
      bucketName,
    );

    const url = `https://${bucketName}.s3.amazonaws.com/${uploadResponse.awsKey}`;

    const attachment = AttachmentTms.create({
      s3BucketName: bucketName,
      fileMime: uploadResponse.contentType,
      fileProvider: FILE_PROVIDER.AWS_S3,
      attachmentPath: uploadResponse.awsKey,
      attachmentName: fileRandomName,
      fileName: fileRandomName,
      url,
      userIdCreated: 1,
      userIdUpdated: 1,
    });
    return AttachmentTms.save(attachment);
  }

  public static async sendAttachmentToClient(
    res: express.Response,
    attachmentId: number,
  ) {
    const attachment = await AttachmentTms.findOne(attachmentId);
    if (!attachment) {
      throw new HttpException('File not found', 404);
    }

    switch (attachment.fileProvider) {
      case FILE_PROVIDER.AWS_S3:
        return AwsS3Service.downloadFileAndStreamToClient(
          res,
          attachment.s3BucketName,
          attachment.attachmentPath,
          attachment.fileName,
          attachment.fileMime,
        );
    }
  }

  public static async findById(attachmentId: number) {
    const attachment = await AttachmentTms.findOne(attachmentId);
    if (!attachment) {
      throw new HttpException('Cannot get attachment, file not found', 404);
    }
    return attachment;
  }

  public static async deleteAttachment(attachmentId: number) {
    const attachment = await AttachmentTms.findOne(attachmentId);

    if (!attachment) {
      throw new HttpException('Cannot delete attachment, file not found', 404);
    }

    switch (attachment.fileProvider) {
      case FILE_PROVIDER.AWS_S3:
        await AwsS3Service.deleteFile(
          attachment.s3BucketName,
          attachment.attachmentPath,
        );
        break;
    }

    await attachment.remove();
  }
}
