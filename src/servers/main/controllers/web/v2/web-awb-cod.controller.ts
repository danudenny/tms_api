// #region import
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { WebCodTransferPayloadVm, WebCodNominalUpdatePayloadVm, WebCodNominalCheckPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import { WebCodTransferBranchResponseVm, WebCodNominalUpdateResponseVm, WebCodNominalCheckResponseVm } from '../../../models/cod/web-awb-cod-response.vm';
import { V2WebAwbCodService } from '../../../services/web/v2/web-awb-cod.service';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('nominal/check')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodNominalCheckResponseVm })
  public async nominalCheck(@Body() payload: WebCodNominalCheckPayloadVm) {
    return V2WebAwbCodService.nominalCheck(payload);
  }

  // form multipart
  @Post('nominal/update')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodNominalUpdateResponseVm })
  public async nominalUpdate(
    @Body() payload: WebCodNominalUpdatePayloadVm,
    @UploadedFile() file,
  ) {
    return V2WebAwbCodService.nominalUpdate(payload, file);
  }
}
