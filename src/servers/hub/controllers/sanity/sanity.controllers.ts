import {
  Body,
  Controller,
  Delete,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { SANITY_SERVICE, SanityService } from '../../interfaces/sanity.service';
import { DeleteBagRequest } from '../../models/sanity/sanity.request';
import { DeleteBagResponse } from '../../models/sanity/sanity.response';

@ApiUseTags('Backdoor APIs for Sanity Testing')
@Controller('sanity')
export class SanityController {
  constructor(
    @Inject(SANITY_SERVICE) private readonly service: SanityService,
  ) {}

  @Delete('bag')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public scanOutList(
    @Body() payload: DeleteBagRequest,
  ): Promise<DeleteBagResponse> {
    return this.service.deleteBag(payload);
  }
}
