import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiUseTags,
  ApiBearerAuth,
  ApiOkResponse,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import {
  MobileSyncPayloadVm,
  MobileSyncImagePayloadVm,
  MobileSyncImageDataPayloadVm,
} from '../../../models/mobile-sync-payload.vm';
import {
  MobileSyncImageResponseVm,
  MobileSyncDataResponseVm,
  MobileSyncImageDataResponseVm,
} from '../../../models/mobile-sync-response.vm';
import { ResponseSerializerOptions } from '../../../../../shared/decorators/response-serializer-options.decorator';
import { V1MobileSyncService } from '../../../services/mobile/v1/mobile-sync.service';
import { Transactional } from '../../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
// TODO: to be removed
@ApiUseTags('Mobile Sync Data')
@Controller('mobile/v1/sync')
export class V1MobileSyncController {
  //  TODO: to be removed
  // @Post()
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ResponseSerializerOptions({ disable: true })
  // @ApiOkResponse({ type: MobileSyncDataResponseVm })
  // public async sync(@Body() payload: MobileSyncPayloadVm) {
  //   return V1MobileSyncService.syncByRequest(payload);
  // }

  // TODO: to be removed
  // @Post('image')
  // @HttpCode(HttpStatus.OK)
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  // @ApiOkResponse({ type: MobileSyncImageResponseVm })
  // @Transactional()
  // public async checkInForm(
  //   @Body() payload: MobileSyncImagePayloadVm,
  //   @UploadedFile() file,
  // ) {
  //   return V1MobileSyncService.syncImage(payload, file);
  // }

  @Post('imageData')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileSyncImageDataResponseVm })
  @Transactional()
  public async syncImageForm(
    @Body() payload: MobileSyncImageDataPayloadVm,
    @UploadedFile() file,
  ) {
    return V1MobileSyncService.syncImageData(payload, file);
  }
}
