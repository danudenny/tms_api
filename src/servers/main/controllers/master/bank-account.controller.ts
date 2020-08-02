import { Controller, Post, HttpCode, Body, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BankAccountService } from '../../services/master/bank-account.service';
import { BankAccountResponseVm } from '../../models/master/bank-account.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';

@ApiUseTags('Master Data')
@Controller('master/bankAccount')
export class BankAccountController {
  constructor() {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: BankAccountResponseVm })
  public async list(@Body() payload: BaseMetaPayloadVm) {
    return BankAccountService.listData(payload);
  }
}
