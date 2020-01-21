import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileScanInBranchResponseVm, MobileScanInBagBranchVm} from '../../models/mobile-scanin.vm';
import { LastMileDeliveryInService } from '../../services/mobile/mobile-last-mile-delivery-in.service';

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
}
