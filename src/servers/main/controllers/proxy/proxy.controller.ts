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
  UseGuards,
} from '@nestjs/common';
import { NotificationProxyService } from '../../services/proxy/notification.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';

@ApiUseTags('POD Proxy API')
@Controller('pod-proxy')
@ApiBearerAuth()
export class PodProxyController {
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
}
