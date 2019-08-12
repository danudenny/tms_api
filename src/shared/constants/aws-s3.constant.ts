import * as AWS from 'aws-sdk';

import { ConfigService } from '../services/config.service';

export const AWS_S3 = new AWS.S3({
  accessKeyId: ConfigService.get('cloudStorage.cloudAccessKeyId'),
  secretAccessKey: ConfigService.get('cloudStorage.cloudSecretAccessKey'),
  region: ConfigService.get('cloudStorage.cloudRegion'),
});
