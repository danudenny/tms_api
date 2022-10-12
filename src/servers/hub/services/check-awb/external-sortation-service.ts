import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { ConfigService } from '../../../../shared/services/config.service';
import { HttpRequestAxiosService } from '../../../../shared/services/http-request-axios.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { SortationService } from '../../interfaces/sortation-service.interface';
import { GetAwbResponse } from '../../models/check-awb/check-awb.response';

@Injectable()
export class ExternalSortationService implements SortationService {
  constructor(private readonly httpRequestService: HttpRequestAxiosService) {}

  private readonly BASE_URL = ConfigService.get('hubMonitoring.baseUrl');

  getAwb(awbNumber: string): Promise<GetAwbResponse> {
    return this.post('/awb', { awb_number: awbNumber });
  }

  private async post(
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
            `[ExternalSortationService] Response Error: ${errResponse.message}`,
          );
        }
        throw new HttpException(errResponse, status);
      }
      PinoLoggerService.error(
        `[ExternalSortationService] Request Error: ${err.message}`,
      );
      throw err;
    }
  }
}
