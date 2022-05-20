import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { WebAwbScanPriorityResponse } from '../../models/web-awb-scan-priority-response.vm';
import { WebAwbScanPriorityService } from '../../services/web/web-awb-scan-priority.service';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@ApiUseTags('Web Scan Priority')
@Controller('web/v2/pod')
export class WebAwbScanPriorityController {

  @Get('scanPriority/awb/:awbNumber')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebAwbScanPriorityResponse })
  public async scanPriorityAwbNumber(@Param('awbNumber') awbNumber: string) {
    return WebAwbScanPriorityService.scanProirity(awbNumber, true, 0);
  }
}