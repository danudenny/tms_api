import { Controller,  Query, Post, HttpCode, UseGuards, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { EmployeeService } from '../../../../servers/main/services/master/employee.services';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { EmployeeRequestPayloadVm } from '../../models/employee.vm';

@ApiUseTags('Master Data')
@Controller('master/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('list')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployee(@Body() payload: EmployeeRequestPayloadVm) {

    return this.employeeService.findAllEmployeeVm(payload);
  }
}
