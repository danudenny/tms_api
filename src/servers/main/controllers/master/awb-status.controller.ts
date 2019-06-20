import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BranchPayloadVm } from '../../models/branch.vm';
import { AwbStatusService } from '../../services/master/awb-status.services';
import { AwbStatusFindAllResponseVm, AwbStatusPayloadVm } from '../../models/awb-status.vm';

@ApiUseTags('Master Data')
@Controller('master/awbStatus')
export class AwbStatusController {
  constructor(private readonly awbStatusService: AwbStatusService) {}

  @Post('list')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbStatusFindAllResponseVm })
  public async listAwbStatus(@Body() payload: AwbStatusPayloadVm) {

    return this.awbStatusService.listData(payload);
  }
}
