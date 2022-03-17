import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { MobileSortationArrivalPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-arrival.payload.vm';
import { MobileSortationService } from '../../../services/sortation/mobile/mobile-sortation.service';
import { MobileSortationDepaturePayloadVm } from '../../../models/sortation/mobile/mobile-sortation-depature.payload.vm';
import { MobileSortationEndPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-end.payload.vm';
import { MobileSortationContinuePayloadVm } from '../../../models/sortation/mobile/mobile-sortation-continue.payload.vm';
import { FileInterceptor } from '@nestjs/platform-express';
import { MobileSortationUploadImagePayloadVm } from '../../../models/sortation/mobile/mobile-sortation-upload-image.payload.vm';

@ApiUseTags('Mobile Sortation')
@Controller('mobile/sortation')
export class MobileSortationController {
  constructor() {
  }

  @Post('departure')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutMobileSortation(@Body() payload: MobileSortationDepaturePayloadVm) {
    return MobileSortationService.scanOutMobileSortation(payload);
  }

  @Post('arrival')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanInMobileSortation(@Body() payload: MobileSortationArrivalPayloadVm) {
    return MobileSortationService.scanInMobileSortation(payload);
  }

  @Post('end')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanInEndMobileSortation(@Body() payload: MobileSortationEndPayloadVm) {
    return MobileSortationService.scanInEndMobileSortation(payload);
  }

  @Post('continue')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async continueMobileSortation(@Body() payload: MobileSortationContinuePayloadVm) {
    return MobileSortationService.continueMobileSortation(payload);
  }

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @Transactional()
  public async uploadImageMobileSortation(
    @Body() payload: MobileSortationUploadImagePayloadVm,
    @UploadedFile() file,
  ) {
      return MobileSortationService.uploadImageMobileSortation(payload, file);
  }

}
