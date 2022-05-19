import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { WebLastMileUploadResponseVm } from '../../models/web-last-mile-upload-response.vm';
import { WebLastMileUploadPayloadVm } from '../../models/web-last-mile-upload-payload.vm';
import { WebLastMileUploadService } from '../../services/web/web-last-mile-upload.services';

@ApiUseTags('Web Last Mile Upload')
@Controller('web/v1/pod')
export class WebLastMileUploadController {
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: WebLastMileUploadResponseVm })
  public async deliveryOrderUpdate(
    @Body() payload: WebLastMileUploadPayloadVm,
    @UploadedFile() file,
  ) {
    return WebLastMileUploadService.uploadFile(payload, file);
  }
}