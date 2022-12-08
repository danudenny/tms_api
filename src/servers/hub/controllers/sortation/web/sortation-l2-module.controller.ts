import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import {Body, Controller, HttpCode, HttpStatus, Inject, Post, UseGuards} from '@nestjs/common';
import { Transactional } from '../../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import {
  SortationL2ModuleFinishManualPayloadVm,
  SortationL2ModuleHandoverPayloadVm,
  SortationL2ModuleSearchPayloadVm,
} from '../../../models/sortation/web/sortation-l2-module-search.payload.vm';
import { SortationL2ModuleService } from '../../../services/sortation/web/sortation-l2-module.service';

@ApiUseTags('L2 Module')
@Controller('sortation/module')
export class SortationL2ModuleController {
  constructor(
      private readonly moduleService: SortationL2ModuleService,
  ) {
  }

  @HttpCode(HttpStatus.OK)
  @Post('search')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async searchSortation(@Body() payload: SortationL2ModuleSearchPayloadVm) {
    return this.moduleService.externalSearchSortation(payload);
    // return SortationL2ModuleService.searchSortation(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('finish')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async finishManualSortation(@Body() payload: SortationL2ModuleFinishManualPayloadVm) {
    return this.moduleService.externalFinishSortation(payload);
    // return SortationL2ModuleService.finishManualSortation(payload);
  }

  @Post('handover')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async handoverSortation(@Body() payload: SortationL2ModuleHandoverPayloadVm) {
    return SortationL2ModuleService.handoverModuleSortation(payload);
  }

}
