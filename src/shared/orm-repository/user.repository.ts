import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Users } from '../orm-entity/users';
@Injectable()
@EntityRepository(Users)
export class UserRepository extends Repository<Users> {

  findByEmailOrUsername(email: string, username) {
    if (email) {
      return this.findOne({
        where: {
          email,
        },
      });
    } else {
      return this.findOne({
        where: {
          username,
        },
      });
    }
  }

}
