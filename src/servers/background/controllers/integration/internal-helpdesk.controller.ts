import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import { Transactional } from 'src/shared/external/typeorm-transactional-cls-hooked/Transactional';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { HelpdeskPayloadVm, HelpdeskResponseVM } from '../../models/internal/helpdesk.vm';
import { InternalHelpdeskService } from '../../services/integration/internal-helpdesk.service';

@ApiUseTags('Integration Internal')
@Controller('integration/internal')
export class InternalHelpdeskController {
  constructor() {}

  @Post('helpdesk')
  @Transactional()
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: HelpdeskResponseVM })
  public async checkSpk(@Body() payload: HelpdeskPayloadVm) {
    return InternalHelpdeskService.checkAwb(payload);
  }
}
