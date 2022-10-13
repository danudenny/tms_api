import { Body, Controller, Delete, Inject, UseGuards } from '@nestjs/common';

import { RoleAuthGuardOptions } from '../../../../shared/decorators/role-auth-guard-options.decorator';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { PermissionRoleGuard } from '../../../../shared/guards/permission.role.guard';
import { SANITY_SERVICE, SanityService } from '../../interfaces/sanity.service';
import {
  DeleteAwbsRequest,
  DeleteBaggingRequest,
  DeleteBagRepresentativeRequest,
  DeleteBagsRequest,
  DeleteDoSmdRequest,
} from '../../models/sanity/sanity.request';
import {
  DeleteAwbsResponse,
  DeleteBaggingResponse,
  DeleteBagRepresentativeResponse,
  DeleteBagsResponse,
  DeleteDoSmdResponse,
} from '../../models/sanity/sanity.response';

@ApiUseTags('Backdoor APIs for Sanity Testing')
@RoleAuthGuardOptions('1', '11')
@UseGuards(AuthenticatedGuard, PermissionTokenGuard, PermissionRoleGuard)
@Controller('sanity')
export class SanityController {
  constructor(
    @Inject(SANITY_SERVICE) private readonly service: SanityService,
  ) {}

  @Delete('bag')
  public deleteBags(
    @Body() payload: DeleteBagsRequest,
  ): Promise<DeleteBagsResponse> {
    return this.service.deleteBags(payload);
  }

  @Delete('awb')
  public deleteAwbs(
    @Body() payload: DeleteAwbsRequest,
  ): Promise<DeleteAwbsResponse> {
    return this.service.deleteAwbs(payload);
  }

  @Delete('dosmd')
  public deleteDoSmd(
    @Body() payload: DeleteDoSmdRequest,
  ): Promise<DeleteDoSmdResponse> {
    return this.service.deleteDoSmd(payload);
  }

  @Delete('bagging')
  public deleteBagging(
    @Body() payload: DeleteBaggingRequest,
  ): Promise<DeleteBaggingResponse> {
    return this.service.deleteBagging(payload);
  }

  @Delete('bagRepresentative')
  public deleteBagRepresentative(
    @Body() payload: DeleteBagRepresentativeRequest,
  ): Promise<DeleteBagRepresentativeResponse> {
    return this.service.deleteBagRepresentative(payload);
  }
}
