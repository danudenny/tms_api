import { Inject, Injectable } from '@nestjs/common';
import _ = require('lodash');

import { BagService } from '../interfaces/bag.service.interface';
import {
  CreateBagPayload,
  CreateBagResponse,
  InsertAWBPayload,
  InsertAWBResponse,
} from '../models/bag-service.payload';
import { ExternalService } from './base-external.service';
import { HttpRequestAxiosService } from './http-request-axios.service';

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
}
