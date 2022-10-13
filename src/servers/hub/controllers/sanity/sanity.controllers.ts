import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleAuthGuardOptions } from '../../../../shared/decorators/role-auth-guard-options.decorator';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { PermissionRoleGuard } from '../../../../shared/guards/permission.role.guard';
import { SANITY_SERVICE, SanityService } from '../../interfaces/sanity.service';
import { DeleteBagRequest } from '../../models/sanity/sanity.request';
import { DeleteBagResponse } from '../../models/sanity/sanity.response';

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
    @Body() payload: DeleteBagRequest,
  ): Promise<DeleteBagResponse> {
    return this.service.deleteBag(payload);
  }
}
