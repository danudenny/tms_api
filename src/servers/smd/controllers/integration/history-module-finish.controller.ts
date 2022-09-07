import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { HistoryModuleFinishService } from '../../services/integration/history-module-finish.service';

@ApiUseTags('SMD History')
@Controller('smd/history')
export class HistoryModuleFinishController {
  @Post('history-module-finish/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async getHistoryModuleList(@Body() payload: BaseMetaPayloadVm) {
      return HistoryModuleFinishService.getHistoryModuleFinish(payload);
  }
}
