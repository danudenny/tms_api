import { Injectable, NestMiddleware } from '@nestjs/common';
import express = require('express');
import * as requestIp from 'request-ip';
import url = require('url');

import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class HeaderMetadataMiddleware implements NestMiddleware {
  use(req: express.Request, res: express.Response, next: () => void) {
    this.parseRequestIp(req);
    this.parseRequestUserAgent(req);
    this.parsePermissionToken(req);
    this.parsePartnerToken(req);
    next();
  }

  parseRequestIp(req: express.Request) {
    const clientRequestIp = requestIp.getClientIp(req);
    if (clientRequestIp) {
      RequestContextMetadataService.setMetadata('REQUEST_IP', clientRequestIp);
    }
  }

  parseRequestUserAgent(req: express.Request) {
    RequestContextMetadataService.setMetadata(
      'REQUEST_USER_AGENT',
      req.headers['user-agent'],
    );
  }

  parsePermissionToken(req: express.Request) {
    let permissionToken;
    if (req.headers && req.headers['x-permission-token']) {
      permissionToken = req.headers['x-permission-token'];
    } else {
      const urlParts = url.parse(req.url, true);
      const reqQuery = urlParts.query;
      if (reqQuery && reqQuery.permissionToken) {
        permissionToken = reqQuery.permissionToken;
      }
    }

    if (permissionToken) {
      RequestContextMetadataService.setMetadata(
        'PERMISSION_TOKEN',
        permissionToken,
      );
    }
  }

  parsePartnerToken(req: express.Request) {
    let partnerToken;
    if (req.headers && req.headers['x-api-key']) {
      partnerToken = req.headers['x-api-key'];
    } else {
      const urlParts = url.parse(req.url, true);
      const reqQuery = urlParts.query;
      if (reqQuery && reqQuery.partnerToken) {
        partnerToken = reqQuery.partnerToken;
      }
    }

    if (partnerToken) {
      RequestContextMetadataService.setMetadata(
        'PARTNER_TOKEN',
        partnerToken,
      );
    }
  }
}
