import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
    ProofDeliveryResponseVm, ProofTransitResponseVm, ProofValidateTransitResponseVm,
} from '../../models/last-mile/proof-delivery.vm';
import {
    LastMileDeliveryOutService,
} from '../../services/web/last-mile/last-mile-delivery-out.service';
import { TransferAwbDeliverVm, ProofValidateTransitPayloadVm, WebScanOutCreateVm, WebScanOutAwbVm } from '../../models/web-scan-out.vm';
import { WebScanOutAwbResponseVm, WebAwbThirdPartyListResponseVm, WebScanOutCreateResponseVm } from '../../models/web-scan-out-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AwbThirdPartyVm, AwbThirdPartyUpdateResponseVm } from '../../models/last-mile/awb-third-party.vm';
import { LastMileTransitOutService } from '../../services/web/last-mile/last-mile-transit-out.service';

@ApiUseTags('Last Mile Delivery')
@Controller('pod/lastMile')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebLastMileController {
  constructor() {}
  /**
   * NOTE: Out of Branch last mile
   * scanOut/create (Transit)
   * scanOut/awb (Transit)
   *
   *
   */

  @Post('scanOut/create')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  public async scanOutCreate(@Body() payload: WebScanOutCreateVm) {
    return LastMileTransitOutService.scanOutCreate(payload);
  }

  @Post('scanOut/awb')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  public async scanOutAwb(@Body() payload: WebScanOutAwbVm) {
    return LastMileTransitOutService.scanOutAwb(payload);
  }

  @Post('transfer/delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  public async transferAwbDelivery(@Body() payload: TransferAwbDeliverVm) {
    return LastMileDeliveryOutService.transferAwbNumber(payload);
  }

  @Post('proof/delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProofDeliveryResponseVm })
  public async listProofDelivery(@Body() payload: BaseMetaPayloadVm) {
    return LastMileDeliveryOutService.listProofDelivery(payload);
  }

  @Post('proof/transit')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProofTransitResponseVm })
  public async listProofTransit(@Body() payload: BaseMetaPayloadVm) {
    return LastMileDeliveryOutService.listProofTransit(payload);
  }

  @Post('proof/transit/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProofValidateTransitResponseVm })
  public async validateTransit(@Body() payload: ProofValidateTransitPayloadVm) {
    return LastMileDeliveryOutService.validateTransit(payload);
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
