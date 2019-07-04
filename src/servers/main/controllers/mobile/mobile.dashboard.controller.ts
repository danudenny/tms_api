import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { DashboardService } from '../../services/mobile/dashboard.service';
import { MobileDashboardFindAllResponseVm } from '../../models/mobile-dashboard.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileInitDataResponseVm } from '../../models/mobile-init-response.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Dashboard')
@Controller('mobile')
export class MobileDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileDashboardFindAllResponseVm })
  public async findalldashboard() {
    return this.dashboardService.findalldashboard();
  }

  @Post('initData')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async initData() {
    return this.dashboardService.initData();
  }
}
