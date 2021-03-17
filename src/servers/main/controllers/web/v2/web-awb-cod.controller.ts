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
import { WebCodTransferPayloadVm, WebCodNominalValidationPayloadVm } from '../../../models/cod/web-awb-cod-payload.vm';
import { WebCodTransferBranchResponseVm, WebCodNominalUploadResponseVm, WebCodNominalValidationResponseVm } from '../../../models/cod/web-awb-cod-response.vm';
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

  @Post('nominal/validation')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodNominalValidationResponseVm })
  public async nominalValidation(@Body() payload: WebCodNominalValidationPayloadVm) {
    return V2WebAwbCodService.nominalValidation(payload);
  }

  // form multipart
  @Post('nominal/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebCodNominalUploadResponseVm })
  public async nominalUpload(
    @UploadedFile() file,
  ) {
    return V2WebAwbCodService.nominalUpload(file);
  }
}
