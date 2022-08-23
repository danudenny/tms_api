import { Controller, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { PodProsparkResponse } from '../../models/pod-prospark-response.vm'
import { PodProsparkService } from '../../services/web/pod-prospark.service';
 
@ApiUseTags('POD Prospark')
@Controller('v1/pod/prospark')
export class LastMileProsparkController {
  @Get('getCallback')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PodProsparkResponse })
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async listReturnCancel() {
    return PodProsparkService.getCallback();
  }
}

