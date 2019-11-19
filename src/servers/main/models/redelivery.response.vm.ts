import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { EmployeeVm } from './employee.vm';
import { RedeliveryVm } from './redelivery.vm';

export class RedeliveryFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [RedeliveryVm] })
  data: RedeliveryVm[];

}
