import {BadRequestException, Injectable} from '@nestjs/common';
import {ConfigService} from '../../../../shared/services/config.service';
import {AuthService} from '../../../../shared/services/auth.service';
import axios from 'axios';
import {MetaService} from '../../../../shared/services/meta.service';

@Injectable()
export class RedshiftReportingService {

  private config;

  constructor() {
    this.config = ConfigService.get('reportingService');
  }

  async fetchReport(
    page: number,
    size: number,
    reportType: string,
  ) {
    const url = this.config.baseUrl + this.config.path.report;
    const authMeta = AuthService.getAuthData();
    const offset = (page - 1) * size;

    const options = {
      params: {
        employee: authMeta.userId,
        report_type: reportType,
        limit: size,
        offset,
      },
    };

    return axios.get(url, options)
      .then(function(response) {
        const total = response.data.data.total_count;

        const result = { data: response.data.data.report_queue };
        result['paging'] = MetaService.set(page, size, total);

        return result;
      })
      .catch(function(err) {
        if (err.response) {
          throw new BadRequestException(err.response.data);
        }
        throw err;
      });
  }
}
