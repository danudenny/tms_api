import { Body, Controller, HttpCode, HttpStatus, Post, Res, Get, UseGuards, Param } from '@nestjs/common';
import {
    ResponseSerializerOptions,
} from '../../../../../shared/decorators/response-serializer-options.decorator';
import { ApiBearerAuth, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { ReportBaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
    V1WebReportCodStreamService,
} from '../../../services/web/v1/web-report-stream-cod.service';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { V1WebReportSqlCodService } from '../../../services/web/v1/web-report-sql-cod.service';

@ApiUseTags('Web COD Mark II')
@Controller('web/v2/cod/report')
@ApiBearerAuth()
export class V2WebCodReportController {
  // NOTE: export data with cod fee for div finance
  @Post('stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async awbCodFinanceDownload(
    @Body() payload: ReportBaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V1WebReportCodStreamService.printCodSupplierInvoice(
      payload.filters,
      outgoingHTTP,
    );
  }

  @Post('nonFee/stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async awbCodNonFeeDownload(
    @Body() payload: ReportBaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V1WebReportCodStreamService.printNonCodSupplierInvoice(
      payload.filters,
      outgoingHTTP,
    );
  }

  // TODO: handle download from list awb cod
  @Post('awb/stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async awbCodAdminDownload(
    @Body() payload: ReportBaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V1WebReportCodStreamService.printNonCodSupplierInvoice(
      payload.filters,
      outgoingHTTP,
    );
  }

  @Get('invoice/:supplierInvoiceId')
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceDownload(
    @Param('supplierInvoiceId') supplierInvoiceId: string,
  ) {
    return V1WebReportSqlCodService.exportSupplierInvoice(supplierInvoiceId);
  }
}
