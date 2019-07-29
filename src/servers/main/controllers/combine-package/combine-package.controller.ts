import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { GabunganPayloadVm } from '../../models/gabungan-payload.vm';
import { GabunganFindAllResponseVm } from '../../models/gabungan.response.vm';
import { GabunganService } from '../../services/combine-package/gabungan.services';

@ApiUseTags('Resi Bag')
@Controller('resi/gabungan')
export class GabunganController {
  constructor(private readonly gabunganService: GabunganService) {}

  @Post('bag')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: GabunganFindAllResponseVm })
  public async gabunganAwb(@Body() payload: GabunganPayloadVm) {

    return this.gabunganService.gabunganAwb(payload);
    }

  }
