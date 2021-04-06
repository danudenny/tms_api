import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { CheckAwbPayloadVm, CheckAwbResponseVM } from '../../models/hub-machine-sortir.vm';
import { HubMachineSortirService } from '../../services/integration/hub-machine-sortir.service';

@ApiUseTags('Hub Cek Chute Mesin Sortir')
@Controller('internal/sortir')
export class HubMachineSortirController {
  constructor() {}

  @Post('checkAwb')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: CheckAwbResponseVM })
  public async checkSpk(@Body() payload: CheckAwbPayloadVm) {
    return HubMachineSortirService.checkAwb(payload);
  }
}
