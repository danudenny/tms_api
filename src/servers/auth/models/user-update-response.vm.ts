import { IsEmail } from 'class-validator';
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class UserUpdatePayloadVm {
  @ApiModelProperty()
  displayName: string;

  @ApiModelProperty()
  phone: string;

  @ApiModelProperty()
  @IsEmail()
  email: string;

  @ApiModelProperty()
  username: string;

  @ApiModelPropertyOptional()
  password: string;
}
