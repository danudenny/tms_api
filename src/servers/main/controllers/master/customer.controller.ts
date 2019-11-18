import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { CustomerFindAllResponseVm } from '../../models/customer.response.vm';
import { CustomerService } from '../../services/master/customer.service';

@ApiUseTags('Master Data')
@Controller('master/customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
  ) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: CustomerFindAllResponseVm })
  public async findCustName(@Body() payload: BaseMetaPayloadVm) {
    return this.customerService.findAllByRequest(payload);
  }
}
