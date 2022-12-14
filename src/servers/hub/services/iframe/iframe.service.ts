import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { IFRAME_CONFIG, IframeConfig } from '../../interfaces/iframe.service';
import {
  IframeResponse,
  MetabaseIframePayload,
} from '../../models/iframe/iframe-payload';

@Injectable()
export class IframeService {
  constructor(@Inject(IFRAME_CONFIG) private readonly config: IframeConfig) {}

  public getMetabaseUrl(payload: MetabaseIframePayload): IframeResponse {
    const { url, secret, expiry } = this.config.metabase;
    const jwtPayload = {
      resource: { dashboard: Number(payload.dashboard) },
      params: {},
      exp: Math.round(Date.now() / 1000) + expiry,
    };
    const token = jwt.sign(jwtPayload, secret);
    const iframeUrl = `${url}/embed/dashboard/${token}`;

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully generated metabase iframe url',
      data: { url: iframeUrl },
    } as IframeResponse;
  }
}
