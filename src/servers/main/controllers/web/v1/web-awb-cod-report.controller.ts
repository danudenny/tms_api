import {ApiBearerAuth, ApiUseTags} from '../../../../../shared/external/nestjs-swagger';
import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards} from '@nestjs/common';
import {CodReportService} from '../../../services/cod/cod-report.service';
import {AuthenticatedGuard} from '../../../../../shared/guards/authenticated.guard';
import {PermissionTokenGuard} from '../../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('COD Report')
@Controller('web/v1/cod/report')
@ApiBearerAuth()
export class WebAwbCodReportController {

  constructor(
    private codReportService: CodReportService,
  ) {
  }

  @Get('supplier-invoice/:supplierInvoiceId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async fetchExportSupplierInvoice(
    @Param('supplierInvoiceId') supplierInvoiceId: string,
    @Query() queryParams: {
      page: string;
      limit: string;
    },
  ) {
    let page = Number(queryParams.page);
    let limit = Number(queryParams.limit);
    if (!page || page < 1) {
      page = 1;
    }
    if (!limit || limit < 1) {
      limit = 10;
    }
    return this.codReportService.fetchReportSupplierInvoiceAwb(supplierInvoiceId, page, limit);
  }

  @Post('supplier-invoice')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async generateExportSupplierInvoice(
    @Body() payload: {
      supplierInvoiceId: string,
    },
  ) {
    return this.codReportService.generateReportSupplierInvoiceAwb(payload.supplierInvoiceId);
  }

  @Get('awb/summary')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async fetchExportAwbCodSummary(
    @Query() queryParams: {
      page: string;
      limit: string;
    },
  ) {
    let page = Number(queryParams.page);
    let limit = Number(queryParams.limit);
    if (!page || page < 1) {
      page = 1;
    }
    if (!limit || limit < 1) {
      limit = 10;
    }
    return this.codReportService.fetchReportAwbSummary(page, limit);
  }

  @Post('awb/summary')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard,PermissionTokenGuard)
  public async exportAwbSummary(
    @Body() payload: BaseMetaPayloadVm
  ) {
    return this.codReportService.generateAWBSummaryReport(payload);
  }

}
