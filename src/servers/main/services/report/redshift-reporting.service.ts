import {BadRequestException, HttpStatus, Injectable} from '@nestjs/common';
import {ConfigService} from '../../../../shared/services/config.service';
import {AuthService} from '../../../../shared/services/auth.service';
import axios from 'axios';
import {MetaService} from '../../../../shared/services/meta.service';
import { BaseMetaPayloadVm } from 'src/shared/models/base-meta-payload.vm';
import moment = require('moment');
import { RequestErrorService } from 'src/shared/services/request-error.service';

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

  async generateReport(reportType: string, queryParam: string) {
    const authMeta = AuthService.getAuthMetadata();
    const filename = `report_${reportType}_${moment().format('YYYYMMDDHHmmss')}`;
    const url = this.config.baseUrl + this.config.path.report;
    if (!queryParam){
      RequestErrorService.throwObj(
        {
          message: 'Invalid Payload',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    //send to report service
    const options = {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        employee: authMeta.userId,
      },
    };

    const qs = require('querystring');
    const body = {
      query_encoded: Buffer.from(queryParam).toString('base64'),
      filename,
      report_type: reportType,
    };

    try {
      const response = await axios.post(
        url,
        qs.stringify(body),
        options,
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new BadRequestException(error.response.data);
      }
      throw error;
    }
  }
}
