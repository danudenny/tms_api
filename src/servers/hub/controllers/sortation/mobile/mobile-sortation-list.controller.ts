import {Controller, Post, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiOkResponse, ApiUseTags} from '../../../../../shared/external/nestjs-swagger';
import {ResponseSerializerOptions} from "../../../../../shared/decorators/response-serializer-options.decorator";
import {AuthenticatedGuard} from "../../../../../shared/guards/authenticated.guard";
import {PermissionTokenGuard} from "../../../../../shared/guards/permission-token.guard";
import {MobileSortationScanoutListVm} from "../../../models/sortation/mobile/mobile-sortation-scanout-list.vm";
import {MobileSortationListService} from "../../../services/sortation/mobile/mobile-sortation-list.service";

@ApiUseTags('Mobile Sortation List')
@Controller('mobile/sortation')
export class MobileSortationListController {
  constructor() {}
  @Post('list')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSortationScanoutListVm })
  public async getScanoutSortationMobileList() {
    return MobileSortationListService.getScanoutSortationMobileList();
  }
}
