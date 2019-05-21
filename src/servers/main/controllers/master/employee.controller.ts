import { Controller,  Query, Post, HttpCode, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { EmployeeService } from '../../../../servers/main/services/master/employee.services';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';

@ApiUseTags('Master Data')
@Controller('api/data')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('employee')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployee(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    return this.employeeService.findAllEmployeeVm(page, take);
  }
}
