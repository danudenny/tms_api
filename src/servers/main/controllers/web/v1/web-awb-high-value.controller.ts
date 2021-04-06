import {
    BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Res, UploadedFile, UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
    ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { AwbHighValueUploadListResponseVm, AwbHighValueUploadResponseVm } from '../../../models/last-mile/awb-high-value.vm';
import { V1WebAwbHighValueService } from '../../../services/web/v1/web-awb-high-value.service';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { ResponseSerializerOptions } from '../../../../../shared/decorators/response-serializer-options.decorator';

@ApiUseTags('Awb High Value')
@Controller('web/v1/awbHighValue')
@ApiConsumes('multipart/form-data')
@ApiBearerAuth()
export class V1WebAwbHighValueController {
  constructor() {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: AwbHighValueUploadResponseVm })
  // @Transactional()
  public async uploadFileAwb(@UploadedFile() file) {
    if (
      file.mimetype.includes('excel') ||
      file.mimetype.includes('spreadsheetml') ||
      file.mimetype.includes('csv')
    ) {
      return V1WebAwbHighValueService.uploadAwb(file);
    } else {
      throw new BadRequestException('Please upload only excel/csv file.');
    }
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbHighValueUploadListResponseVm })
  public async uploadAwbList(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbHighValueService.uploadAwbList(payload);
  }

  @Post('list/count')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbHighValueUploadListResponseVm })
  public async uploadAwbCount(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbHighValueService.uploadAwbCount(payload);
  }

  @Post('apilist')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbHighValueUploadListResponseVm })
  public async ApiAwbList(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbHighValueService.ApiAwbList(payload);
  }

  @Post('apilist/count')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AwbHighValueUploadListResponseVm })
  public async ApiAwbCount(@Body() payload: BaseMetaPayloadVm) {
    return V1WebAwbHighValueService.ApiAwbListCount(payload);
  }

  @Post('apilist/report/stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async export(
    @Body() payload: BaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await V1WebAwbHighValueService.export(
      payload,
      outgoingHTTP,
    );
  }
}
