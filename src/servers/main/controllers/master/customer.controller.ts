import { Controller, Post, UseGuards, HttpCode, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { CustomerService } from '../../services/master/customer.service';
import { CustomerFindAllResponseVm } from '../../models/customer.response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

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
    return this.customerService.findCustName(payload);
  }
}
