import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import express = require('express');
import url = require('url');

import { JwtAccessTokenPayload } from '../interfaces/jwt-payload.interface';
import { AuthService } from '../services/auth.service';
import { RequestContextMetadataService } from '../services/request-context-metadata.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: express.Request, res: express.Response, next: () => void) {
    if (req.headers && req.headers['authorization']) {
      if (req.headers.authorization.indexOf('Basic ') === 0) {
        // Basic Token
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        // TODO: verify auth credentials ??
        const [username, password] = credentials.split(':');
        // const user = await userService.authenticate({ username, password });
      } else {
        // default use JWT Token
        RequestContextMetadataService.setMetadata('REQUEST_AUTH_METHOD', 'JWT_TOKEN');
        const jwtToken = req.headers['authorization'].replace(/^Bearer\s+/, '');
        await this.handleJwtToken(jwtToken);
      }
    } else {
      const urlParts = url.parse(req.url, true);
      const reqQuery = urlParts.query;
      if (reqQuery && reqQuery.accessToken) {
        RequestContextMetadataService.setMetadata(
          'REQUEST_AUTH_METHOD',
          'JWT_TOKEN',
        );
        const jwtToken = reqQuery.accessToken as string;
        await this.handleJwtToken(jwtToken);
      }
    }

    next();
  }

  async handleJwtToken(jwtToken: string) {
    let jwt: { payload: JwtAccessTokenPayload };
    try {
      jwt = this.jwtService.decode(jwtToken, {
        complete: true,
      }) as { payload: JwtAccessTokenPayload };
    } catch (error) {
      throw new UnauthorizedException();
    }

    if (jwt) {
      RequestContextMetadataService.setMetadata('JWT_ACCESS_TOKEN', jwtToken);
      RequestContextMetadataService.setMetadata(
        'JWT_ACCESS_TOKEN_PAYLOAD',
        jwt.payload,
      );
      AuthService.setAuthMetadata({
        clientId: jwt.payload.clientId,
        accessToken: jwtToken,
        userId: jwt.payload.userId,
        username: jwt.payload.username,
        email: jwt.payload.email,
        displayName: jwt.payload.displayName,
        employeeId: jwt.payload.employeeId,
        roles: jwt.payload.roles || [],
      });
    } else {
      throw new UnauthorizedException();
    }
  }
}
