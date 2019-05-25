import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PodScanRepository } from '../../../../shared/orm-repository/pod-scan.repository';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebDeliveryFindAllResponseVm } from '../../models/web-delivery.response.vm';
import { WebDeliveryListService } from '../../services/web/web-delivery-list.service';
import { MobileDeliveryFindAllResponseVm } from '../../models/mobile-delivery.response.vm';
import { WebDeliveryVm, WebDeliveryFilterPayloadVm } from '../../models/web-delivery.vm';
import { getManager } from 'typeorm';
import { Awb } from 'src/shared/orm-entity/awb';
import { AwbItem } from 'src/shared/orm-entity/awb-item';
const logger = require('pino')();

@ApiUseTags('Scan In List')
@Controller('api/web/pod/scanIn/list1')
export class WebDeliveryControllerList {
  constructor(
    private readonly webdelivery: WebDeliveryListService,
  ) { }


  @Post('delivery')
  @ApiOkResponse({ type: WebDeliveryFindAllResponseVm })
  public async findAllDeliveryList(@Body() payload: WebDeliveryFilterPayloadVm) {
    return this.webdelivery.findAllDeliveryList(payload);
    }
  }
