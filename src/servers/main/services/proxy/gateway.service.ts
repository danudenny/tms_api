import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '../../../../shared/services/config.service';
import axios, { AxiosRequestConfig } from 'axios';

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

    options.url = this.config.apiGatewayBaseUrl + req.url.replace('/pod-proxy', '');
    options.headers["api-key"] = this.config.apiKey;

    // remove host for api gateway purpose
    delete options.headers["host"];

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
}
