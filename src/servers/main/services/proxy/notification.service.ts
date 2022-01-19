import { ConfigService } from '../../../../shared/services/config.service';
import axios from 'axios';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';

export class NotificationProxyService {
  static async notificationInfo() {
    const path = '/api/v1/message/info';

    let options = {};

    return this.proxyNotification(path, options);
  }

  static async notificationDetail(notificationId: string) {
    const path = '/api/v1/message';

    let options = {
      params: {
        notificationId: notificationId,
      },
    };

    return this.proxyNotification(path, options);
  }

  static async notificationList(page: string, limit: string) {
    const path = '/api/v1/message/list';

    let options = {
      params: {
        page: page,
        limit: limit,
      },
    };

    console.log(options);
    return await this.proxyNotification(path, options);
  }

  static async proxyNotification(path: string, options: any) {
    const authMeta = AuthService.getAuthMetadata();
    options.headers = {
      'Content-type': 'application/json',
      'x-user-id': authMeta.userId.toString(),
    };
    try {
      const response = await axios.get(
        ConfigService.get('proxy.notification') + path,
        options,
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        console.log('[proxyNotification] error api ',
          path,
          '\n payload: ',
          options,
          '\n error: ',
          error.message,
        );
        throw new BadRequestException(error.response.data);
      }
    }
  }
}
