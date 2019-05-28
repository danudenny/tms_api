import { Controller, Get, Query, Post, UseGuards, HttpCode, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { GabunganPayloadVm } from '../../models/gabungan.vm';
import { RedeliveryService } from '../../services/mobile/redelivery.services';
import { GabunganFindAllResponseVm } from '../../models/gabungan.response.vm';
import { DeliveryFilterPayloadVm } from '../../models/mobile-dashboard.vm';
import { GabunganService } from '../../services/resi gabungan/gabunganservice';


@ApiUseTags('Resi Bag')
@Controller('api/resi/gabungan')
export class GabunganController {
  constructor(private readonly gabunganService: GabunganService) {}

  @Post('bag')
  @HttpCode(200)
  @ApiOkResponse({ type: GabunganFindAllResponseVm })
  public async findallResiGabungan(@Body() payload: GabunganPayloadVm) {

    return this.gabunganService.findallResiGabungan(payload);
    }
  }
