import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import {
  IframeResponse,
  MetabaseIframePayload,
} from '../../models/iframe/iframe-payload';
import { IframeService } from '../../services/iframe/iframe.service';

@ApiUseTags('Iframe Controller')
@Controller('iframe')
export class IframeController {
  constructor(private readonly service: IframeService) {}

  @Post('metabase')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public getMetabaseUrl(
    @Body() payload: MetabaseIframePayload,
  ): IframeResponse {
    return this.service.getMetabaseUrl(payload);
  }
}
