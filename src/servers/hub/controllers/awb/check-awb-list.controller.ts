import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { CheckAwbListResponVm } from '../../models/check-awb/check-awb-list.response';
import { CheckAwbListService } from '../../services/check-awb/check-awb-list.service';

@ApiUseTags('Check AWB Destination')
@Controller('hub/check-awb')
export class CheckAwbListController {
  constructor(
    private readonly checkAwbService: CheckAwbListService,
  ) {}

  @Post('list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getListCheckAWB(@Body() payload: BaseMetaPayloadVm): Promise<CheckAwbListResponVm> {
    return this.checkAwbService.checkAwbList(payload);
  }

  @Post('detail')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getDetailCheck(@Body() payload: BaseMetaPayloadVm): Promise<CheckAwbListResponVm> {
    return this.checkAwbService.checkAwbDetail(payload);
  }

}
