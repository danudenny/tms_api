import axios from 'axios';
import { ConfigService } from '../../../../shared/services/config.service';

import { HubMonitoringDetailListVm } from '../../models/monitoring/monitoring-payload.vm';

export class ExternalHubMonitoringService {
  private static BASE_URL = ConfigService.get('hubMonitoring.baseUrl');

  public static async getDetail(
    type: string,
    payload: HubMonitoringDetailListVm,
  ): Promise<any> {
    const options = {
      // headers: {},
      url: `${this.BASE_URL}/monitoring/${type}/list`,
      method: 'POST',
      data: payload,
    };
    const response = await axios(options);

    return response;
  }
}
