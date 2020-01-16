import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
    WebScanOutAwbResponseVm, WebScanOutBagResponseVm, WebScanOutCreateResponseVm,
} from '../../models/web-scan-out-response.vm';
import {
    WebScanOutAwbVm, WebScanOutBagVm, WebScanOutCreateVm, WebScanOutEditHubVm, WebScanOutEditVm, TransferBagNumberVm,
} from '../../models/web-scan-out.vm';
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

  @Post('scanOut/create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  public async scanOutCreate(@Body() payload: WebScanOutCreateVm) {
    return FirstMileDeliveryOutService.scanOutCreate(payload);
  }

  @Post('scanOut/updateAwb')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  public async scanOutUpdateAwb(@Body() payload: WebScanOutEditVm) {
    return FirstMileDeliveryOutService.scanOutUpdateAwb(payload);
  }

  @Post('scanOut/updateBag')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  public async scanOutUpdateBag(@Body() payload: WebScanOutEditHubVm) {
    return FirstMileDeliveryOutService.scanOutUpdateBag(payload);
  }

  @Post('scanOut/awb')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  public async scanOutAwb(@Body() payload: WebScanOutAwbVm) {
    return FirstMileDeliveryOutService.scanOutAwb(payload);
  }

  @Post('scanOut/bag')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutBagResponseVm })
  public async findAllBag(@Body() payload: WebScanOutBagVm) {
    return FirstMileDeliveryOutService.scanOutBag(payload);
  }

  @Post('transfer/bagNumber')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutBagResponseVm })
  public async transferAwbDelivery(@Body() payload: TransferBagNumberVm) {
    return FirstMileDeliveryOutService.transferBagNumber(payload);
  }
}
