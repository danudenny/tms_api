import { Controller, Post, HttpCode, UseGuards, Body, HttpStatus, Req } from '@nestjs/common';
import { MobileCheckInService } from '../../services/mobile/mobile-check-in.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { MobileCheckInPayloadVm } from '../../models/mobile-check-in-payload.vm';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { ImageUploadService } from '../../../../shared/services/image-upload.service';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';

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
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckInResponseVm })
  public async checkInForm(
    @Req() request,
  ) {
    // @Body() payload: MobileCheckInPayloadVm,
    // payload: MobileCheckInPayloadVm;
    // TODO: file upload image
    const objImage = await ImageUploadService.fileUpload(request);
    PinoLoggerService.debug(objImage, '############# HELLOOOOO');

    return { status: 200 };
  }
}
