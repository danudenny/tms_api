// #region import
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { LastMileDeliveryOutService } from '../../services/mobile/mobile-last-mile-delivery-out.service';
import {
  TransferAwbDeliverVm,
  ScanAwbDeliverPayloadVm,
} from '../../models/mobile-scanout.vm';
import { MobileScanOutCreateDeliveryVm } from '../../models/mobile-scanout.vm';
import {
  MobileScanOutAwbResponseVm,
  CreateDoPodResponseVm,
} from '../../models/mobile-scanout-response.vm';

// #endregion

@ApiUseTags('Mobile Delivery Out')
@Controller('mobile/pod/scanOut')
export class MobileDeliveryOutController {
  constructor() {}

  @Post('delivery')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileScanOutAwbResponseVm })
  @Transactional()
  public async transferAwbDelivery(@Body() payload: TransferAwbDeliverVm) {
    return LastMileDeliveryOutService.scanOutDeliveryAwb(payload);
  }

  @Post('awbDeliver')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileScanOutAwbResponseVm })
  @Transactional()
  public async scanAwbDeliverMobile(@Body() payload: ScanAwbDeliverPayloadVm) {
    return LastMileDeliveryOutService.scanAwbDeliverMobile(payload);
  }

  @Post('createDeliver')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: CreateDoPodResponseVm })
  @Transactional()
  public async scanOutCreateDelivery() {
    return LastMileDeliveryOutService.createDeliveryDoPod();
  }
}
