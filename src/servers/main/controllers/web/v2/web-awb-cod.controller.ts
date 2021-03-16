// #region import
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import {
  WebCodTransferPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
  WebCodTransferBranchResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { V2WebAwbCodService } from '../../../services/web/v2/web-awb-cod.service';
// #endregion import

@ApiUseTags('Web Awb COD Mark II')
@Controller('web/v2/cod')
@ApiBearerAuth()
export class V2WebAwbCodController {
  @Post('transferBranch')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebCodTransferBranchResponseVm })
  public async transferBranch(@Body() payload: WebCodTransferPayloadVm) {
    return V2WebAwbCodService.transferBranch(payload);
  }
}
