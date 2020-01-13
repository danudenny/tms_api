import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';

import { User } from '../orm-entity/user';

@Injectable()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

  // NOTE: email or username must be unique
  findByEmailOrUsername(email: string, username) {
    // TODO: condition query get user
    if (email) {
      // email get from UserApi??
      return this.findOne({
        where: {
          email,
          isDeleted: false,
        },
      });
    } else {
      // username get from User??
      return this.findOne({
        where: {
          username,
          isDeleted: false,
        },
      });
    }
  }

  findByUserIdWithRoles(user_id: number) {
    return this.findOne({
      relations: ['roles'],
      where: {
        userId: user_id,
        isDeleted: false,
      },
    });
  }

}
