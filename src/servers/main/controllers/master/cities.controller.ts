import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Param, Get } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { CityFindAllResponseVm } from '../../models/master/city.vm';
import { CitiesService } from '../../services/master/cities.service';

@ApiUseTags('Master Data')
@Controller('master/cities')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
export class CitiesController {
  constructor() {}

  @Post('list/:provinceId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CityFindAllResponseVm })
  public async findAll(
    @Param('provinceId') provinceId: number,
    @Body() payload: BaseMetaPayloadVm,
  ) {
    return CitiesService.findAllProvinceId(payload, provinceId);
  }
}
