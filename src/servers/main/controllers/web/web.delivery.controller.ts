import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { awbRepository } from '../../../../shared/orm-repository/MobileDelivery.repository';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { toInteger } from 'lodash';
import { MetaService } from '../../../../shared/services/meta.service';
import { WebScanInVm } from '../../models/WebScanIn.vm';
import { WebScanInFindAllResponseVm } from '../../models/WebScanIn.response.vm';
const logger = require('pino')();

@ApiUseTags('Scan In Awb')
@Controller('api/web/pod/scanIn/awb')
export class WebDeliveryController {
  constructor(
    private readonly awbRepository: awbRepository,
  ) { }

  @Post()
  @ApiOkResponse({ type: WebScanInFindAllResponseVm })
  public async Web(@Body() payload: WebScanInVm) {
    const Web = await this.awbRepository.create(
      // payload.clientId,
    );

    return Web;
  }
}
