import { Controller, Get, Query, Post, UseGuards, HttpCode, Body, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { BranchService } from '../../services/master/branch.services';
import { BranchFindAllResponseVm } from '../../models/branch.response.vm';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { CustomerPayloadVm } from '../../models/customer.vm';
import { CustomerService } from '../../services/master/customer.services';
import { CustomerFindAllResponseVm } from '../../models/customer.response.vm';

@ApiUseTags('Master Data')
@Controller('master/customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('list')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: CustomerFindAllResponseVm })
  public async findCustName(@Body() payload: CustomerPayloadVm) {

    return this.customerService.findCustName(payload);
  }
}
