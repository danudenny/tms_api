import { Controller, Post, UseGuards, HttpCode, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { AwbStatusService } from '../../services/master/awb-status.service';
import { AwbStatusFindAllResponseVm, AwbStatusNonDeliveFindAllResponseVm } from '../../models/awb-status.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

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
  public async listAwbStatus(@Body() payload: BaseMetaPayloadVm) {
    return this.awbStatusService.listData(payload);
  }
  @Post('listNonDelive')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbStatusNonDeliveFindAllResponseVm })
  public async listAwbStatusNonDelive(@Body() payload: BaseMetaPayloadVm) {
    return this.awbStatusService.listDataNonDelive(payload);
  }
}
