import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class EmployeePhonePayloadVm {
  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  phone: string;
}
