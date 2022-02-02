import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '../../../../shared/services/config.service';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthService } from '../../../../shared/services/auth.service';

@Injectable()
export class GatewayService {

  private config;

  constructor() {
    this.config = ConfigService.get('proxy');
  }

  public async routeRequest(req: any, resp: Response) {
    const options: AxiosRequestConfig = {
      method: req.method,
      headers: req.headers,
      data: req.body,
      timeout: this.config.apiTimeoutMs,
    };

    options.url = this.config.apiInternalBaseUrl + this.getDestination(req.url);

    const authMeta = AuthService.getAuthMetadata();
    options.headers['x-user-id'] = authMeta.userId.toString();
    options.headers['x-channel-id'] = authMeta.clientId.toString();
    delete options.headers['host'];

    if (options.url.includes('export')) {
      options.responseType = 'stream';
    }

    return axios.request(options)
      .then(function(response) {
        let isCD = false;
        for (const key in response.headers) {
          if (key != 'transfer-encoding') {
            resp.setHeader(key, response.headers[key]);
          }
          if (key == 'content-disposition') {
            isCD = true;
          }
        }
        resp.status(response.status);
        if (!isCD) {
          resp.send(response.data);
        } else {
          response.data.pipe(resp);
        }
      })
      .catch(function(err) {
        console.log('[Pod-Proxy-Gateway] error api ',
          options.url,
          '\n payload: ',
          options,
          '\n error: ',
          err.message,
        );

        if (err.response) {
          throw new BadRequestException(err.response.data);
        }
        throw new BadRequestException(err.stack);
      });
  }

  private getDestination(path: string) {
    let destPath;
    const url = path.replace('/pod-proxy', '');
    const service = url.split('/')[1];

    const cfg = this.config.allowedService[service];

    if (!cfg) {
      throw new BadRequestException('Unforwardable request');
    }

    const replaceService = '/' + service;
    destPath = cfg.destination + url.replace(replaceService, '');

    return destPath;
  }
}
