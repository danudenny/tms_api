import { Controller,  Query, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { toInteger } from 'lodash';
import { MetaService } from '../../../shared/services/meta.service';
import { EmployeeFindAllResponseVm } from '../models/employee.response.vm';
import { employeeService } from '../../../servers/main/services/master/employee.services';


@ApiUseTags('Master Data')
@Controller('dropdown')
export class employeeController {
  constructor(
    private readonly employeeService: employeeService,
  ) {}

  @Post('employee')
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  public async findAllEmployee(@Query('page') page: number,@Query('limit') take: number,
  ) {
    return this.employeeService.findAllEmployeeVm(page, take);
  }
}

