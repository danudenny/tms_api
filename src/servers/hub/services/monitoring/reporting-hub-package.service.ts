import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { MetaService } from '../../../../shared/services/meta.service';
import { BaseMonitoringHubPackage, PayloadMonitoringHubPackageList } from '../../models/monitoring/monitoring-hub-package.vm';
import { ExternalHubMonitoringService } from './external.monitoring.service';

const typeReporting = [
  'reporting-paket-hub',
  'reporting-lebih-sortir',
  'reporting-mesin-sortir',
];

@Injectable()
export class ReportingHubPackageService {
  constructor(private readonly extMonitoringService: ExternalHubMonitoringService) {}

  public async PackageHubGenerate(payload: BaseMonitoringHubPackage): Promise<any> {
    const authMeta = AuthService.getAuthData();

    if (!typeReporting.includes(payload.report_type)) {
      throw new UnprocessableEntityException('Jenis reporting tidak ditemukan!');
    }

    payload.employee_id = Number(authMeta.employeeId);
    try {
      const responData = await this.extMonitoringService.generateReportHub(payload.report_type, payload);
      return responData;
    } catch (error) {
      return error.message;
    }

  }

  public async PackageHubList(payload: PayloadMonitoringHubPackageList): Promise<any> {
    const authMeta = AuthService.getAuthData();

    if (!typeReporting.includes(payload.report_type)) {
      throw new UnprocessableEntityException('Jenis reporting tidak ditemukan!');
    }
    payload.employee_id = Number(authMeta.employeeId);
    try {
      const responData = await this.extMonitoringService.getListReporting(payload.report_type, payload);
      const result = {};
      result['statusCode'] = responData.statusCode;
      result['data'] = responData.data.data;
      result['paging'] = MetaService.set(payload.page, payload.limit, responData.data.paging.total_data);

      return result;
    } catch (error) {
      return error.message;
    }
  }

}
