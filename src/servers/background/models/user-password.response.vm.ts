import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class UserPasswordResponseVm {
  @ApiModelProperty()
  code: number;

  @ApiModelProperty()
  message: string;

}
