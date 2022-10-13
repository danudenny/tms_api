import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { EndpointSanityService } from '../../services/backdoor/endpoint-sanity.service';

@ApiUseTags('Endpoint Sanity')
@Controller('backdoor/sanity')
export class EndpointSanityController {
  constructor(
    private readonly sanityService: EndpointSanityService,
    ) {

  }

  @Post('doSmd')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async updateDoSmd(@Body() payload: BaseMetaPayloadVm) {
    return this.sanityService.updateDoSmd(payload);
  }
}
