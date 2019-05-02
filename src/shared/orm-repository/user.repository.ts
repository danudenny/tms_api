import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../orm-entity/user';
@Injectable()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

  findByEmailOrUsername(email: string, username) {
    if (email) {
      return this.findOne({
        relations: ['roles'],
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
