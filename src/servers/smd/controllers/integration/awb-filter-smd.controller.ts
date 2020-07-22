import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { SmdAwbSortResponseVm, SmdAwbSortPayloadVm } from '../../models/smd-awb-sort.vm';
import { SmdAwbFilterService } from '../../services/integration/smd-awb-filter.service';

@ApiUseTags('AWB Filter SMD')
@Controller('smd/awb/filter')
export class AwbFilterSmdController {
  constructor(
    private readonly smdAwbFilterService: SmdAwbFilterService,
  ) {}
  @Post('sortCity')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: SmdAwbSortResponseVm })
  public async findAllAwbSortirList(@Body() payload: SmdAwbSortPayloadVm) {
    return this.smdAwbFilterService.sortAwbHub(payload);
  }
}
