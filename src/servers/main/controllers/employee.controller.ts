import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards, Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit, pick } from 'lodash';

import { RoleAuthGuardOptions } from '../../../shared/decorators/role-auth-guard-options.decorator';
import { ApiOkResponse, ApiUseTags } from '../../../shared/external/nestjs-swagger';
import { LinqRepository } from '../../../shared/external/typeorm-linq-repository/repository/LinqRepository';
import { Transactional } from '../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { RoleAuthGuard } from '../../../shared/guards/role.guard';
import { Employee } from 'src/shared/orm-entity/employee';
import { employeeRepository } from 'src/shared/orm-repository/employee.respository';
import { UserCreateAdminPayloadVm } from 'src/servers/auth/models/user-create-admin-payload.vm';
import { UserCreateCourierPayloadVm } from 'src/servers/auth/models/user-create-courier-payload.vm';
// import { UserCreateDispatcherPayloadVm } from '../models/user-create-dispatcher-payload.vm';
import { UserFindAllPayloadVm, UserFindAllResponseVm } from '../../auth/models/user-find-all.vm';
import { UserUpdatePayloadVm } from 'src/servers/auth/models/user-update-response.vm';
import { UserVm } from 'src/servers/auth/models/user.vm';
import { Users } from 'src/shared/orm-entity/users';

@ApiUseTags('User')
@Controller('api/users')
@UseGuards(RoleAuthGuard)
@RoleAuthGuardOptions('Admin')
@Injectable()
export class UserController {
  constructor(
    @Inject(forwardRef(() => employeeRepository))
    private userRepository: employeeRepository,
  ) {}

  @Post('q')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserFindAllResponseVm })
  @Transactional()
  public async getUsers(
    @Body() payload: UserFindAllPayloadVm,
    @Query('keyword') queryKeyword: string,
    @Query('roles') roleNames: string[],
  ) {
    // const userLinqRepository = new LinqRepository(users);
    // const q = userLinqRepository.getAll();

    // q.orderBy(u => u.displayName);

    // q.include(u => u.tenant)
    //   .include(u => u.outlets)
    //   .usingBaseType();

    // const response = new UserFindAllResponseVm();

    // if (payload.sort && payload.sort.length) {
    //   payload.sort.forEach(sortItem => {
    //     switch (sortItem.dir) {
    //       case 'asc':
    //         q.orderBy(() => sortItem.field);
    //         break;
    //       case 'desc':
    //         q.orderByDescending(() => sortItem.field);
    //         break;
    //     }
    //   });
    // }

    // if (queryKeyword) {
    //   q.or(u => u.displayName)
    //     .contains(queryKeyword)
    //     .or(u => u.username)
    //     .contains(queryKeyword)
    //     .or(u => u.email)
    //     .contains(queryKeyword);
    // }

    // if (roleNames && roleNames.length) {
    //   q.join(u => u.roles)
    //     .where(r => r.name)
    //     .in(roleNames);
    // } else {
    //   q.include(u => u.roles).usingBaseType();
    // }

    // const usersTotal = await q.count();
    // response.total = usersTotal || 0;

    // const users = await q.skip(payload.skip).take(payload.take);
    // response.data = (users as any) || [];

    // return response;
  }

  @Post('admin/create')
  @ApiOkResponse({ type: UserVm })
  @Transactional()
  public async createAdminUser(@Body() payload: UserCreateAdminPayloadVm) {
    return this.userRepository.createAdminUser(payload);
  }

  // @Post('dispatcher/create')
  // @ApiOkResponse({ type: UserVm })
  // @Transactional()
  // public async createDispatcherUser(
  //   @Body() payload: UserCreateDispatcherPayloadVm,
  // ) {
  //   return this.userRepository.createDispatcherUser(
  //     omit(payload, ['siCepatUserId', 'outletId']),
  //     pick(payload, 'siCepatUserId'),
  //     payload.outletId,
  //   );
  // }

  @Post('courier/create')
  @ApiOkResponse({ type: UserVm })
  @Transactional()
  public async createCourierUser(
    @Body() payload: UserCreateCourierPayloadVm,
  ) {
    return this.userRepository.createCourierUser(
      omit(payload, ['siCepatUserId', 'outletId']),
      pick(payload, 'siCepatUserId'),
      payload.outletId,
    );
  }

  // @Put(':id/update')
  // @ApiOkResponse({ type: UserVm })
  // @Transactional()
  // public async updateUser(
  //   @Param('id') userId: string,
  //   @Body() payload: UserUpdatePayloadVm,
  // ) {
  //   await this.userRepository.update(userId,payload);

  //   return this.userRepository.findById(userId);
  // }

  @Get(':id')
  @ApiOkResponse({ type: UserVm })
  @Transactional()
  public async getDetailUser(@Param('id') userId: string) {
    return this.userRepository.findById(userId);
  }
}
