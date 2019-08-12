import express = require('express');

import { AWS_S3 } from '../constants/aws-s3.constant';
import { ConfigService } from './config.service';

export class AwsS3Service {
  public static uploadFileBuffer(
    fileBuffer: Buffer,
    fileOriginalName: string,
    pathId?: string,
    bucketName?: string,
  ) {
    if (!bucketName && ConfigService.has('cloudStorage.cloudBucket')) {
      bucketName = ConfigService.get('cloudStorage.cloudBucket');
    }

    const awsKey = `attachments/${
      pathId ? `${pathId}/` : ''
    }${Date.now()}-${fileOriginalName}`; // attachments/tms-check-in/123456789-file.png OR attachments/123456789-file.png

    return AWS_S3.putObject({
      ACL: 'public-read',
      Body: fileBuffer,
      Bucket: bucketName,
      Key: awsKey,
    })
      .promise()
      .then(result => {
        return {
          awsKey,
        };
      });
  }

  public static downloadFileAndStreamToClient(
    res: express.Response,
    bucketName: string,
    key: string,
    fileName: string,
    fileMime?: string,
  ) {
    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
    if (fileMime) {
      res.setHeader('Content-Type', fileMime);
    }

    const fileStream = AWS_S3.getObject({
      Bucket: bucketName,
      Key: key,
    }).createReadStream();
    fileStream.pipe(res);
  }

  public static async deleteFile(bucketName: string, key: string) {
    return AWS_S3.deleteObject({
      Bucket: bucketName,
      Key: key,
    }).promise();
  }
}
