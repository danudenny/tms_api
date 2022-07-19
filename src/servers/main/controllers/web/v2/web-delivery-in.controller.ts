import { Body, Controller, HttpCode, HttpStatus, Get, Post, UseGuards, Query, Response } from '@nestjs/common';
import express = require('express');

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { V2WebScanInBranchResponseVm, V2WebScanInBagBranchVm} from '../../../models/web-scanin-v2.vm';
import { WebDeliveryInService } from '../../../services/web/web-delivery-in.service';
import { LastMileDeliveryInService } from '../../../services/web/last-mile/last-mile-delivery-in.service';

@ApiUseTags('Web Delivery In V2')
@Controller('web/v2/pod/scanIn')
export class V2WebDeliveryInController {
  constructor(
    private readonly webDeliveryService: WebDeliveryInService,
  ) {}

  
  // NOTE: endpoint scan in branch v2, handle bag number or awb number
  // along with prioritazion data
  @Post('branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: V2WebScanInBranchResponseVm })
  public async scanInBranch(@Body() payload: V2WebScanInBagBranchVm) {
    return LastMileDeliveryInService.scanInBranchV2(payload);
  }
}
