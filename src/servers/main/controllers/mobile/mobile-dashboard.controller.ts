import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileDashboardFindAllResponseVm } from '../../models/mobile-dashboard.response.vm';
import { MobileInitDataResponseVm } from '../../models/mobile-init-response.vm';
import { MobileDashboardService } from '../../services/mobile/mobile-dashboard.service';
import { MobileInitDataService } from '../../services/mobile/mobile-init-data.service';

@ApiUseTags('Dashboard')
@Controller('mobile')
export class MobileDashboardController {
  @Post('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileDashboardFindAllResponseVm })
  public async dashboard() {
    return MobileDashboardService.getDashboardDataByRequest();
  }

  @Post('initData')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async initData() {
    return MobileInitDataService.getInitDataByRequest();
  }
}
