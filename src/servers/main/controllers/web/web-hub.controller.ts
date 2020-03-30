import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
    WebHubScanOutBagResponseVm,
} from '../../models/web-scan-out-response.vm';
import {
    TransferBagNumberHubVm,
} from '../../models/web-scan-out.vm';
import { HubTransitDeliveryService } from '../../services/web/hub-transit/hub-transit-delivery.service';

@ApiUseTags('Hub Delivery')
@Controller('pod/hub')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebHubController {
  constructor() {}
  /**
   * NOTE: Out of Branch HUB
   *
   *
   *
   *
   */

  @Post('transfer/bagNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebHubScanOutBagResponseVm })
  public async transferAwbDelivery(@Body() payload: TransferBagNumberHubVm) {
    return HubTransitDeliveryService.transferBagNumber(payload);
  }
}
