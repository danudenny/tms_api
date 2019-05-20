import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class EmployeeVm {
  @ApiModelProperty()
  employeeId: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  employeeName: string;
}
