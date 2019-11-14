import { IsEmail } from 'class-validator';
import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class UserCreateAdminPayloadVm {
  @ApiModelProperty()
  displayName: string;

  @ApiModelProperty()
  phone: string;

  @ApiModelProperty()
  @IsEmail()
  email: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  password: string;
}
