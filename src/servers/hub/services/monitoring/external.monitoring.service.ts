import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';

import { ConfigService } from '../../../../shared/services/config.service';
import { HttpRequestAxiosService } from '../../../../shared/services/http-request-axios.service';
import {
  BaseMonitoringHubPackage,
  PayloadMonitoringHubPackageList,
} from '../../models/monitoring/monitoring-hub-package.vm';
import { ExtMonitoringDetailListPayloadVm } from '../../models/monitoring/monitoring-payload.vm';

@Injectable()
export class ExternalHubMonitoringService {
  constructor(private readonly httpRequestService: HttpRequestAxiosService) {}

  private readonly BASE_URL = ConfigService.get('hubMonitoring.baseUrl');

  public getDetail(params: ExtMonitoringDetailListPayloadVm): Promise<any> {
    const { type, ...payload } = params;
    return this.post(`/monitoring/${type}/list`, payload);
  }

  public generateReportHub(
    report_type: string,
    payload: BaseMonitoringHubPackage,
  ): Promise<any> {
    return this.post(`/reporting/${report_type}/generate`, payload);
  }

  public getListReporting(
    report_type: string,
    payload: PayloadMonitoringHubPackageList,
  ): Promise<any> {
    return this.post(`/reporting/${report_type}/list`, payload);
  }

  public getTotal(params: any): Promise<any> {
    return this.post('/monitoring', params);
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
        throw new HttpException(errResponse, status);
      }
      throw err;
    }
  }
}
