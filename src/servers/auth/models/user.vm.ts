import { ApiModelProperty, ApiModelPropertyOptional }  from '@nestjs/swagger';
import { BaseAuthVm } from './base-auth.vm';
// import { UserSiCepatVm } from './user-si-cepat.vm';

export class UserVm extends BaseAuthVm {
  @ApiModelProperty()
  displayName: string;

  @ApiModelProperty()
  phone: string;

  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  username: string;

  // @ApiModelPropertyOptional({ type: () => UserSiCepatVm })
  // userSiCepat: UserSiCepatVm;
}
