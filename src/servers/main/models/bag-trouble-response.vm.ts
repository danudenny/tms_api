import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { BagTroubleVm } from './bag-trouble.vm';

export class BagTroubleResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [BagTroubleVm] })
  data: BagTroubleVm[];
}
