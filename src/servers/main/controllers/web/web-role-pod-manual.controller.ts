import {
    ApiUseTags,
    ApiBearerAuth,
    ApiOkResponse,
  } from '../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body, Delete, Param, Get, Response, Query } from '@nestjs/common';
import express = require('express');
import { RolePodManualPayloadStoreVm, RolePodManualPayloadGetVm } from '../../models/role-pod-manual-payload.vm';
import { RolePodManual } from '../../services/web/role-pod-manual.service';


@ApiUseTags('Role Pod Manual')
@Controller('role-pod-manual')
export class RolePodManualController {
  @Post('/get-status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
//   @ApiOkResponse({ type: SmsTrackingStoreMessageResponseVm })
  public async getPodManualList(@Body() payload: RolePodManualPayloadGetVm) {
    return RolePodManual.getStatus(payload);
  }
  @Post('/post-status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
//   @ApiOkResponse({ type: SmsTrackingStoreMessageResponseVm })
  public async podManualStore(@Body() payload: any) {
    return RolePodManual.postStatus(payload);
  }
}