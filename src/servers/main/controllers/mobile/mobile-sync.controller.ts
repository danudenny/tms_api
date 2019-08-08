import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileSyncPayloadVm } from '../../models/mobile-sync-payload.vm';
import { MobileSyncResponseVm } from '../../models/mobile-sync-response.vm';
import { MobileSyncService } from '../../services/mobile/mobile-sync.service';

@ApiUseTags('Mobile')
@Controller('mobile/sync')
export class MobileSyncController {
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileSyncResponseVm })
  public async sync(@Body() payload: MobileSyncPayloadVm) {
    return MobileSyncService.syncByRequest(payload);
  }
}
