import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get, Param, BadRequestException } from '@nestjs/common';

import {
    ResponseSerializerOptions,
} from '../../../../../shared/decorators/response-serializer-options.decorator';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { MobileInitDataPayloadVm } from '../../../models/mobile-init-data-payload.vm';
import {
    MobileInitDataDeliveryResponseVm, MobileInitDataResponseVm,
} from '../../../models/mobile-init-data-response.vm';
import { V1MobileInitDataService } from '../../../services/mobile/v1/mobile-init-data.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import moment = require('moment');
import { AppNotification } from '../../../../../shared/orm-entity/app-notification';
import { PinoLoggerService } from '../../../../../shared/services/pino-logger.service';

@ApiUseTags('Mobile Init Data')
@Controller('mobile/v1')
export class V1MobileInitController {
  constructor() {}

  @Post('initData')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async initData(@Body() payload: MobileInitDataPayloadVm) {
    return V1MobileInitDataService.getInitDataByRequest(
      payload.lastSyncDateTime,
    );
  }

  @Post('initDataLogin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async initDataLogin(@Body() payload: MobileInitDataPayloadVm) {
    return V1MobileInitDataService.getInitData(payload.lastSyncDateTime);
  }

  @Post('initDataDelivery')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataDeliveryResponseVm })
  public async initDataDelivery(@Body() payload: MobileInitDataPayloadVm) {
    return V1MobileInitDataService.getInitDataDelivery(
      payload.lastSyncDateTime,
    );
  }

  @Post('getHistory')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({ type: MobileInitDataResponseVm })
  public async getHistory(@Body() payload: MobileInitDataPayloadVm) {
    return V1MobileInitDataService.getHistoryByRequest(
      payload.doPodDeliverDetailId,
    );
  }

  @Get('getAppNotification/:appCode')
  @ResponseSerializerOptions({ disable: true })
  public async getAppNotification(@Param('appCode') appCode: string) {
    let response = {};
    // TODO: check redis app notifiations
    const dataRedis = await RedisService.get(
      `appNotification:mobile:${appCode}`,
      true,
    );

    if (dataRedis) {
      PinoLoggerService.log('Load Data from redis!');
      response = {
        appCode: dataRedis.appCode,
        title: dataRedis.title,
        subtitle: dataRedis.subtitle,
        message: dataRedis.message,
        isActive: dataRedis.isActive,
      };
    } else {
      const expireOnSeconds = 60 * 60 * 1;
      // get data app notification
      const appNotif = await AppNotification.findOne({ appCode, isActive: true });
      if (appNotif) {
        const message = appNotif.message.replace(/\\n/g, '\n'); // replace newline
        response = {
          appCode: appNotif.appCode,
          title: appNotif.title,
          subtitle: appNotif.subtitle,
          message,
          isActive: appNotif.isActive,
        };
        // set data on redis
        await RedisService.setex(
          `appNotification:mobile:${appCode}`,
          JSON.stringify(response),
          expireOnSeconds,
        );
      } else {
        // throw new BadRequestException('Data Tidak ditemukan !');
        response = {
          appCode,
          title: '',
          subtitle: '',
          message: 'Data Tidak ditemukan !',
          isActive: false,
        };
        await RedisService.setex(
          `appNotification:mobile:${appCode}`,
          JSON.stringify(response),
          expireOnSeconds,
        );
      }
    }

    return {
      ...response,
      timeString: moment().format('YYYY-MM-DD HH:mm:ss'),
    };
  }
}
