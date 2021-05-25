import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Delete } from '@nestjs/common';
import {
    ApiImplicitHeader, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';
import { ExportHandoverSigesitResponseVM } from '../../models/internal/handover-package.vm';
import { InternalHandoverPackageService } from '../../services/integration/internal-handover-package.service';

@ApiUseTags('Internal Handover Package')
@Controller('internal/handover')
export class InternalHandoverPackageController {
  constructor() {}

  @Get('exportHandoverSigesit')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  // @UseGuards(AuthXAPIKeyGuard)
  @ApiOkResponse({ type: ExportHandoverSigesitResponseVM })
  public async exportHandoverSigesit(@Body() payload: any) {
    return InternalHandoverPackageService.exportHandoverSigesit(payload);
  }
}
