import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class EmployeePhoneResponseVm {
  @ApiModelProperty()
  code: number;

  @ApiModelProperty()
  message: string;

}
