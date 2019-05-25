import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class WebScanInResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  podScaninDateTime: string;

  @ApiModelProperty()
  awbId: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  employeId: string;

}
