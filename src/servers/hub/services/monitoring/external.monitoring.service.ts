import { Injectable } from '@nestjs/common';

import { ConfigService } from '../../../../shared/services/config.service';
import { HttpRequestAxiosService } from '../../../../shared/services/http-request-axios.service';
import { HubMonitoringDetailListVm } from '../../models/monitoring/monitoring-payload.vm';

@Injectable()
export class ExternalHubMonitoringService {
  constructor(private readonly httpRequestService: HttpRequestAxiosService) {}

  private readonly BASE_URL = ConfigService.get('hubMonitoring.baseUrl');

  public async getDetail(
    type: string,
    payload: HubMonitoringDetailListVm,
  ): Promise<any> {
    const url = `${this.BASE_URL}/monitoring/${type}/list`;
    const response = await this.httpRequestService.post(url, payload);

    return response;
  }
}
