import { BaseQueryPayloadVm } from '../../../shared/models/base-query-payload.vm';
import { BaseQueryResponseVm } from '../../../shared/models/base-query-response.vm';
import { User } from '../../../shared/orm-entity/user';
import { UserVm } from './user.vm';
import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class UserFindAllPayloadVm extends BaseQueryPayloadVm<User> {
  // skip(skip: any) {
  //   throw new Error('Method not implemented.');
  // }
  // take(take: any) {
  //   throw new Error('Method not implemented.');
  // }
}

export class UserFindAllResponseVm extends BaseQueryResponseVm {
  @ApiModelProperty({ type: () => [UserVm] })
  data: UserVm[];
  total: number;
}
