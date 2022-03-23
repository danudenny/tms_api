import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { LogwayzimPayloadVm } from '../../models/log-wayzim.response.vm';
import { ApiImplicitHeader } from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { LogWayzimServices } from '../../services/integration/log-wayzim.service';

@Controller('log-wayzim')
export class LogWayzimController {
  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  public async awb(@Body() payload: LogwayzimPayloadVm) {
    return LogWayzimServices.insertBranchSortirSummary(payload);
  }
}