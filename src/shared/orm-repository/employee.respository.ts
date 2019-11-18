import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';

import {Employee } from '../orm-entity/employee';
import { BaseRepository } from './base.repository';

@Injectable()
@EntityRepository(Employee)
export class EmployeeRepository extends BaseRepository<Employee> {
  findByName(name: string,alamat:string) {
    return this.findOneOrFail({
      where: {
        name,
      },
    });
  }
}
