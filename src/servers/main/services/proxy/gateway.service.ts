import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '../../../../shared/services/config.service';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthService } from '../../../../shared/services/auth.service';

@Injectable()
export class GatewayService {

  private config;

  constructor() {
    this.config = ConfigService.get('proxy');
  }

  public async routeRequest(req: any) {
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

    return axios.request(options)
      .then(function(response) {
        return response.data;
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

    destPath = cfg.destination + url.replace(cfg.service, '');

    return destPath;
  }
}
