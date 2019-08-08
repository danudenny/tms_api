import { HttpException } from '@nestjs/common';

import { I18nService } from './i18n.service';

export class RequestErrorService {
  public static throwObj(
    requestError: {
      [key: string]: any;
      message: string;
    },
    httpCode: number = 400,
  ) {
    if (requestError.message) {
      requestError.message = I18nService.translate(requestError.message);
    }
    throw new HttpException(requestError, httpCode);
  }
}
