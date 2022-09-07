import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { SortationMasterdataService } from '../services/masterdata-service';

@ApiUseTags('Sortation Masterdata')
@Controller('masterdata')
export class SortationMasterdataController {
  constructor(private readonly service: SortationMasterdataService) {}

  @Post('doSortation/status/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public scanOutList(@Body() payload: BaseMetaPayloadVm) {
    return this.service.getSortationStatus(payload);
  }
}
