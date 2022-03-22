import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Transactional } from '../../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { SortationL2ModuleSearchPayloadVm } from '../../../models/sortation/web/sortation-l2-module-search.payload.vm';
import { SortationL2ModuleService } from '../../../services/sortation/web/sortation-l2-module.service';

@ApiUseTags('L2 Module')
@Controller('sortation/module')
export class SortationL2ModuleController {
  constructor() {
  }

  @Post('search')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async searchSortation(@Body() payload: SortationL2ModuleSearchPayloadVm) {
    return SortationL2ModuleService.searchSortation(payload);
  }
}