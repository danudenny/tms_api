import { ApiModelProperty } from '@nestjs/swagger';
import { BaseTimestampVm } from '../../../shared/models/base-internal-timestamp.vm';
// import { AccessPermissionVm } from './access-permission.vm';

export class RoleVm extends BaseTimestampVm {
  @ApiModelProperty()
  id: string;

  @ApiModelProperty()
  name: string;

  // @ApiModelProperty({ type: () => [AccessPermissionVm] })
  // accesses: AccessPermissionVm[];
}
