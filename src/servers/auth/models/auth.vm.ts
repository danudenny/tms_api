import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { Employee } from 'src/shared/orm-entity/employee';

export class AuthLoginByEmailOrUsernamePayloadVM {
  // @ApiModelProperty()
  // clientId: string;
  @ApiModelProperty()
  employee_id : string;

  @ApiModelPropertyOptional()
  email: string;

  @ApiModelPropertyOptional()
  username: string;

  @ApiModelProperty()
  password: string;
}

export class AuthLoginResponseVM {
  @ApiModelProperty()
  // userId: string;
  user_id: string;

  @ApiModelProperty()
  accessToken: string;

  @ApiModelProperty()
  refreshToken: string;

  @ApiModelProperty()
  email: string;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  displayName: string;

  @ApiModelProperty({ type: [String] })
  roles: string[];

  @ApiModelProperty({ type: [String] })
  rolesAccessPermissions: string[];
}
