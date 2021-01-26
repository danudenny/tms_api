import {
    BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
    ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { AwbHighValueUploadResponseVm } from '../../../models/last-mile/awb-high-value.vm';
import { V1WebAwbHighValueService } from '../../../services/web/v1/web-awb-high-value.service';

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
}
