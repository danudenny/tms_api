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

@ApiUseTags('Last Mile Delivery')
@Controller('pod/lasttMile')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard, PermissionTokenGuard)
export class WebLasttMileController {
  constructor() {}
  /**
   * NOTE: Out of Branch last mile
   *
   *
   *
   *
   */

  @Post('proof/delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProofDeliveryResponseVm })
  public async listProofDelivery(@Body() payload: ProofDeliveryPayloadVm) {
    return LastMileDeliveryOutService.listProofDelivery(payload);
  }
}
