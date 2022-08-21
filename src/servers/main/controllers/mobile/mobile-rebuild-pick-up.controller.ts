import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileRebuildPickUpService } from '../../services/mobile/mobile-rebuild-pick-up.service';
import { MobileRebuildPickUpServiceResponse, MobileRebuildPickUpWorkOrderServiceResponse } from '../../models/mobile-rebuild-pick-up-response.vm';
import { MobileRebuildPickUpServicePayload } from '../../models/mobile-rebuild-pick-up-payload.vm';

@ApiUseTags('Mobile Rebuild Pickup Pod')
@Controller('mobile/v1/pod/rebuild-pick-up')
export class MobileRebuildPickupPod {
  @Post('getDeliveryAndCodAmount')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileRebuildPickUpServiceResponse })
  public async getDeliveryAndCodAmount(@Body() payload: MobileRebuildPickUpServicePayload) {
    return MobileRebuildPickUpService.getDeliveryandCodAmount(payload);
  }

  @Post('getPickupAmount/:dateStart/:dateEnd')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileRebuildPickUpWorkOrderServiceResponse })
  public async getPickupAmount(@Body() payload: MobileRebuildPickUpServicePayload) {
    return MobileRebuildPickUpService.getPickupAmount(payload);
  }
}