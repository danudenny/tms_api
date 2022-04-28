import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { MobileSortationArrivalPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-arrival.payload.vm';
import { MobileSortationService } from '../../../services/sortation/mobile/mobile-sortation.service';
import { MobileSortationDepaturePayloadVm } from '../../../models/sortation/mobile/mobile-sortation-depature.payload.vm';
import { MobileSortationEndPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-end.payload.vm';
import { MobileSortationContinuePayloadVm } from '../../../models/sortation/mobile/mobile-sortation-continue.payload.vm';
import { FileInterceptor } from '@nestjs/platform-express';
import { MobileSortationUploadImagePayloadVm } from '../../../models/sortation/mobile/mobile-sortation-upload-image.payload.vm';
import { MobileSortationCancelPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-cancel.payload.vm';
import { MobileSortationProblemPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-problem.payload.vm';
import {
  MobileSortationHandoverPayloadVm
} from '../../../models/sortation/mobile/mobile-sortation-handover.payload.vm';

@ApiUseTags('Mobile Sortation')
@Controller('mobile/sortation')
export class MobileSortationController {
  constructor() {
  }

  @Post('departure')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanOutMobileSortation(@Body() payload: MobileSortationDepaturePayloadVm) {
    return MobileSortationService.scanOutMobileSortation(payload);
  }

  @Post('arrival')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanInMobileSortation(@Body() payload: MobileSortationArrivalPayloadVm) {
    return MobileSortationService.scanInMobileSortation(payload);
  }

  @Post('problem')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async problemMobileSortation(@Body() payload: MobileSortationProblemPayloadVm, @UploadedFile() file) {
    return MobileSortationService.problemMobileSortation(payload, file);
  }

  @Post('handover')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async handoverMobileSortation(@Body() payload: MobileSortationHandoverPayloadVm) {
    return MobileSortationService.handoverMobileSortation(payload);
  }

  @Post('cancel')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanInCancelMobileSortation(@Body() payload: MobileSortationCancelPayloadVm) {
    return MobileSortationService.scanInCancelMobileSortation(payload);
  }

  @Post('end')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async scanInEndMobileSortation(@Body() payload: MobileSortationEndPayloadVm) {
    return MobileSortationService.scanInEndMobileSortation(payload);
  }

  @Post('continue')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async continueMobileSortation(@Body() payload: MobileSortationContinuePayloadVm) {
    return MobileSortationService.continueMobileSortation(payload);
  }

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async uploadImageMobileSortation(
    @Body() payload: MobileSortationUploadImagePayloadVm,
    @UploadedFile() file,
  ) {
      return MobileSortationService.uploadImageMobileSortation(payload, file);
  }

}
