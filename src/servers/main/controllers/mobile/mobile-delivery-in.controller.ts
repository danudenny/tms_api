import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileScanInBranchResponseVm, MobileScanInBagBranchVm } from '../../models/mobile-scanin.vm';
import { LastMileDeliveryInService } from '../../services/mobile/mobile-last-mile-delivery-in.service';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { WebDeliveryInService } from '../../services/web/web-delivery-in.service';
import { MobileDeliveryInService } from '../../services/mobile/mobile-delivery-in.service';
import { MobileScanInValidateBranchVm } from '../../models/mobile-delivery.vm';

@ApiUseTags('Mobile Delivery In')
@Controller('mobile/pod/scanIn')
export class MobileDeliveryInController {
  constructor() {}

  @Post('branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileScanInBranchResponseVm })
  public async scanInBranch(@Body() payload: MobileScanInBagBranchVm) {
    return LastMileDeliveryInService.scanInBranch(payload);
  }

  @Post('validateBranch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  // @ApiOkResponse({ type: MobileScanInValidateBranchVm })
  public async validateBranch(@Body() payload: MobileScanInValidateBranchVm) {
    return MobileDeliveryInService.scanInValidateBranch(payload);
  }
}
