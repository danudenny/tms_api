import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Delete } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { CheckSpkVm, CheckSpkResponseVM, CheckSpkPayloadVm } from '../../models/partner/diva.vm';
import { DeleteTaxResponseVM, DeteleTaxPayloadVm, UpdateTaxPayloadVm, UpdateTaxResponseVM, ExportHandoverSigesitResponseVM } from '../../models/partner/internal-tms.vm';
import { InternalTmsService } from '../../services/integration/internal-tms.service';
import { PartnerDivaService } from '../../services/integration/partner-diva.service';

@ApiUseTags('Internal Tax')
@Controller('internal/tax')
export class InternalTmsController {
  constructor() {}

  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: DeleteTaxResponseVM })
  public async deleteAwb(@Body() payload: DeteleTaxPayloadVm) {
    return InternalTmsService.deleteAwb(payload);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: UpdateTaxResponseVM })
  public async updateAwb(@Body() payload: UpdateTaxPayloadVm) {
    return InternalTmsService.updateAwb(payload);
  }

  @Get('exportHandoverSigesit')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: ExportHandoverSigesitResponseVM })
  public async exportHandoverSigesit(@Body() payload: any) {
    return InternalTmsService.exportHandoverSigesit(payload);
  }
}
