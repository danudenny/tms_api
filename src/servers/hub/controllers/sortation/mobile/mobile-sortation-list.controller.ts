import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiUseTags} from '../../../../../shared/external/nestjs-swagger';
import {ResponseSerializerOptions} from '../../../../../shared/decorators/response-serializer-options.decorator';
import {AuthenticatedGuard} from '../../../../../shared/guards/authenticated.guard';
import {PermissionTokenGuard} from '../../../../../shared/guards/permission-token.guard';
import {MobileSortationListService} from '../../../services/sortation/mobile/mobile-sortation-list.service';
import {MobileSortationScanoutDetailPayloadVm} from '../../../models/sortation/mobile/mobile-sortation-scanout-detail.payload.vm';
import {MobileSortationScanoutDetailBagPayloadVm} from '../../../models/sortation/mobile/mobile-sortation-scanout-detail-bag.payload.vm';

@ApiUseTags('Mobile Sortation List')
@Controller('mobile/sortation')
export class MobileSortationListController {
  constructor() {}
  @Post('list')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async getScanoutSortationMobileList() {
    return MobileSortationListService.getScanoutSortationMobileList();
  }

  @Post('detail')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async getScanoutSortationMobileDetail(@Body() payload: MobileSortationScanoutDetailPayloadVm) {
    return MobileSortationListService.getScanoutSortationMobileDetail(payload);
  }

  @Post('detail/bag')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  public async getScanoutSortationMobileDetailBag(@Body() payload: MobileSortationScanoutDetailBagPayloadVm) {
    return MobileSortationListService.getScanoutSortationMobileDetailBag(payload);
  }
}
