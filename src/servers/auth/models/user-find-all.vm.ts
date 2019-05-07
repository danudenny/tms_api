import { ApiModelProperty } from '@nestjs/swagger';
import { BaseQueryPayloadVm } from '../../../shared/models/base-query-payload.vm';
import { BaseQueryResponseVm } from '../../../shared/models/base-query-response.vm';
import { Users } from '../../../shared/orm-entity/users';
import { UserVm } from './user.vm';

export class UserFindAllPayloadVm extends BaseQueryPayloadVm<Users> {
  skip(skip: any) {
    throw new Error("Method not implemented.");
  }
  take(take: any) {
    throw new Error("Method not implemented.");
  }
}

export class UserFindAllResponseVm extends BaseQueryResponseVm {
  @ApiModelProperty({ type: () => [UserVm] })
  data: UserVm[];
  total: number;
}
