// #region import
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { WebScanInBagVm } from '../../models/web-scanin-bag.vm';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked';
import { WebDeliveryOutService } from '../../services/web/web-delivery-out.service';
import { WebScanInBag1ResponseVm } from '../../models/web-scanin-awb.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import {
  WebScanOutAwbVm,
  WebScanOutCreateVm,
  WebScanOutAwbListPayloadVm,
} from '../../models/web-scan-out.vm';
import {
  WebScanOutAwbResponseVm,
  WebScanOutCreateResponseVm,
  WebScanOutAwbListResponseVm,
} from '../../models/web-scan-out-response.vm';
// #endregion

@ApiUseTags('Web Delivery Out')
@Controller('web/pod/scanOut')

export class WebDeliveryOutController {
  constructor(
    private readonly webDeliveryOutService: WebDeliveryOutService,
  ) { }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutCreateResponseVm })
  @Transactional()
  public async scanOutCreate(@Body() payload: WebScanOutCreateVm) {
    // NOTE: Scan Out With Awb
    // Buat Surat Jalan (table do_pod, do_pod_detail, do_pod_history)
    // Tipe Surat Jalan https://sketch.cloud/s/EKdwq/a/xpEAb8
    // 1. Criss Cross
    // 2. Transit
    // 3. Retur (resi yang berstatus retur)
    // 4. Antar (Sigesit)

    // TODO:
    return this.webDeliveryOutService.scanOutCreate(payload);

  }

  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutAwbResponseVm })
  @Transactional()
  public async scanOutAwb(@Body() payload: WebScanOutAwbVm) {
    // NOTE: Scan Out With Awb
    // Buat Surat Jalan (table do_pod, do_pod_detail, do_pod_history)
    // Tipe Surat Jalan https://sketch.cloud/s/EKdwq/a/xpEAb8
    // 1. Criss Cross
    // 2. Transit
    // 3. Retur (resi yang berstatus retur)
    // 4. Antar (Sigesit)

    // TODO:

    return this.webDeliveryOutService.scanOutAwb(payload);
  }

  @Post('awbList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutAwbListResponseVm })
  public async awbList(@Body() payload: WebScanOutAwbListPayloadVm) {

    return this.webDeliveryOutService.scanOutAwbList(payload);
  }

  @Post('bagList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutAwbListResponseVm })
  public async bagList(@Body() payload: WebScanOutAwbListPayloadVm) {

    return this.webDeliveryOutService.scanOutAwbList(payload);
  }

  @Post('bag')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanInBag1ResponseVm})
  public async findAllBag(@Body() payload: WebScanInBagVm) {
    // TODO: ??
    return null; // this.webDeliveryService.findAllBag(payload);
    }

}
