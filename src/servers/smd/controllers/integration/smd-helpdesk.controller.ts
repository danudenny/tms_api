import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiImplicitHeader } from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { UpdateRepresentativeManualPayload } from '../../models/smd-helpdesk-payload.vm';
import { SmdHelpdeskService } from '../../services/integration/smd-helpdesk.service';

@Controller('smd/helpdesk')
export class SmdHelpdeskController {
  constructor() {
  }

  @Post('representative/manual')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async updateRepresentativeCodeManual(@Req() request: any, @Body() payload: UpdateRepresentativeManualPayload) {
    return SmdHelpdeskService.updateRepresentativeCodeManual(payload);
  }


}
