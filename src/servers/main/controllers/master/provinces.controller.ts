import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Param, Get } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { ProvincesService } from '../../services/master/provinces.service';
import { ProvinceFindAllResponseVm } from '../../models/master/province.vm';

@ApiUseTags('Master Data')
@Controller('master/provinces')
@ApiBearerAuth()
@UseGuards(AuthenticatedGuard)
export class ProvincesController {
  constructor() {}

  @Post('list/:countryId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ProvinceFindAllResponseVm })
  public async findAll(
    @Param('countryId') countryId: number,
    @Body() payload: BaseMetaPayloadVm,
  ) {
    return ProvincesService.findAllCountryId(payload, countryId);
  }
}
