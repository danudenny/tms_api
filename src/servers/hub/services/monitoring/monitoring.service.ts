import { UnprocessableEntityException } from '@nestjs/common';
import { HubMonitoringDetailListPayloadVm } from '../../models/monitoring/monitoring-payload.vm';
import { ExternalHubMonitoringService } from './external.monitoring.service';

export class HubPackagesMonitoringService {
  public static async getDetail(
    params: HubMonitoringDetailListPayloadVm,
  ): Promise<any> {
    const { type, ...payload } = params;
    this.validateDetailType(type);
    const response = await ExternalHubMonitoringService.getDetail(
      type,
      payload,
    );
    return response;
  }

  private static validateDetailType(type: string): void {
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
