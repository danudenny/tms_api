import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { CustomerVm } from './customer.vm';

export class CustomerFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [CustomerVm] })
  data: CustomerVm[];
}
