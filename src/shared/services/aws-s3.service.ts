import express = require('express');
import moment = require('moment');
import fs = require('fs');

import { AWS_S3 } from '../constants/aws-s3.constant';
import { ConfigService } from './config.service';

export class AwsS3Service {
  public static uploadFileBuffer(
    fileBuffer: Buffer,
    fileOriginalName: string,
    fileMime: string,
    pathId?: string,
    bucketName?: string,
  ) {
    if (!bucketName && ConfigService.has('cloudStorage.cloudBucket')) {
      bucketName = ConfigService.get('cloudStorage.cloudBucket');
    }

    const awsKey = `attachments/${
      pathId ? `${pathId}/` : ''
    }${moment().format('Y/M/D')}/${fileOriginalName}`;
    // attachments/tms-check-in/123456789-file.png OR attachments/123456789-file.png
    // CHANGE: attachments/tms-check-in/19/8/12/file.png OR attachments/19/8/12/file.png

    // NOTE: The optional contentType option can be used to set Content/mime type of the file.
    // By default the content type is set to application/octet-stream.
    return AWS_S3.putObject({
      ACL: 'public-read',
      ContentType: fileMime,
      Body: fileBuffer,
      Bucket: bucketName,
      Key: awsKey,
    })
      .promise()
      .then(() => {
        return {
          awsKey,
        };
      });
  }

  public static uploadFileBase64(
    base64String: string,
    awsKey: string,
    bucketName?: string,
  ) {
    if (!bucketName && ConfigService.has('cloudStorage.cloudBucket')) {
      bucketName = ConfigService.get('cloudStorage.cloudBucket');
    }

    // const awsKey = `attachments/${
    //   pathId ? `${pathId}/` : ''
    // }${moment().format('Y/M/D')}/${fileOriginalName}`;
    // attachments/tms-check-in/123456789-file.png OR attachments/123456789-file.png
    // CHANGE: attachments/tms-check-in/19/8/12/file.png OR attachments/19/8/12/file.png

    // Ensure that you POST a base64 data to your server.
    const base64Data = Buffer.from(
      base64String.replace(/^data:image\/\w+;base64,/, ''),
      'base64',
    );

    // Getting the file type, ie: jpeg, png or gif
    const type = base64String.split(';')[0].split('/')[1];
    const contentType = `image/${type}`;

    // NOTE: The optional contentType option can be used to set Content/mime type of the file.
    // By default the content type is set to application/octet-stream.
    return AWS_S3.putObject({
      ACL: 'public-read',
      ContentType: contentType,
      Body: base64Data,
      Bucket: bucketName,
      Key: awsKey,
    })
      .promise()
      .then(() => {
        return {
          awsKey,
          contentType,
        };
      });
  }

  public static async uploadFromFilePath(
    filePath: string,
    fileName: string,
    bucketName?: string,
  ) {
    // init bucketName
    if (!bucketName && ConfigService.has('cloudStorage.cloudBucket')) {
      bucketName = ConfigService.get('cloudStorage.cloudBucket');
    }
    const awsKey = `reports/${fileName}`;
    try {
      // upload file to S3
      return AWS_S3.putObject({
        ACL: 'public-read',
        Body: fs.readFileSync(filePath),
        Bucket: bucketName,
        Key: awsKey,
      })
        .promise()
        .then(() => {
          return { awsKey };
        });
    } catch (err) {
      console.log('get error: ', err);
    }
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
