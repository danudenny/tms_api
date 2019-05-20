import { Controller,  Query, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { EmployeeService } from '../../../../servers/main/services/master/employee.services';

@ApiUseTags('Master Data')
@Controller('dropdown')

export class EmployeeController {
  constructor(
    private readonly employeeService: EmployeeService,
  ) {}

  @Post('employee')
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployee(@Query('page') page: number,@Query('limit') take: number,
  ) {
    return this.employeeService.findAllEmployeeVm(page, take);
  }
}
