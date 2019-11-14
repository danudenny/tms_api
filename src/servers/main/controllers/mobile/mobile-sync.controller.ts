import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ApiUseTags, ApiBearerAuth, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { MobileSyncPayloadVm, MobileSyncImagePayloadVm } from '../../models/mobile-sync-payload.vm';
import { MobileSyncResponseVm, MobileSyncImageResponseVm } from '../../models/mobile-sync-response.vm';
import { MobileSyncService } from '../../services/mobile/mobile-sync.service';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Mobile')
@Controller('mobile/sync')
export class MobileSyncController {
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSyncResponseVm })
  public async sync(@Body() payload: MobileSyncPayloadVm) {
    return MobileSyncService.syncByRequest(payload);
  }

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileSyncImageResponseVm })
  public async checkInForm(
    @Body() payload: MobileSyncImagePayloadVm,
    @UploadedFile() file,
  ) {
    return MobileSyncService.syncImage(payload, file);
  }
}
