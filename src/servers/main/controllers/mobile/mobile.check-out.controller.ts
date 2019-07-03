import { Controller, Post, HttpCode, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { MobileCheckOutPayloadVm } from '../../models/mobile-check-out-payload.vm';
import { MobileCheckOutResponseVm } from '../../models/mobile-check-out-response.vm';
import { MobileCheckOutService } from '../../services/mobile/mobile-check-out.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Mobile Check Out')
@Controller('mobile')
export class MobileCheckOutController {
  constructor(private readonly mobileCheckOutService: MobileCheckOutService) {}

  @Post('checkOut')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCheckOutResponseVm })
  @Transactional()
  public async checkIn(@Body() payload: MobileCheckOutPayloadVm) {
    return this.mobileCheckOutService.checkOut(payload);
  }
}
