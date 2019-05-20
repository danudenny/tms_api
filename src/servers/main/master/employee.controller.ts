import { Controller,  Query, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { toInteger } from 'lodash';
import { MetaService } from '../../../shared/services/meta.service';
import { EmployeeFindAllResponseVm } from '../models/employee.response.vm';
import { employeeRepository } from '../../../shared/orm-repository/employee.respository';


@ApiUseTags('Master Data')
@Controller('dropdown')
export class employeeController {
  constructor(
    private readonly employeeRepository: employeeRepository,
  ) {}

  @Post('employee')
  @ApiOkResponse({ type: EmployeeFindAllResponseVm })
  async findAllEmployee(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip  = (page - 1) * take;
    const [data, total] = await this.employeeRepository.findAndCount(
      {
        cache: true,
        take,
        skip,
      },
    );
    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);
    return result;
  }
}
