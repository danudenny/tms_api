import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';
import { MobileFirstMileDoPodReturnService } from '../../services/mobile/mobile-first-mile-do-pod-return.service';
import { MobileCreateDoPodResponseVm, MobileInitDataReturnResponseVm, MobileInitReturnDataResponseVm, MobileScanAwbReturnResponseVm, MobileSyncDataReturnResponseVm, MobileSyncReturnImageDataResponseVm } from '../../models/first-mile/do-pod-return-response.vm';
import { MobileHistoryDataReturnDetailPayloadVm, MobileHistoryDataReturnPayloadVm, MobileInitDataPayloadVm, MobileScanAwbReturnPayloadVm, MobileSyncReturnImageDataPayloadVm, MobileSyncReturnPayloadVm } from '../../models/first-mile/do-pod-return-payload.vm';
import { ResponseSerializerOptions } from '../../../..//shared/decorators/response-serializer-options.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiUseTags('Mobile Do Pod Return')
@Controller('mobile/firstMile/return')
export class MobileDoPodReturnController {
  constructor() {}

  @Post('createReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileCreateDoPodResponseVm })
  @Transactional()
  public async createReturn() {
    return MobileFirstMileDoPodReturnService.createDoPodReturn();
  }

  @Post('awbReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileScanAwbReturnResponseVm })
  @Transactional()
  public async scanAwbReturn(@Body() payload: MobileScanAwbReturnPayloadVm) {
    return MobileFirstMileDoPodReturnService.scanAwbReturnMobile(payload);
  }

  @Post('initDataReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileInitDataReturnResponseVm })
  public async initDataReturn(@Body() payload: MobileInitDataPayloadVm) {
    return MobileFirstMileDoPodReturnService.getInitDataReturn(
      payload.lastSyncDateTime,
    );
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileSyncDataReturnResponseVm })
  public async sync(@Body() payload: MobileSyncReturnPayloadVm) {
    return MobileFirstMileDoPodReturnService.syncByRequest(payload);
  }

  @Post('sync/imageData')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileSyncReturnImageDataResponseVm })
  @Transactional()
  public async syncImageForm(
    @Body() payload: MobileSyncReturnImageDataPayloadVm,
    @UploadedFile() file,
  ) {
    return MobileFirstMileDoPodReturnService.syncImageData(payload, file);
  }

  @Post('historyReturn')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: MobileInitDataReturnResponseVm })
  public async historyReturn(@Body() payload: MobileHistoryDataReturnPayloadVm) {
    return MobileFirstMileDoPodReturnService.historyReturn(
      payload.dateFrom,
      payload.dateTo,
    );
  }

  @Post('historyReturnDetail')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitReturnDataResponseVm })
  public async getHistoryReturnDetail(@Body() payload: MobileHistoryDataReturnDetailPayloadVm) {
    return MobileFirstMileDoPodReturnService.getHistoryReturnDetail(
      payload.doPodReturnDetailId,
    );
  }

}
