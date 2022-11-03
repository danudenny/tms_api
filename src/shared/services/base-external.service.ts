import { HttpException, HttpStatus } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { HttpRequestAxiosService } from './http-request-axios.service';
import { PinoLoggerService } from './pino-logger.service';

export abstract class ExternalService {
  constructor(
    protected readonly httpRequestService: HttpRequestAxiosService,
    protected readonly BASE_URL,
    protected readonly LABEL,
  ) {}

  protected async post(
    path: string,
    payload: any,
    config: AxiosRequestConfig = {},
  ): Promise<any> {
    try {
      const url = `${this.BASE_URL}${path}`;
      const response = await this.httpRequestService
        .post(url, payload, config)
        .toPromise();
      return response;
    } catch (err) {
      if (err.response) {
        const status = err.response.status || HttpStatus.BAD_REQUEST;
        const errResponse = {
          error: err.response.data && err.response.data.error,
          message:
            err.response.data &&
            (err.response.data.message || err.response.data.error),
          statusCode: status,
        };
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
          PinoLoggerService.error(
            `[${this.LABEL}] Response Error: ${errResponse.message}`,
          );
        }
        throw new HttpException(errResponse, status);
      }
      PinoLoggerService.error(`[${this.LABEL}] Request Error: ${err.message}`);
      throw err;
    }
  }
}
