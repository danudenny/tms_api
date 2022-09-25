import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, Response, Query } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { WebDeliveryVendorOutService } from '../../services/web/web-delivery-vendor-out.service';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import express = require('express');
import { WebDeliveryVendorOutPayload, WebDeliveryVendorOutSendPayload, ScanOutPropertyAwbPayloadVm, WebDeliveryTrackingVendorPayload, WebDeliveryVendorUploadPhotoPayload } from '../../models/web-delivery-vendor-out-payload.vm';
import { WebDeliveryVendorOutResponseVm, ScanOutPropertyAwbResponseVm, WebDeliveryTrackingVendorResponseVm, WebDeliveryVendorUploadPhotoResponse } from '../../models/web-delivery-vendor-out-response.vm';
import { AuthBackdoorApiKeyGuard } from '../../../../shared/guards/auth-backdoor-api-key.guard';
import { PrintVendorOutPayloadQueryVm} from '../../models/print-vendor-out-payload.vm';

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

  @Get('scanOut/printVendor')
  @ApiBearerAuth()
  @ResponseSerializerOptions({ disable: true })
  public async printVendor(@Response() serverResponse: express.Response, @Query() queryParams: PrintVendorOutPayloadQueryVm) {
    return WebDeliveryVendorOutService.printVendor(serverResponse, queryParams);
  }
  
  @Post('scanOut/propertyAWB')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthBackdoorApiKeyGuard)
  @ApiOkResponse({ type: ScanOutPropertyAwbResponseVm })
  public async awbNumber(@Body() payload: ScanOutPropertyAwbPayloadVm) {
    return WebDeliveryVendorOutService.awb(payload);
  }

  @Post('scanOut/insertTracking')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthBackdoorApiKeyGuard)
  @ApiOkResponse({ type: WebDeliveryTrackingVendorResponseVm })
  public async insertTracking(@Body() payload: WebDeliveryTrackingVendorPayload) {
    return WebDeliveryVendorOutService.insertTracking(payload);
  }

  @Post('scanOut/uploadPhotoVendor')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthBackdoorApiKeyGuard)
  @ApiOkResponse({ type: WebDeliveryVendorUploadPhotoResponse })
  public async uploadPhotoVendor(@Body() payload: WebDeliveryVendorUploadPhotoPayload) {
    return WebDeliveryVendorOutService.uploadPhotoVendor(payload);
  }

}