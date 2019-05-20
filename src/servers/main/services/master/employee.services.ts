import { Query, Injectable } from '@nestjs/common';
import { toInteger } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaService } from 'src/shared/services/meta.service';
import { employeeRepository } from 'src/shared/orm-repository/employee.respository';
import { Employee } from 'src/shared/orm-entity/employee';
import { EmployeeFindAllResponseVm } from '../../models/employee.response.vm';

const logger = require('pino')();

@Injectable()
export class employeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: employeeRepository,
  ) {}

  async findAllEmployeeVm(
    @Query('page') page: number,
    @Query('limit') take: number,
  ) {
    page = toInteger(page) || 1;
    take = toInteger(take) || 10;

    const skip = (page - 1) * take;
    const [data, total] = await Employee.findAndCount(
      {
        // where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
        cache: true,
        take,
        skip,
      },
    );
    const result = new EmployeeFindAllResponseVm();
    result.data = data;
    result.paging = MetaService.set(page, take, total);

    logger.info(`Total data :: ${total}`);
    return result;
  }
}

