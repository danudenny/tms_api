import { ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import {Body, Controller, HttpCode, HttpStatus, Post, UseGuards} from '@nestjs/common';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { SortationL2ListModuleService } from '../../../services/sortation/web/sortation-l2-list.service';

@ApiUseTags('L2 Module')
@Controller('sortation/list')
export class SortationL2ListModuleController {
  constructor( private readonly sortationL2ListModuleService : SortationL2ListModuleService) {
  }

  @HttpCode(HttpStatus.OK)
  @Post('module-finish')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async finishListSortation(@Body() payload: BaseMetaPayloadVm) {
    return this.sortationL2ListModuleService.externalFinishListSortation(payload);
    // return SortationL2ListModuleService.finishListSortation(payload);
  }
}
