import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  CHECK_AWB_SERVICE,
  CheckAwbService,
} from '../../interfaces/check-awb.interface';
import { CheckAwbPayload } from '../../models/check-awb/check-awb.payload';
import {
  CheckAwbResponse,
  StartCheckAwbResponse,
} from '../../models/check-awb/check-awb.response';

@ApiUseTags('Check AWB Destination')
@Controller('check-awb')
export class CheckAwbController {
  constructor(
    @Inject(CHECK_AWB_SERVICE) private readonly service: CheckAwbService,
  ) {}

  @Post()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public start(): Promise<StartCheckAwbResponse> {
    return this.service.startSession();
  }

  @Post('awb')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getAwb(@Body() payload: CheckAwbPayload): Promise<CheckAwbResponse> {
    return this.service.getAwb(payload);
  }
}
