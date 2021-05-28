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
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiUseTags,
  ApiBearerAuth,
} from '../../../../shared/external/nestjs-swagger';
import { MobileFirstMileDoPodReturnService } from '../../services/mobile/mobile-first-mile-do-pod-return.service';
import { MobileCreateDoPodResponseVm, MobileInitDataReturnResponseVm, MobileScanAwbReturnResponseVm } from '../../models/first-mile/do-pod-return-response.vm';
import { MobileInitDataPayloadVm, MobileScanAwbReturnPayloadVm } from '../../models/first-mile/do-pod-return-payload.vm';

@ApiUseTags('Mobile Do Pod Return')
@Controller('mobile/pod/return/scanOut')
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

}
