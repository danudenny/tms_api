import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Param } from '@nestjs/common';

import { EmployeeService } from '../../../../servers/main/services/master/employee.service';
import { ApiBearerAuth, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';

@ApiUseTags('Master Data')
@Controller('master/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('list/:branchId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployeeBranch(@Param('branchId') branchId: string, @Body() payload: BaseMetaPayloadVm) {
    return this.employeeService.findAllEmployeeByRequestBranch(payload, branchId);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployee(@Body() payload: BaseMetaPayloadVm) {
    return this.employeeService.findAllEmployeeByRequest(payload);
  }
}
