import { V1WebReportCodStreamService } from '../../../services/cod/v1/web-report-stream-cod.service';
import { Res } from '@nestjs/common';
// #region import
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ResponseSerializerOptions } from '../../../../../shared/decorators/response-serializer-options.decorator';
import {
  ApiBearerAuth,
  ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import {
  ReportBaseMetaPayloadVm,
} from '../../../../../shared/models/base-meta-payload.vm';
import { V1WebReportCodService } from '../../../services/cod/v1/web-report-cod.service';
import { V1WebReportSqlCodService } from '../../../services/cod/v1/web-report-sql-cod.service';

// #endregion import

@ApiUseTags('Web Report COD Version 1')
@Controller('web/v1/cod')
@ApiBearerAuth()
export class V1WebAwbCodController {
  // #region report COD
  @Get('supplierInvoice/export/:supplierInvoiceId')
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceExport(
    @Param('supplierInvoiceId') supplierInvoiceId: string,
  ) {
    // return V1WebReportCodService.exportSupplierInvoice(supplierInvoiceId);
    return V1WebReportSqlCodService.exportSupplierInvoice(supplierInvoiceId);
  }

  @Post('supplierInvoice/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoicePrint(@Body() payload: ReportBaseMetaPayloadVm) {
    // const filterList = V1WebReportCodService.filterList(payload.filters);
    return await V1WebReportCodService.printCodSupplierInvoice(payload.filters);
  }

  @Post('supplierInvoice/noncodfee/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceNonCodFeePrint(
    @Body() payload: ReportBaseMetaPayloadVm,
  ) {
    return await V1WebReportCodService.printNonCodSupplierInvoice(
      payload.filters,
    );
  }

  @Post('supplierInvoice/bull/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceBullPrint(
    @Body() payload: ReportBaseMetaPayloadVm,
  ) {
    return await V1WebReportCodService.addQueueBullPrint(
      payload.filters,
      'codfee',
    );
  }

  @Post('supplierInvoice/noncodfee/bull/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceBullNonCodFeePrint(
    @Body() payload: ReportBaseMetaPayloadVm,
  ) {
    return await V1WebReportCodService.addQueueBullPrint(
      payload.filters,
      'noncodfee',
    );
  }

  @Post('supplierInvoice/sql/bull/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceBullSqlCodFeePrint(
    @Body() payload: ReportBaseMetaPayloadVm,
  ) {
    return await V1WebReportSqlCodService.addQueueBullPrint(
      payload.filters,
      'codfee',
    );
  }

  @Post('supplierInvoice/noncodfee/sql/bull/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceBullSqlNonCodFeePrint(
    @Body() payload: ReportBaseMetaPayloadVm,
  ) {
    return await V1WebReportSqlCodService.addQueueBullPrint(
      payload.filters,
      'noncodfee',
    );
  }

  @Get('supplierInvoice/checkReport/:reportKey')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierinvoiceCheckUUID(@Param('reportKey') reportKey: string) {
    return await V1WebReportCodService.getuuidString(reportKey);
  }

  @Post('supplierInvoice/noncodfee/stream/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceStreamNonCodFeePrint(
    @Body() payload: ReportBaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V1WebReportCodStreamService.printNonCodSupplierInvoice(
      payload.filters,
      outgoingHTTP,
    );
  }

  @Post('supplierInvoice/stream/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceStreamPrint(
    @Body() payload: ReportBaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V1WebReportCodStreamService.printCodSupplierInvoice(
      payload.filters,
      outgoingHTTP,
    );
  }

  // #endregion report COD
}
