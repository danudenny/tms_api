import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Param, Get } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { DistrictFindAllResponseVm } from '../../models/master/district.vm';
import { DistrictsService } from '../../services/master/districts.service';

@ApiUseTags('Master Data')
@Controller('master/districts')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
export class DistrictsController {
  constructor() {}

  @Post('list/:cityId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DistrictFindAllResponseVm })
  public async findAll(
    @Param('cityId') cityId: number,
    @Body() payload: BaseMetaPayloadVm,
  ) {
    return DistrictsService.findAllCityId(payload, cityId);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DistrictFindAllResponseVm })
  public async findAllList(
    @Body() payload: BaseMetaPayloadVm,
  ) {
    return DistrictsService.findAllListCityId(payload);
  }
}
