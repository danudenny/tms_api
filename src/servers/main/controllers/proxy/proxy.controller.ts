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
  UseGuards, Post, Patch, Delete, Request, Put,
} from '@nestjs/common';
import { NotificationProxyService } from '../../services/proxy/notification.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { GatewayService } from '../../services/proxy/gateway.service';

@ApiUseTags('POD Proxy API')
@Controller('pod-proxy')
@ApiBearerAuth()
export class PodProxyController {

  constructor(
    private gatewayService: GatewayService,
  ) {}

  @Get('pod-notification/message/info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async notificationInfo() {
    return NotificationProxyService.notificationInfo();
  }

  @Get('pod-notification/message')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async notificationDetail(@Query()
  queryParams: {
    notificationId: string;
  }) {
    return NotificationProxyService.notificationDetail(
      queryParams.notificationId,
    );
  }

  @Get('pod-notification/message/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async notificationList(@Query()
  queryParams: {
    page: string;
    limit: string;
  }) {
    return NotificationProxyService.notificationList(
      queryParams.page,
      queryParams.limit,
    );
  }

  @Get('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyGet(@Request() req) {
    return this.gatewayService.routeRequest(req);
  }

  @Post('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyPost(@Request() req) {
    return this.gatewayService.routeRequest(req);
  }

  @Patch('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyPatch(@Request() req) {
    return this.gatewayService.routeRequest(req);
  }

  @Put('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyPut(@Request() req) {
    return this.gatewayService.routeRequest(req);
  }

  @Delete('*')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  public async proxyDelete(@Request() req) {
    return this.gatewayService.routeRequest(req);
  }
}
