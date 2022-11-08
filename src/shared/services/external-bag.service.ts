import { Inject, Injectable } from '@nestjs/common';
import _ = require('lodash');

import { BagService } from '../interfaces/bag.service.interface';
import {
  CreateBagPayload,
  CreateBagResponse,
  GetBagPayload,
  GetBagResponse,
  GetBagSummaryResponse,
  InsertAWBPayload,
  InsertAWBResponse,
} from '../models/bag-service.payload';
import { ExternalService } from './base-external.service';
import { HttpRequestAxiosService } from './http-request-axios.service';
import { SharedService } from './shared.service';

export const EXT_BAG_SVC_URL = 'EXT_BAG_SVC_URL';

@Injectable()
export class ExternalBagService extends ExternalService implements BagService {
  constructor(
    protected readonly httpRequestService: HttpRequestAxiosService,
    @Inject(EXT_BAG_SVC_URL) protected readonly BASE_URL: string,
  ) {
    super(httpRequestService, BASE_URL, 'ExternalBagService');
  }

  public async create(payload: CreateBagPayload): Promise<CreateBagResponse> {
    const response = await this.post('/v1/gabung-paket', payload);
    return _.get(response, 'data');
  }

  public async insertAWB(
    payload: InsertAWBPayload,
  ): Promise<InsertAWBResponse> {
    const response = await this.post('/v1/bag/awb', payload);
    return _.get(response, 'data');
  }

  public async getBag(payload: GetBagPayload): Promise<GetBagResponse> {
    const query = SharedService.getHttpQuery(payload);
    const response = await this.get(`/v1/bag-item?${query}`);
    const bag = _.get(response, 'data');
    bag.awbs = bag.awbs ? bag.awbs.map(awb => awb.reference) : [];
    return bag;
  }

  public async getBagSummary(
    payload: GetBagPayload,
  ): Promise<GetBagSummaryResponse> {
    const query = SharedService.getHttpQuery(payload);
    const response = await this.get(`/v1/bag-item?${query}`);
    const bag = _.get(response, 'data');
    bag.awbs = bag.awbs ? bag.awbs.length : 0;
    return bag;
  }
}
