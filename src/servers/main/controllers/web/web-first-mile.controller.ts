import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebScanOutCreateResponseVm } from '../../models/web-scan-out-response.vm';
import { WebScanOutCreateVm } from '../../models/web-scan-out.vm';
import {
    FirstMileDeliveryOutService,
} from '../../services/web/first-mile/first-mile-delivery-out.service';

@ApiUseTags('First Mile Delivery')
@Controller('pod/firstMile')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebFirstMileController {
  constructor() {}
  /**
   * NOTE: Out of Branch first mile
   *
   *
   *
   *
   */

  @Post('createPod')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  public async scanOutCreate(@Body() payload: WebScanOutCreateVm) {
    return FirstMileDeliveryOutService.scanOutCreate(payload);
  }

  // TODO:
  // add endpoint editPodAwb
  // add endpoint editPodBag

  // add endpoint scanOutAwb
  // add endpoint scanOutBag
}
