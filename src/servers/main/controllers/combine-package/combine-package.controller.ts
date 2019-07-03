import { Controller, Get, Query, Post, UseGuards, HttpCode, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { GabunganPayloadVm } from '../../models/gabungan-payload.vm';
import { RedeliveryService } from '../../services/mobile/redelivery.services';
import { GabunganFindAllResponseVm } from '../../models/gabungan.response.vm';
import { DeliveryFilterPayloadVm } from '../../models/mobile-dashboard.vm';
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
