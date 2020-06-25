import { Controller, Post, UseGuards, HttpCode, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { TransactionStatusResponseVm } from '../../models/master/transaction-status.vm';
import { TransactionStatusService } from '../../services/master/transaction-status.service';

@ApiUseTags('Master Data')
@Controller('master/transactionStatus')
export class TransactionStatusController {
  constructor() {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: TransactionStatusResponseVm })
  public async listAwbStatus(@Body() payload: BaseMetaPayloadVm) {
    return TransactionStatusService.listData(payload);
  }
}
