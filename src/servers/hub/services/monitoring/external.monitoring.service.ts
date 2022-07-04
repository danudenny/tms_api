import { HttpException, Injectable } from '@nestjs/common';

import { ConfigService } from '../../../../shared/services/config.service';
import { HttpRequestAxiosService } from '../../../../shared/services/http-request-axios.service';
import { ExtMonitoringDetailListPayloadVm } from '../../models/monitoring/monitoring-payload.vm';

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
}
