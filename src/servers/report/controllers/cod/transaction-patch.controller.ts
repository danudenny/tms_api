import { HttpCode, Controller, Post, HttpStatus, UseGuards, Body } from '@nestjs/common';
import { ApiImplicitHeader, ApiUseTags, ApiOkResponse } from '../../../../shared/external/nestjs-swagger';
import { AuthKeyCodGuard } from '../../../../shared/guards/auth-key-cod.guard';
import { TransactionPatchPayloadVm, TransactionPatchSuccessResponseVm } from '../../models/cod/transaction-patch.vm';
import { TransactionPatchService } from '../../services/cod/transaction-patch.service';

@ApiUseTags('COD Transaction Patch')
@Controller('cod/transaction')
export class CodTransactionController {
  constructor() {}

  @Post('remove')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'auth-key' })
  @UseGuards(AuthKeyCodGuard)
  @ApiOkResponse({ type: TransactionPatchSuccessResponseVm })
  public async patchDataDlv(@Body() payload: TransactionPatchPayloadVm) {
    return TransactionPatchService.remove(payload);
  }
}
