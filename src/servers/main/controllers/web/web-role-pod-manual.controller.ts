import {
    ApiUseTags,
    ApiBearerAuth,
    ApiOkResponse,
  } from '../../../../shared/external/nestjs-swagger';
import { Controller, Post, HttpCode, HttpStatus, Body, Delete, Param, Get, Response, Query, UseGuards } from '@nestjs/common';
import express = require('express');
import { RolePodManualPayloadStoreVm, RolePodManualPayloadGetVm, RolePodManualPayloadPostVm } from '../../models/role-pod-manual-payload.vm';
import { RolePodManual } from '../../services/web/role-pod-manual.service';
import { AuthenticatedGuard } from 'src/shared/guards/authenticated.guard';
import { PermissionTokenGuard } from 'src/shared/guards/permission-token.guard';


@ApiUseTags('Role Pod Manual')
@Controller('role-pod-manual')
export class RolePodManualController {
  @Post('/get-status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  public async getPodManualList(@Body() payload: RolePodManualPayloadGetVm) {
    return RolePodManual.getStatus(payload);
  }
  @Post('/post-status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  public async podManualStore(@Body() payload: RolePodManualPayloadPostVm) {
    return RolePodManual.postStatus(payload);
  }

}