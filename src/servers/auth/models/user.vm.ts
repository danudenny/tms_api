import {
  ApiModelProperty,
} from '../../../shared/external/nestjs-swagger';

export class UserVm {
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

export class UserResetPassword {
  @ApiModelProperty()
  requestId: string;

  @ApiModelProperty()
  password: string;

  @ApiModelProperty()
  passwordConfirmation: string;
}
