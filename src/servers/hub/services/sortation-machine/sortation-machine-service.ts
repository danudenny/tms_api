import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import _ = require('lodash');

import { ConfigService } from '../../../../shared/services/config.service';
import { HttpRequestAxiosService } from '../../../../shared/services/http-request-axios.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import { SortationMachineService } from '../../interfaces/sortation-machine-service.interface';
import {
  CheckAwbRequest,
  CheckAwbResponse,
  GetAwbResponse,
} from '../../models/sortation-machine/sortation-machine.payload';

@Injectable()
export class ExternalSortationMachineService
  implements SortationMachineService {
  constructor(private readonly httpRequestService: HttpRequestAxiosService) {}

  private readonly BASE_URL = ConfigService.get('sortationMachine.url');

  public async checkAwb(payload: CheckAwbRequest): Promise<CheckAwbResponse> {
    const result = await this.post('/check-awb', payload);

    if (result.statusCode >= HttpStatus.BAD_REQUEST) {
      const errResponse = {
        error: result.error,
        message: result.message || 'Terjadi kesalahan. AWB tidak ditemukan',
        statusCode: result.statusCode,
      };
      throw new HttpException(errResponse, result.statusCode);
    }

    return {
      destination: _.get(result, 'data.0.branch_name'),
      transport_type: _.get(result, 'data.0.route_transport_map'),
    };
  }

  public async getAwb(payload: CheckAwbRequest): Promise<GetAwbResponse> {
    const result = await this.post('/check-awb', payload);
    if (result.statusCode >= HttpStatus.BAD_REQUEST) {
      const errResponse = {
        error: result.error,
        message: result.message || 'Terjadi kesalahan. Resi tidak ditemukan',
        statusCode: result.statusCode,
      };
      throw new HttpException(errResponse, result.statusCode);
    }

    return {
      awb_item_id: _.get(result, 'data.0.awb_item.0.awb_item_id'),
      weight: _.get(result, 'data.0.awb_item.0.total_weight'),
      transport_type: _.get(result, 'data.0.route_transport_map', ''),
      district_code: _.get(result, 'data.0.district_code'),
      branch_id_lastmile: _.get(result, 'data.0.branch_id_lastmile'),
      representative_id: _.get(
        result,
        'data.0.representative_id_branch_lastmile',
      ),
      representative: _.get(
        result,
        'data.0.representative_code_branch_lastmile',
        '',
      ),
      consignee_name: _.get(result, 'data.0.consignee_name'),
      consignee_address: _.get(result, 'data.0.consignee_address'),
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
            `[ExternalSortationMachineService] Response Error: ${
              errResponse.message
            }`,
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
