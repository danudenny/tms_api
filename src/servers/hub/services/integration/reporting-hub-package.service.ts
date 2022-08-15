import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from '../../../../shared/services/auth.service';
import { BaseMonitoringHubPackage, PayloadMonitoringHubPackageList } from '../../models/monitoring-hub-package.vm';

@Injectable()
export class ReportingHubPackageService {

  static async PackageHubGenerate(payload: BaseMonitoringHubPackage): Promise<any> {
    let respon: any;
    switch (payload.report_type) {
      case 'paketHub':
        respon = await this.generateReportApi(payload, 'reporting-paket-hub');
        break;
      case 'lebihSortir':
        respon = await this.generateReportApi(payload, 'reporting-lebih-sortir');
        break;
      case 'mesinSortir':
        respon = await this.generateReportApi(payload, 'reporting-mesin-sortir');
        break;
      default:
        throw new BadRequestException('Jenis reporting tidak ditemukan!');
    }
    return respon;

  }

  static  async generateReportApi(payload: BaseMonitoringHubPackage, report_type: string): Promise<any> {
    const dummyRespon = {
      code: '200000',
      statusCode: 200,
      message: 'success',
      data: {
        queue_id: 123,
      },
    };
    return dummyRespon;
  }

  static async PackageHubList(payload: PayloadMonitoringHubPackageList): Promise<any> {

    let respon: any;
    switch (payload.report_type) {
      case 'paketHub':
        respon = await this.listReportApi(payload, 'reporting-paket-hub');
        break;
      case 'lebihSortir':
        respon = await this.listReportApi(payload, 'reporting-lebih-sortir');
        break;
      case 'mesinSortir':
        respon = await this.listReportApi(payload, 'reporting-mesin-sortir');
        break;
      default:
        throw new BadRequestException('Jenis reporting tidak ditemukan!');
    }
    return respon;

  }

  static  async listReportApi(payload: PayloadMonitoringHubPackageList, report_type: string): Promise<any> {
    const dummyRespon = {
      code: '200000',
      statusCode: 200,
      message: 'success',
      data : {
            data: [
                {
                    report_queue_id: 123,
                    created_date: '2022-06-28',
                    updated_date: '2022-06-28',
                    employee_id: 123,
                    file_name: 'reporting|Semua_Cabang_vendor_Magelang',
                    status: 4,
                    report_type: 'monitoring_paket_hub',
                    list_url: [
                        'http://www..',
                        'http://www..',
                        'http://www..',
                    ],
                    version: '',
                    branch_name: 'Semua Cabang',
                    vendor_name: 'Magelang',
                },
            ],
            paging: {
                current_page: 1,
                next_page: 2,
                prev_page: 0,
                total_page: 2,
                total_data: 18,
                limit: 10,
            },
        },
    };

    return dummyRespon;
  }
}
