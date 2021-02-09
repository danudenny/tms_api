import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class UserPasswordPayloadVm {
  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  password: string;
}
