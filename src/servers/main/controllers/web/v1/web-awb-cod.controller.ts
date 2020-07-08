// #region import
import {
    Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
    WebCodTransferHeadOfficePayloadVm, WebCodTransferPayloadVm, WebCodBankStatementValidatePayloadVm, WebCodBankStatementCancelPayloadVm, WebCodSupplierInvoicePayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
    WebAwbCodListResponseVm, WebAwbCodListTransactionResponseVm, WebCodTransactionDetailResponseVm,
    WebCodTransferBranchResponseVm, WebCodTransferHeadOfficeResponseVm, WebAwbCodBankStatementResponseVm, WebCodBankStatementResponseVm, WebAwbCodSupplierInvoiceResponseVm, WebCodSupplierInvoicePaidResponseVm, WebAwbCodDetailPartnerResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { V1WebAwbCodService } from '../../../services/web/v1/web-awb-cod.service';
import { ResponseSerializerOptions } from '../../../../../shared/decorators/response-serializer-options.decorator';
import { V1WebReportCodService } from '../../../services/web/v1/web-report-cod.service';
import { V1WebCodSupplierInvoiceService } from '../../../services/web/v1/web-cod-supplier-invoice.service';
// #endregion import

@ApiUseTags('Web Awb COD')
@Controller('web/v1/cod')
@ApiBearerAuth()
export class V1WebAwbCodController {
  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodListResponseVm })
  public async awb(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbCodService.awbCod(payload);
  }

  @Post('transferBranch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodTransferBranchResponseVm })
  public async transferBranch(@Body() payload: WebCodTransferPayloadVm) {
    return V1WebAwbCodService.transferBranch(payload);
  }

  @Post('transactionBranch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodListTransactionResponseVm })
  public async transactionBranch(@Body() payload: BaseMetaPayloadVm) {
    // get data transaction branch
    return V1WebAwbCodService.transactionBranch(payload);
  }

  @Get('transactionBranch/detail/:transactionBranchId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodTransactionDetailResponseVm })
  public async transactionBranchDetail(
    @Param('transactionBranchId') transactionId: string,
  ) {
    // get data transaction branch detail
    return V1WebAwbCodService.transactionBranchDetail(transactionId);
  }

  // form multipart
  @Post('transferHeadOffice')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodTransferHeadOfficeResponseVm })
  public async deliveryOrderCreate(
    @Body() payload: WebCodTransferHeadOfficePayloadVm,
    @UploadedFile() file,
  ) {
    return V1WebAwbCodService.transferHeadOffice(payload, file);
  }

  @Post('bankStatement')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodBankStatementResponseVm })
  public async bankStatement(@Body() payload: BaseMetaPayloadVm) {
    // get data bankStatement
    return V1WebAwbCodService.bankStatement(payload);
  }

  @Get('bankStatement/transactionBranch/:bankStatementId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodListTransactionResponseVm })
  public async transactionBankStatement(
    @Param('bankStatementId') bankStatementId: string,
  ) {
    // get data transaction branch
    return V1WebAwbCodService.transactionBranchByBankStatementId(
      bankStatementId,
    );
  }

  @Get('bankStatement/awb/:bankStatementId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodTransactionDetailResponseVm })
  public async transactionBankDetailStatement(
    @Param('bankStatementId') bankStatementId: string,
  ) {
    // get data transaction branch
    return V1WebAwbCodService.transactionBranchDetailByBankStatementId(
      bankStatementId,
    );
  }

  @Post('bankStatement/validate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodBankStatementResponseVm })
  public async bankStatementValidate(
    @Body() payload: WebCodBankStatementValidatePayloadVm,
  ) {
    // validate bankStatement
    return V1WebAwbCodService.bankStatementValidate(payload);
  }

  @Post('bankStatement/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodBankStatementResponseVm })
  public async bankStatementCancel(
    @Body() payload: WebCodBankStatementCancelPayloadVm,
  ) {
    // cancel bankStatement
    return V1WebAwbCodService.bankStatementCancel(payload);
  }

  @Post('supplierInvoice')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodSupplierInvoiceResponseVm })
  public async supplierInvoice(@Body() payload: BaseMetaPayloadVm) {
    // get data awb for generate supplier invoice
    return V1WebCodSupplierInvoiceService.supplierInvoice(payload);
  }

  @Post('supplierInvoice/awb')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodDetailPartnerResponseVm })
  public async awbDetailByPartnerId(@Body() payload: BaseMetaPayloadVm) {
    // get data awb for generate supplier invoice
    return V1WebCodSupplierInvoiceService.awbDetailByPartnerId(payload);
  }

  @Post('supplierInvoice/validate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebCodSupplierInvoicePaidResponseVm })
  public async supplierInvoiceValidate(
    @Body() payload: WebCodSupplierInvoicePayloadVm,
  ) {
    // TODO: validate data paid supplier invoice
    return {};
  }

  @Post('supplierInvoice/add')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebCodSupplierInvoicePaidResponseVm })
  public async supplierInvoiceAdd(
    @Body() payload: WebCodSupplierInvoicePayloadVm,
  ) {
    // TODO: validate data paid supplier invoice
    return {};
  }

  @Post('supplierInvoice/remove')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebCodSupplierInvoicePaidResponseVm })
  public async supplierInvoiceRemove(
    @Body() payload: WebCodSupplierInvoicePayloadVm,
  ) {
    // TODO: validate data paid supplier invoice
    return {};
  }

  @Post('supplierInvoice/paid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodSupplierInvoicePaidResponseVm })
  public async supplierInvoicePaid(
    @Body() payload: WebCodSupplierInvoicePayloadVm,
  ) {
    // TODO: validate data paid supplier invoice
    return V1WebCodSupplierInvoiceService.supplierInvoicePaid(payload);
  }

  @Post('listInvoice')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebCodSupplierInvoicePaidResponseVm })
  public async listInvoice(@Body() payload: WebCodSupplierInvoicePayloadVm) {
    // TODO: list data paid supplier invoice
    return {};
  }

  @Get('supplierInvoice/testExport')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebCodTransactionDetailResponseVm })
  @ResponseSerializerOptions({ disable: true })
  public async testExportData() {
    return V1WebReportCodService.testExport();
  }
}
