// #region import
import {
  Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  ResponseSerializerOptions,
} from '../../../../../shared/decorators/response-serializer-options.decorator';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm, ReportBaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import {
  WebCodBankStatementCancelPayloadVm, WebCodBankStatementValidatePayloadVm,
  WebCodInvoiceAddAwbPayloadVm, WebCodInvoiceCreatePayloadVm, WebCodInvoiceDraftPayloadVm,
  WebCodInvoiceRemoveAwbPayloadVm, WebCodTransferHeadOfficePayloadVm, WebCodTransferPayloadVm, WebCodTransactionUpdatePayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
  WebAwbCodBankStatementResponseVm, WebAwbCodDetailPartnerResponseVm, WebAwbCodInvoiceResponseVm,
  WebAwbCodListResponseVm, WebAwbCodListTransactionResponseVm, WebAwbCodSupplierInvoiceResponseVm,
  WebCodBankStatementResponseVm, WebCodInvoiceAddResponseVm, WebCodInvoiceDraftResponseVm,
  WebCodInvoiceRemoveResponseVm, WebCodListInvoiceResponseVm,
  WebCodSupplierInvoicePaidResponseVm, WebCodTransactionDetailResponseVm,
  WebCodTransferBranchResponseVm, WebCodTransferHeadOfficeResponseVm, WebCodInvoiceCreateResponseVm, WebCodTransactionUpdateResponseVm, WebAwbCodVoidListResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { V1WebAwbCodService } from '../../../services/web/v1/web-awb-cod.service';
import {
  V1WebCodSupplierInvoiceService,
} from '../../../services/web/v1/web-cod-supplier-invoice.service';
import { V1WebReportCodService } from '../../../services/web/v1/web-report-cod.service';

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

  @Post('awb/void')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodVoidListResponseVm })
  public async awbVoid(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbCodService.awbVoid(payload);
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

  @Post('transactionBranch/update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodTransactionUpdateResponseVm })
  public async transactionBranchUpdate(
    @Body() payload: WebCodTransactionUpdatePayloadVm,
  ) {
    // update data transaction branch
    return V1WebAwbCodService.transactionBranchUpdate(payload);
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
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodBankStatementResponseVm })
  public async bankStatementValidate(
    @Body() payload: WebCodBankStatementValidatePayloadVm,
  ) {
    // validate bankStatement
    return V1WebAwbCodService.bankStatementValidate(payload);
  }

  @Post('bankStatement/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodBankStatementResponseVm })
  public async bankStatementCancel(
    @Body() payload: WebCodBankStatementCancelPayloadVm,
  ) {
    // cancel bankStatement
    return V1WebAwbCodService.bankStatementCancel(payload);
  }

  // #region SUPPLIER INVOICE
  @Post('supplierInvoice')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodSupplierInvoiceResponseVm })
  public async supplierInvoice(@Body() payload: BaseMetaPayloadVm) {
    // get data awb for generate supplier invoice
    return V1WebCodSupplierInvoiceService.supplierInvoice(payload);
  }

  @Post('supplierInvoice/awbPartner')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodDetailPartnerResponseVm })
  public async awbDetailByPartnerId(@Body() payload: BaseMetaPayloadVm) {
    // get data awb for generate supplier invoice
    return V1WebCodSupplierInvoiceService.awbDetailByPartnerId(payload);
  }

  @Post('supplierInvoice/create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodInvoiceCreateResponseVm })
  public async supplierInvoiceCreate(
    @Body() payload: WebCodInvoiceCreatePayloadVm,
  ) {
    return V1WebCodSupplierInvoiceService.supplierInvoiceCreate(payload);
  }

  @Post('supplierInvoice/draft')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodInvoiceDraftResponseVm })
  public async supplierInvoiceDraft(
    @Body() payload: WebCodInvoiceDraftPayloadVm,
  ) {
    // validate data paid supplier invoice
    return V1WebCodSupplierInvoiceService.supplierInvoiceDraft(payload);
  }

  @Post('supplierInvoice/awbInvoice')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodInvoiceResponseVm })
  public async awbDetailByInvoiceId(@Body() payload: BaseMetaPayloadVm) {
    // get data awb for generate supplier invoice
    return V1WebCodSupplierInvoiceService.awbDetailByInvoiceId(payload);
  }

  @Post('supplierInvoice/add')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodInvoiceAddResponseVm })
  public async supplierInvoiceAdd(
    @Body() payload: WebCodInvoiceAddAwbPayloadVm,
  ) {
    return V1WebCodSupplierInvoiceService.supplierInvoiceAdd(payload);
  }

  @Post('supplierInvoice/remove')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodInvoiceRemoveResponseVm })
  public async supplierInvoiceRemove(
    @Body() payload: WebCodInvoiceRemoveAwbPayloadVm,
  ) {
    return V1WebCodSupplierInvoiceService.supplierInvoiceRemove(payload);
  }

  @Post('supplierInvoice/void')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodInvoiceRemoveResponseVm })
  public async supplierInvoiceVoid(
    @Body() payload: WebCodInvoiceRemoveAwbPayloadVm,
  ) {
    return V1WebCodSupplierInvoiceService.supplierInvoiceVoid(payload);
  }

  @Post('supplierInvoice/paid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodSupplierInvoicePaidResponseVm })
  public async supplierInvoicePaid(
    @Body() payload: WebCodInvoiceDraftPayloadVm,
  ) {
    // TODO: validate data paid supplier invoice
    return V1WebCodSupplierInvoiceService.supplierInvoicePaid(payload);
  }

  @Post('listInvoice')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodListInvoiceResponseVm })
  public async listInvoice(@Body() payload: BaseMetaPayloadVm) {
    // list data supplier invoice
    return V1WebCodSupplierInvoiceService.listInvoice(payload);
  }
  // #endregion SUPPLIER INVOICE

  @Get('supplierInvoice/export/:supplierInvoiceId')
  @UseGuards(AuthenticatedGuard)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoiceExport(
    @Param('supplierInvoiceId') supplierInvoiceId: string,
  ) {
    return V1WebReportCodService.exportSupplierInvoice(supplierInvoiceId);
  }

  @Post('supplierInvoice/print')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async supplierInvoicePrint(@Body() payload: ReportBaseMetaPayloadVm) {
    const filterList = V1WebReportCodService.filterList(payload.filters);
    return await V1WebReportCodService.printSupplierInvoice(
      payload,
      filterList,
    );
  }

  // @Get('transaction/sync')
  // @ResponseSerializerOptions({ disable: true })
  // public async transactionSync() {
  //   await V1WebAwbCodService.syncData();
  //   return { status: 'ok' };
  // }
}
