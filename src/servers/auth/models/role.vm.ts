import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class RoleVm {
  @ApiModelProperty()
  role_id: string;

  @ApiModelProperty()
  role_name: string;
}
