import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { EmployeeVm } from './employee.vm';

export class EmployeeFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [EmployeeVm] })
  data: EmployeeVm[];
}
