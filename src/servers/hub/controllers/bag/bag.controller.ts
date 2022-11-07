import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  HUB_BAG_SERVICE,
  HubBagService,
} from '../../interfaces/hub-bag.interface';
import {
  HubBagInsertAwbPayload,
  HubBagInsertAwbResponse,
} from '../../models/bag/hub-bag.payload';

@ApiUseTags('Hub Bags Controller')
@Controller('hub/bag')
export class HubBagController {
  constructor(
    @Inject(HUB_BAG_SERVICE) private readonly service: HubBagService,
  ) {}

  @Post('awb')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public insertAWB(
    @Body() payload: HubBagInsertAwbPayload,
  ): Promise<HubBagInsertAwbResponse> {
    return this.service.insertAWB(payload);
  }
}
