import { Controller,  Query, Post, HttpCode, UseGuards, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';
import { EmployeeService } from '../../../../servers/main/services/master/employee.services';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { EmployeePayloadVm } from '../../models/employeePayload.vm';
import { employeeRepository } from '../../../../shared/orm-repository/employee.respository';
import { Employee } from 'src/shared/orm-entity/employee';
import { DeepPartial } from 'typeorm';
import { EmployeeVm, EmployeeRequestPayloadVm } from '../../models/employee.vm';

@ApiUseTags('Master Data')
@Controller('api/data')
export class EmployeeController {
  constructor(private readonly EmployeeService: EmployeeService) {}

  @Post('employee')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployee(@Body() payload:EmployeeRequestPayloadVm) {

    return this.EmployeeService.findAllEmployeeVm(payload.page, payload.limit);
  }
}

