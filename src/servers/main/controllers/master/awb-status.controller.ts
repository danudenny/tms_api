import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { AwbStatusService } from '../../services/master/awb-status.service';
import { AwbStatusFindAllResponseVm, AwbStatusPayloadVm } from '../../models/awb-status.vm';

@ApiUseTags('Master Data')
@Controller('master/awbStatus')
export class AwbStatusController {
  constructor(
    private readonly awbStatusService: AwbStatusService,
  ) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbStatusFindAllResponseVm })
  public async listAwbStatus(@Body() payload: AwbStatusPayloadVm) {

    return this.awbStatusService.listData(payload);
  }
}
