import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { HubMonitoringDetailListPayloadVm } from '../../models/monitoring/monitoring-payload.vm';
import { ExternalHubMonitoringService } from './external.monitoring.service';

@Injectable()
export class HubPackagesMonitoringService {
  constructor(private readonly extMonitoringService: ExternalHubMonitoringService) {}

  public async getDetail(
    params: HubMonitoringDetailListPayloadVm,
  ): Promise<any> {
    const { type, ...payload } = params;
    this.validateDetailType(type);
    const response = await this.extMonitoringService.getDetail(
      type,
      payload,
    );
    return response;
  }

  private validateDetailType(type: string): void {
    const validTypes = [
      'masuk',
      'dropoff',
      'lebih-sortir',
      'total-sortir',
      'sortir-manual',
      'sortir-mesin',
      'tidak-sortir',
      'keluar',
      'tidak-keluar',
    ];
    if (!validTypes.includes(type)) {
      throw new UnprocessableEntityException(`Invalid type: ${type}`);
    }
  }
}
