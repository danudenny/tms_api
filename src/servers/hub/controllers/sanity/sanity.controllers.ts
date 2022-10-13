import { Body, Controller, Delete, Inject, UseGuards } from '@nestjs/common';

import { RoleAuthGuardOptions } from '../../../../shared/decorators/role-auth-guard-options.decorator';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { PermissionRoleGuard } from '../../../../shared/guards/permission.role.guard';
import { SANITY_SERVICE, SanityService } from '../../interfaces/sanity.service';
import { DeleteBagsRequest } from '../../models/sanity/sanity.request';
import { DeleteBagsResponse } from '../../models/sanity/sanity.response';

@ApiUseTags('Backdoor APIs for Sanity Testing')
@RoleAuthGuardOptions('1', '11')
@UseGuards(AuthenticatedGuard, PermissionTokenGuard, PermissionRoleGuard)
@Controller('sanity')
export class SanityController {
  constructor(
    @Inject(SANITY_SERVICE) private readonly service: SanityService,
  ) {}

  @Delete('bag')
  public deleteBag(
    @Body() payload: DeleteBagsRequest,
  ): Promise<DeleteBagsResponse> {
    return this.service.deleteBags(payload);
  }
}
