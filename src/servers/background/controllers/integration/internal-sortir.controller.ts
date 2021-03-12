import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { CheckAwbPayloadVm, CheckAwbResponseVM } from '../../models/internal-sortir.vm';
import { InternalSortirService } from '../../services/integration/internal-sortir.service';

@ApiUseTags('Internal Sortir')
@Controller('internal/sortir')
export class InternalSortirController {
  constructor() {}

  @Post('checkAwb')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: CheckAwbResponseVM })
  public async checkSpk(@Body() payload: CheckAwbPayloadVm) {
    return InternalSortirService.checkAwb(payload);
  }
}
