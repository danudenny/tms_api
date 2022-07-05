import { HttpException, Injectable } from '@nestjs/common';

import { ConfigService } from '../../../../shared/services/config.service';
import { HttpRequestAxiosService } from '../../../../shared/services/http-request-axios.service';
import { ExtMonitoringDetailListPayloadVm } from '../../models/monitoring/monitoring-payload.vm';
import { BaseMonitoringHubPackage, PayloadMonitoringHubPackageList } from '../../models/monitoring/monitoring-hub-package.vm';

@Injectable()
export class ExternalHubMonitoringService {
  constructor(private readonly httpRequestService: HttpRequestAxiosService) {}

  private readonly BASE_URL = ConfigService.get('hubMonitoring.baseUrl');

  public async getDetail(
    params: ExtMonitoringDetailListPayloadVm,
  ): Promise<any> {
    const { type, ...payload } = params;
    const url = `${this.BASE_URL}/monitoring/${type}/list`;
    try {
      const response = await this.httpRequestService
        .post(url, payload)
        .toPromise();
      return response;
    } catch (err) {
      if (err.response) {
        const status = err.response.status || 400;
        const errResponse = {
          message: err.response.data && err.response.data.error,
          statusCode: status,
        };
        throw new HttpException(errResponse, status);
      }
      throw err;
    }
  }

  public async generateReportHub(report_type: string, payload: BaseMonitoringHubPackage): Promise<any> {
    try {
      const url = `${this.BASE_URL}/reporting/${report_type}/generate`;
      /*const url = `https://swagger.s.sicepat.tech/operation/sortation/sortation/api/v1/reporting/${report_type}/generate`;
      const config = { headers: {
        'accept': 'application/json',
        'x-username': 'username',
        'x-source': 'source service',
        'x-channel-id': 'channel tribe',
        'Content-Type': 'application/json',
      }};*/
      const response = await this.httpRequestService.post(url, payload).toPromise();
      return response;
    } catch (err) {
      if (err.response) {
        const status = err.response.status || 400;
        const errResponse = {
          message: err.response.data && err.response.data.error,
          statusCode: status,
        };
        throw new HttpException(errResponse, status);
      }
      throw err;
    }

}

  public async getListReporting(report_type: string, payload: PayloadMonitoringHubPackageList): Promise<any> {
    try {
      const url = `${this.BASE_URL}/reporting/${report_type}/list`;
      /*const url = `https://swagger.s.sicepat.tech/operation/sortation/sortation/api/v1/reporting/${report_type}/list`;
      const config = { headers: {
        'accept': 'application/json',
        'x-username': 'username',
        'x-source': 'source service',
        'x-channel-id': 'channel tribe',
        'Content-Type': 'application/json',
      }};*/
      const response = await this.httpRequestService.post(url, payload).toPromise();
      return response;
    } catch (err) {
      if (err.response) {
        const status = err.response.status || 400;
        const errResponse = {
          message: err.response.data && err.response.data.error,
          statusCode: status,
        };
        throw new HttpException(errResponse, status);
      }
      throw err;
    }

  }

  public async getTotal(params: any): Promise<any> {
    const url = `${this.BASE_URL}/monitoring/total/list`;
    try {
      const response = await this.httpRequestService
          .post(url, params)
          .toPromise();
      return response;
    } catch (err) {
      if (err.response) {
        const status = err.response.status || 400;
        const errResponse = {
          message: err.response.data && err.response.data.error,
          statusCode: status,
        };
        throw new HttpException(errResponse, status);
      }
      throw err;
    }
  }
}
