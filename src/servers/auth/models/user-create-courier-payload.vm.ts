import { IsEmail } from 'class-validator';

import { ApiModelProperty } from '@nestjs/swagger';


export class UserCreateCourierPayloadVm {
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

  @ApiModelProperty()
  siCepatUserId: string;

  @ApiModelProperty()
  outletId: string;
}
