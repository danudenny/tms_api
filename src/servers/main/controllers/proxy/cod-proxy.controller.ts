import {
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards, Post, Patch, Delete, Request, Put, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { CodGatewayService } from '../../services/proxy/cod-gateway.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('COD Proxy API')
@Controller('cod-proxy')
@ApiBearerAuth()
export class CodProxyController {

  constructor(
    private codGatewayService: CodGatewayService,
  ) {}

  @Get('*')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async proxyGet(@Request() req, @Res() resp: Response) {
    return this.codGatewayService.routeRequest(req, resp);
  }

  @Post('*')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async proxyPost(@Request() req, @Res() resp: Response) {
    return this.codGatewayService.routeRequest(req, resp);
  }

  @Patch('*')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async proxyPatch(@Request() req, @Res() resp: Response) {
    return this.codGatewayService.routeRequest(req, resp);
  }

  @Put('*')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async proxyPut(@Request() req, @Res() resp: Response) {
    return this.codGatewayService.routeRequest(req, resp);
  }

  @Delete('*')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async proxyDelete(@Request() req, @Res() resp: Response) {
    return this.codGatewayService.routeRequest(req, resp);
  }
}