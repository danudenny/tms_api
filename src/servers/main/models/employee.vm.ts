import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class EmployeeVm {
  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  employeeRoleId: number;

}

export class EmployeeSearchVm {
  @ApiModelProperty()
  search: string;
}

export class EmployeeRequestPayloadVm {
  @ApiModelProperty({ type: () => EmployeeSearchVm })
  filters: EmployeeSearchVm;

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'fullname',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}

export class EmployeeMergerVm {
  @ApiModelProperty()
  userRoleId: number;

  @ApiModelProperty()
  username: string;

  @ApiModelProperty()
  nickname: string;

  @ApiModelProperty()
  roleName: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchCode: string;
}
