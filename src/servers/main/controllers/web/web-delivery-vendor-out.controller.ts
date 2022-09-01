import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, Response } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebDeliveryVendorOutService } from '../../services/web/web-delivery-vendor-out.service';
import { WebDeliveryVendorOutPayload, WebDeliveryVendorOutSendPayload } from '../../models/web-delivery-vendor-out-payload.vm';
import { WebDeliveryVendorOutResponseVm } from '../../models/web-delivery-vendor-out-response.vm';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import express = require('express');

@ApiUseTags('Web Scan Vendor')
@Controller('pod/lastMile')
export class WebAwbDeliveryVendorController {

  @Post('scanOut/validate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDeliveryVendorOutResponseVm })
  public async validateAwbNumber(@Body() payload: WebDeliveryVendorOutPayload) {
    return WebDeliveryVendorOutService.validateAWB(payload);
  }

  @Post('scanOut/sendVendor')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebDeliveryVendorOutResponseVm })
  public async sendVendor(@Body() payload: WebDeliveryVendorOutSendPayload) {
    return WebDeliveryVendorOutService.scanVendor(payload);
  }

  @Get('scanOut/printVendor/:vendorCode')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printVendor(@Response() serverResponse: express.Response, @Param('versionApp') vendorCode: string) {
    return WebDeliveryVendorOutService.printVendor(serverResponse, vendorCode);
  }
}