import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import {MappingDoSmdResponseVm} from '../../models/master/do-smd.vm';
import {DoSmdService} from '../../services/master/do-smd.service';

@ApiUseTags('Master Data')
@Controller('master')
export class DoSmdController {
  constructor() {}

  @Post('doSmd/list')
  @Transactional()
  @ApiOkResponse({ type: MappingDoSmdResponseVm })
  @UseGuards(AuthenticatedGuard , PermissionTokenGuard)
  public async mappingDoSMD(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return DoSmdService.mappingDoSMD(payload);
  }
}
