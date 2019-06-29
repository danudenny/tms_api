import { Controller, Post, HttpCode, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { MobileCheckInService } from '../../services/mobile/mobile-check-in.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/shared/guards/authenticated.guard';
import { ApiUseTags } from 'src/shared/external/nestjs-swagger';
import { MobileCheckInPayloadVm } from '../../models/mobile-check-in-payload.vm';
import { MobileCheckInResponseVm } from '../../models/mobile-check-in-response.vm';
import { Transactional } from 'src/shared/external/typeorm-transactional-cls-hooked';

@ApiUseTags('Mobile Check In')
@Controller('mobile')
export class MobileCheckInController {
  constructor(
    private readonly mobileCheckInService: MobileCheckInService,
  ) {}

  @Post('checkIn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MobileCheckInResponseVm })
  @Transactional()
  public async checkIn(@Body() payload: MobileCheckInPayloadVm) {
    return this.mobileCheckInService.checkIn(payload);
  }
}
