import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  UseGuards,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { V1WebAwbCodService } from '../../../services/web/v1/web-awb-cod.service';
import { WebAwbCodListResponseVm } from '../../../models/cod/web-awb-cod-response';

@ApiUseTags('Web Awb COD')
@Controller('web/v1/cod')
@ApiBearerAuth()
export class V1WebAwbCodController {
  @Post('awb')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: WebAwbCodListResponseVm })
  public async awb(payload: BaseMetaPayloadVm) {
    return V1WebAwbCodService.awbCod(payload);
  }

  // @Post('transferBranch')
  // @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: WebAwbCodListResponseVm })
  // public async transferBranch(payload: BaseMetaPayloadVm) {
  //   return {}; // V1WebTrackingService.awb(payload);
  // }
}
