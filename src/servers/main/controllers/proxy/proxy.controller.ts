import {
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';
import {
  Controller,
  Query,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards, Post, Patch, Delete, Request, Put, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { GatewayService } from '../../services/proxy/gateway.service';

@ApiUseTags('POD Proxy API')
@Controller('pod-proxy')
@ApiBearerAuth()
export class PodProxyController {

  constructor(
    private gatewayService: GatewayService,
  ) {}

  @Get('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyGet(@Request() req, @Res() resp: Response) {
    return this.gatewayService.routeRequest(req, resp);
  }

  @Post('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyPost(@Request() req, @Res() resp: Response) {
    return this.gatewayService.routeRequest(req, resp);
  }

  @Patch('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyPatch(@Request() req, @Res() resp: Response) {
    return this.gatewayService.routeRequest(req, resp);
  }

  @Put('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyPut(@Request() req, @Res() resp: Response) {
    return this.gatewayService.routeRequest(req, resp);
  }

  @Delete('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyDelete(@Request() req, @Res() resp: Response) {
    return this.gatewayService.routeRequest(req, resp);
  }
}
