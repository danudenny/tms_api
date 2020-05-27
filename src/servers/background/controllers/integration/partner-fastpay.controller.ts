import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import {
    CheckDataDropPartnerVm, DropCashLessResponseVM, DropCashlessVm, DropSuccessResponseVm,
} from '../../models/partner/fastpay-drop.vm';
import { PartnerFastpayService } from '../../services/integration/partner-fastpay.service';
import { ResponseMaintenanceService } from '../../../../shared/services/response-maintenance.service';

@ApiUseTags('Integration Drop Partner')
@Controller('integration/partner')
export class PartnerFastpayController {
  constructor() {}

  // @Post('checkData')
  // @HttpCode(HttpStatus.OK)
  // @ApiImplicitHeader({ name: 'x-api-key' })
  // @UseGuards(AuthXAPIKeyGuard)
  // @ApiOkResponse({ type: DropCashLessResponseVM })
  // public async checkDataPickupRequest(@Body() payload: CheckDataDropPartnerVm) {
  //   return PartnerFastpayService.checkDataPickupRequest(payload);
  // }

  @Post('dropCash')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: DropCashLessResponseVM })
  public async dropCash(@Body() payload: DropCashlessVm) {
    // NOTE: handle for message disable this service
    await ResponseMaintenanceService.dropService();
    return PartnerFastpayService.dropCash(payload);
  }

  @Post('dropCashless')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: DropCashLessResponseVM })
  public async dropCashless(@Body() payload: DropCashlessVm) {
    // NOTE: handle for message disable this service
    await ResponseMaintenanceService.dropService();
    return PartnerFastpayService.dropCashless(payload);
  }
}
