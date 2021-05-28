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
import { FirstMileDoPodReturnService } from '../../services/web/first-mile/first-mile-do-pod-return.sevice';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import {
  WebDoPodCreateReturnResponseVm,
  WebScanAwbReturnResponseVm,
  WebScanOutReturnListResponseVm,
  WebScanOutReturnGroupListResponseVm,
  WebReturnListResponseVm,
} from '../../models/first-mile/do-pod-return-response.vm';
import {
  WebDoPodCreateReturnPayloadVm,
  WebScanAwbReturnPayloadVm,
} from '../../models/first-mile/do-pod-return-payload.vm';
@ApiUseTags('Web Do Pod Return')
@Controller('web/pod/return/scanOut')
export class WebDoPodReturnController {
  constructor() {}

  @Post('createReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDoPodCreateReturnResponseVm })
  @Transactional()
  public async createReturn(@Body() payload: WebDoPodCreateReturnPayloadVm) {
    return FirstMileDoPodReturnService.createDoPodReturn(payload);
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

  @Post('awbReturnList')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebScanOutReturnListResponseVm })
  public async awbReturnList(@Body() payload: BaseMetaPayloadVm) {
    return FirstMileDoPodReturnService.findAllScanOutAwbReturnList(payload);
  }

  @Post('awbReturnDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebReturnListResponseVm })
  public async awbReturnDetail(@Body() payload: BaseMetaPayloadVm) {
    return FirstMileDoPodReturnService.detailReturn(payload);
  }

  // @Post('do-pod-deliver/store')
  // @ApiBearerAuth()
  // public async storePrintDoPodDeliver(
  //   @Body() payloadBody: PrintDoPodDeliverVm,
  // ) {
  //   return PrintByStoreService.storePrintDoPodDeliver(payloadBody);
  // }
}
