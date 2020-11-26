import { Body, Controller, HttpCode, HttpStatus, Post, Res, Get, UseGuards, Param } from '@nestjs/common';
import {
    ResponseSerializerOptions,
} from '../../../../../shared/decorators/response-serializer-options.decorator';
import { ApiBearerAuth, ApiUseTags } from '../../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { V1WebReportSqlCodService } from '../../../services/web/v1/web-report-sql-cod.service';
import { V2WebCodReportService } from '../../../services/web/v2/web-cod-report.service';

@ApiUseTags('Web COD Mark II')
@Controller('web/v2/cod/report')
@ApiBearerAuth()
export class V2WebCodReportController {
  // NOTE: export data with cod fee for div finance
  @Post('stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async awbCodFinanceDownload(
    @Body() payload: BaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V2WebCodReportService.printCodSupplierInvoice(
      payload,
      outgoingHTTP,
    );
  }

  @Post('nonFee/stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async awbCodNonFeeDownload(
    @Body() payload: BaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V2WebCodReportService.printNonCodSupplierInvoice(
      payload,
      outgoingHTTP,
    );
  }

  // TODO: handle download from list awb cod
  @Post('awb/stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async awbCodAdminDownload(
    @Body() payload: BaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V2WebCodReportService.printNonCodSupplierInvoice(
      payload,
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
