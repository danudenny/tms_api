import { ApiModelProperty } from '@nestjs/swagger';

export class RoleVm {
  @ApiModelProperty()
  role_id: string;

  @ApiModelProperty()
  role_name: string;
}
