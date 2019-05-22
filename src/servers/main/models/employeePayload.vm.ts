import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class EmployeePayloadVm {
  @ApiModelProperty()
  search: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  employeeName: string;
}
