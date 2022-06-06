import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '../../../../shared/services/config.service';
import axios, { AxiosRequestConfig } from 'axios';
import { AuthService } from '../../../../shared/services/auth.service';

@Injectable()
export class CodGatewayService {

  private config;

  constructor() {
    this.config = ConfigService.get('codProxy');
  }

  async routeRequest(req: any, resp: Response) {
    const options: AxiosRequestConfig = {
      method: req.method,
      headers: req.headers,
      data: req.body,
      timeout: this.config.apiTimeoutMs,
    };

    options.url = this.config.apiInternalBaseUrl + this.getDestination(req.url);

    const permissionPayload = AuthService.getPermissionTokenPayload();
    const authMeta = AuthService.getAuthMetadata();

    options.headers['x-user-id'] = authMeta.userId.toString();
    options.headers['x-channel-id'] = authMeta.clientId.toString();
    
    options.headers['x-role-id'] = permissionPayload.roleId;
    options.headers['x-role-name'] = permissionPayload.roleName;
    options.headers['x-branch-id'] = permissionPayload.branchId;
    options.headers['x-is-head-office'] = permissionPayload.isHeadOffice;
    
    const uuidv1 = require('uuid/v1');
    const requestId = uuidv1();
   
    options.headers['x-request-id'] = requestId;

    delete options.headers['host'];

    const fileSvcAuth = req.headers['x-filesvc-auth'];
    if (fileSvcAuth) {
      // replace bearer token to call filesvc
      options.headers['authorization'] = fileSvcAuth;
    }

    let isStream = false;

    if (options.url.includes('export') || options.url.includes('download')) {
      options.responseType = 'stream';
      isStream = true;
    }

    return axios.request(options)
      .then(function(response) {
        for (const key in response.headers) {
          if (key != 'transfer-encoding') {
            resp.setHeader(key, response.headers[key]);
          }
        }
        resp.status(response.status);
        if (isStream) {
          response.data.pipe(resp);
        } else {
          resp.send(response.data);
        }
      })
      .catch(function(err) {
        console.log('[Cod-Proxy-Gateway] error api ',
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
    const url = path.replace('/cod-proxy', '');
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