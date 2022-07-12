import { BadRequestException, Injectable } from '@nestjs/common';
import _ = require('lodash');
import moment = require('moment');

import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ExtMonitoringDetailListPayloadVm } from '../../models/monitoring/monitoring-payload.vm';
import {
  HubMonitoringDetailListResponseVm,
  HubMonitoringTotalListResponseVm,
} from '../../models/monitoring/monitoring-response.vm';
import { ExternalHubMonitoringService } from './external.monitoring.service';

@Injectable()
export class HubPackagesMonitoringService {
  constructor(
    private readonly extMonitoringService: ExternalHubMonitoringService,
  ) {}

  public async getTotal(payload: BaseMetaPayloadVm): Promise <HubMonitoringTotalListResponseVm> {
    const extPayload = this.getExtMonitoringPayload(payload);
    const response = await this.extMonitoringService.getTotal(extPayload);
    const result = new HubMonitoringTotalListResponseVm();
    result.statusCode = response.status_code;
    result.message = 'Sukses get monitoring hub total';
    result.data = _.get(response, 'data.list') || [];
    result.buildPagingWithPayload(
        payload,
        _.get(response, 'data.paging.total_data', 1),
    );
    return result;
  }

  public async getDetail(
    payload: BaseMetaPayloadVm,
  ): Promise<HubMonitoringDetailListResponseVm> {
    const extPayload = this.getExtMonitoringPayload(payload);
    this.validateDetailType(extPayload.type);
    const response = await this.extMonitoringService.getDetail(extPayload);
    const result = new HubMonitoringDetailListResponseVm();
    result.statusCode = response.status_code;
    result.message = 'Sukses ambil daftar detail monitoring hub';
    result.data = _.get(response, 'data.list') || [];
    result.buildPagingWithPayload(
      payload,
      _.get(response, 'data.paging.total_data', 1),
    );

    return result;
  }

  private getExtMonitoringPayload(
    payload: BaseMetaPayloadVm,
  ): ExtMonitoringDetailListPayloadVm {
    // format: fieldname;sqloperator;isRequired
    const filterFields = [
      'scanDate;gte;true',
      'scanDate;lt;true',
      'branchId;eq;true',
      'awbNumber;eq;false',
      'bagNumber;eq;false',
      'type;eq;false',
    ];
    const filters = filterFields.map(fieldName => {
      const [field, op, isRequired] = fieldName.split(';');
      const filter = payload.filters
        ? payload.filters.find(
            f => f.field === field && (op ? f.operator === op : true),
          )
        : null;
      if (!filter && isRequired === 'true') {
        throw new BadRequestException(`${field} filter not found`);
      }
      return filter;
    });
    const result = {
      start_date: filters[0].value,
      end_date: moment(filters[1].value)
        .subtract(1, 'd')
        .format('YYYY-MM-DD'),
      branch_id: filters[2].value,
      page: payload.page,
      limit: payload.limit,
    } as ExtMonitoringDetailListPayloadVm;

    if (filters[3]) {
      result.awb_number = filters[3].value;
    }
    if (filters[4]) {
      result.bag_number = filters[4].value;
    }
    if (filters[5]) {
      result.type = filters[5].value;
    }

    return result;
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
      throw new BadRequestException(`Invalid type: ${type}`);
    }
  }
}
