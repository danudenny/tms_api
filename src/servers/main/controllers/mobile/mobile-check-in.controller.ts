import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { MobileCheckInPayloadVm } from '../../models/mobile-check-in-payload.vm';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import { MobileCheckInService } from '../../services/mobile/mobile-check-in.service';

@ApiUseTags('Mobile Check In')
@Controller('mobile')
export class MobileCheckInController {
  constructor(private readonly mobileCheckInService: MobileCheckInService) {}

  @Post('checkIn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckInResponseVm })
  @Transactional()
  public async checkIn(@Body() payload: MobileCheckInPayloadVm) {
    return this.mobileCheckInService.checkIn(payload);
  }

  @Post('checkInForm')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckInResponseVm })
  public async checkInForm(
    @Body() body: MobileCheckInPayloadVm,
    @UploadedFile() file,
  ) {
    const attachment = await AttachmentService.uploadFileBufferToS3(file.buffer, file.originalname, file.mimetype, 'tms-check-in');

    return { status: 200 };
  }
}
