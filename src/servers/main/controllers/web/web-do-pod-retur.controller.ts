import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';

import { WebDoPodCreateReturnResponseVm, WebScanAwbReturnResponseVm, WebScanOutReturnGroupListResponseVm } from '../../models/first-mile/do-pod-retur-response.vm';
import { WebDoPodCreateReturnPayloadVm, WebScanAwbReturnPayloadVm } from '../../models/first-mile/do-pod-retur-payload.vm';
import { FirstMileDoPodReturnService } from '../../services/web/first-mile/first-mile-do-pod-retur.sevice';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Web Do Pod Retur')
@Controller('web/pod/retur/scanOut')
export class WebDoPodReturController {
  constructor() {}

  @Post('createReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDoPodCreateReturnResponseVm })
  @Transactional()
  public async createReturn(@Body() payload: WebDoPodCreateReturnPayloadVm) {
    return FirstMileDoPodReturnService.creatDoPodReturn(payload);
  }

  @Post('awbReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebScanAwbReturnResponseVm })
  @Transactional()
  public async scanAwbReturn(@Body() payload: WebScanAwbReturnPayloadVm) {
    return FirstMileDoPodReturnService.scanAwbReturn(payload);
  }

  @Post('awbReturnGroupList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutReturnGroupListResponseVm })
  public async awbReturnGroupList(@Body() payload: BaseMetaPayloadVm) {
    return FirstMileDoPodReturnService.findAllScanOutAwbReturnGroupList(payload);
  }

  // @Post('do-pod-deliver/store')
  // @ApiBearerAuth()
  // public async storePrintDoPodDeliver(
  //   @Body() payloadBody: PrintDoPodDeliverVm,
  // ) {
  //   return PrintByStoreService.storePrintDoPodDeliver(payloadBody);
  // }
}
