import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class EmployeeVm {
  @ApiModelProperty()
  employeeId: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  employeeName: string;
}

export class EmployeeSearchVm {
  @ApiModelProperty()
  search: string;
}

export class EmployeeRequestPayloadVm {
  @ApiModelProperty({ type: () => EmployeeSearchVm })
  filters: EmployeeSearchVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}