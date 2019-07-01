import { Controller, Post, HttpCode, UseGuards, Body, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { EmployeeService } from '../../../../servers/main/services/master/employee.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Master Data')
@Controller('master/employee')
export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
  ) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployee(@Body() payload: BaseMetaPayloadVm) {

    return this.employeeService.findAllEmployeeVm(payload);
  }
}
