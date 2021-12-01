import express = require('express');
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
  Get,
  Query,
  Response,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import {
  WebDoPodCreateReturnResponseVm,
  WebScanAwbReturnResponseVm,
  WebScanOutReturnListResponseVm,
  WebScanOutReturnGroupListResponseVm,
  WebReturnListResponseVm,
  WebAwbReturnSyncResponseVm,
} from '../../models/first-mile/do-pod-return-response.vm';
import {
  PhotoReturnDetailVm,
  PrintDoPodReturnPayloadQueryVm,
  PrintDoPodReturnVm,
  WebAwbReturnSyncPayloadVm,
  WebDoPodCreateReturnPayloadVm,
  WebScanAwbReturnPayloadVm,
} from '../../models/first-mile/do-pod-return-payload.vm';
import { PhotoResponseVm } from '../../models/bag-order-detail-response.vm';
import { ResponseMaintenanceService } from '../../../../shared/services/response-maintenance.service';
import { FirstMileDoPodReturnService } from '../../services/web/first-mile/first-mile-do-pod-return.service';

@ApiUseTags('Web Do Pod Return')
@Controller('web/firstMile/return')
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

  @Post('syncReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbReturnSyncResponseVm })
  public async syncAwb(@Body() payload: WebAwbReturnSyncPayloadVm) {
    return FirstMileDoPodReturnService.syncAwbReturn(payload);
  }

  @Post('print/store')
  @ApiBearerAuth()
  public async storePrintDoPodReturn(
    @Body() payloadBody: PrintDoPodReturnVm,
  ) {
    return FirstMileDoPodReturnService.storePrintDoPodReturn(payloadBody);
  }

  @Get('print/execute')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async executePrintDoPodReturn(
    @Query() queryParams: PrintDoPodReturnPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    await ResponseMaintenanceService.userIdNotNull(queryParams.userId);
    return FirstMileDoPodReturnService.executePrintDoPodReturn(
      serverResponse,
      queryParams,
    );
  }

  @Get('print/do-pod-return')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printDoPodReturn(
    @Query() queryParams: PrintDoPodReturnPayloadQueryVm,
    @Response() serverResponse: express.Response,
  ) {
    await ResponseMaintenanceService.userIdNotNull(queryParams.userId);
    return FirstMileDoPodReturnService.printDoPodReturnByRequest(serverResponse, queryParams);
  }

  @Post('photoDetail')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: PhotoResponseVm })
  public async photoDetail(@Body() payload: PhotoReturnDetailVm) {
    return FirstMileDoPodReturnService.getPhotoReturnDetail(payload);
  }
}