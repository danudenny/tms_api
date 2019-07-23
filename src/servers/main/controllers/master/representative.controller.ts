import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { RepresentativeFindAllResponseVm } from '../../models/representative-response.vm';
import { RepresentativeService } from '../../services/master/representative.service';

@ApiUseTags('Master Data')
@Controller('master/representative')
export class RepresentativeController {
  constructor(private readonly representativeService: RepresentativeService) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: RepresentativeFindAllResponseVm })
  public async findAllList(@Body() payload: BaseMetaPayloadVm) {
    return this.representativeService.findAllByRequest(payload);
  }
}
