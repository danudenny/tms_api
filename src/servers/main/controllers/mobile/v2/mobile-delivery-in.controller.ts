import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { V2MobileScanInBranchResponseVm, MobileScanInBagBranchVm } from '../../../models/mobile-scanin.vm';
import { LastMileDeliveryInService } from '../../../services/mobile/mobile-last-mile-delivery-in.service';

@ApiUseTags('Mobile Delivery In V2')
@Controller('mobile/v2/pod/scanIn')
export class V2MobileDeliveryInController {
  constructor() {}

  @Post('branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: V2MobileScanInBranchResponseVm })
  public async scanInBranchV2(@Body() payload: MobileScanInBagBranchVm) {
    return LastMileDeliveryInService.scanInBranchV2(payload);
  }
}
