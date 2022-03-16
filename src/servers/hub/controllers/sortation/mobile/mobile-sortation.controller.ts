import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { MobileSortationArrivalPayloadVm } from '../../../models/sortation/mobile/mobile-sortation-arrival.payload.vm';
import { MobileSortationService } from '../../../services/sortation/mobile/mobile-sortation.service';

@ApiUseTags('Mobile Sortation')
@Controller('mobile/sortation')
export class MobileSortationController {
  constructor() {}

  @Post('arrival')
  @Transactional()
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async scanInMobileSortation(@Body() payload: MobileSortationArrivalPayloadVm) {
    return MobileSortationService.scanInMobileSortation(payload);
  }

}
