import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { HubBagListService, HUB_BAG_LIST_SERVICE } from '../../interfaces/bag-list.interface';
import { CheckBagGpListResponVm } from '../../models/bag/hub-bag-list.respone';
import { CheckAwbDetailResponVm } from '../../models/check-awb/check-awb-list.response';

@ApiUseTags('Hub Bags List Controller')
@Controller('hub/bag')
export class BagListController {
  constructor(
    @Inject(HUB_BAG_LIST_SERVICE) private readonly service: HubBagListService,
  ) {}

  @Post('list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public listBag(
    @Body() payload: BaseMetaPayloadVm,
  ): Promise<CheckBagGpListResponVm> {
    return this.service.listBag(payload);
  }

  @Post('detail')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public detailBag(
    @Body() payload: BaseMetaPayloadVm,
  ): Promise<CheckAwbDetailResponVm> {
    return this.service.detailBag(payload);
  }

}
