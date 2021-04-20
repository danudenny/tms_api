import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { EmployeeVm } from './employee.vm';

export class EmployeeFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [EmployeeVm] })
  data: EmployeeVm[];
}

export class EmployeeResponseVm {
  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  homeAddress: string;

  @ApiModelProperty()
  idCardAddress: string;

  @ApiModelProperty()
  mobilePhone: string;

  @ApiModelProperty()
  attachmentUrl: string;
}
