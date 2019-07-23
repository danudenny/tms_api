import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';

import { User } from '../orm-entity/user';

@Injectable()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

  findByEmailOrUsername(email: string, username) {
    // TODO: condition query get user
    if (email) {
      // email get from UserApi??
      return this.findOne({
        where: {
          email,
        },
      });
    } else {
      // username get from User??
      return this.findOne({
        where: {
          username,
        },
      });
    }
  }

  findByUserIdWithRoles(user_id: number) {
    return this.findOne({
      relations: ['roles'],
      where: {
        userId: user_id,
      },
    });
  }

}
