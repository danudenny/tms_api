import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
    ProofDeliveryPayloadVm, ProofDeliveryResponseVm,
} from '../../models/last-mile/proof-delivery.vm';
import {
    LastMileDeliveryOutService,
} from '../../services/web/last-mile/last-mile-delivery-out.service';
import { TransferAwbDeliverVm } from '../../models/web-scan-out.vm';
import { WebScanOutAwbResponseVm, WebAwbThirdPartyListResponseVm } from '../../models/web-scan-out-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbThirdPartyVm, AwbThirdPartyUpdateResponseVm } from '../../models/last-mile/awb-third-party.vm';

@ApiUseTags('Last Mile Delivery')
@Controller('pod/lastMile')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebLastMileController {
  constructor() {}
  /**
   * NOTE: Out of Branch last mile
   *
   *
   *
   *
   */

  @Post('transfer/delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  public async transferAwbDelivery(@Body() payload: TransferAwbDeliverVm) {
    return LastMileDeliveryOutService.transferAwbNumber(payload);
  }

  @Post('proof/delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProofDeliveryResponseVm })
  public async listProofDelivery(@Body() payload: ProofDeliveryPayloadVm) {
    return LastMileDeliveryOutService.listProofDelivery(payload);
  }

  @Post('awbThirdPartyList')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebAwbThirdPartyListResponseVm })
  public async awbThirdPartyList(@Body() payload: BaseMetaPayloadVm) {
    return LastMileDeliveryOutService.awbThirdPartyList(payload);
  }

  @Post('awbThirdParty/update')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbThirdPartyUpdateResponseVm })
  public async awbThirdParty(@Body() payload: AwbThirdPartyVm) {
    return LastMileDeliveryOutService.awbThirdPartyUpdate(payload);
  }
}
