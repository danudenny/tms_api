import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import _ = require('lodash');

import { ConfigService } from '../../../../shared/services/config.service';
import { HttpRequestAxiosService } from '../../../../shared/services/http-request-axios.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { SortationMachineService } from '../../interfaces/sortation-machine-service.interface';
import { CheckAwbRequest, CheckAwbResponse } from '../../models/sortation-machine/sortation-machine.payload';

@Injectable()
export class ExternalSortationMachineService implements SortationMachineService {
  constructor(private readonly httpRequestService: HttpRequestAxiosService) { }

  private readonly BASE_URL = ConfigService.get('sortationMachine.v2');

  public async checkAwb(payload: CheckAwbRequest): Promise<CheckAwbResponse> {
    const result = await this.post('/check-awb', payload);

    return {
      destination: _.get(result, 'data.0.branch_id_lastmile'),
      transport_type: _.get(result, 'data.0.route_transport_map'),
    };
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
            `[ExternalSortationMachineService] Response Error: ${errResponse.message}`,
          );
        }
        throw new HttpException(errResponse, status);
      }
      PinoLoggerService.error(
        `[ExternalSortationMachineService] Request Error: ${err.message}`,
      );
      throw err;
    }
  }
}
