import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { PunishmentBranchListResponse } from '../../models/punishment-response.vm';
import { PunishmentBranchListPayload } from '../../models/punishment.vm';
import { WebPunishmentService } from '../../services/web/web-punishment.service';

@ApiUseTags('Web Awb Return')
@Controller('punishment')
export class WebPunishmentController {

  @Post('branch/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PunishmentBranchListResponse })
  public async branchList(@Body() payload: PunishmentBranchListPayload) {
    return WebPunishmentService.findEmployeeofBranch(payload);
  }

}