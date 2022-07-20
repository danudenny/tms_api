import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

class DoSortationStatusVm {
  @ApiModelProperty()
  doSortationStatusId: number;

  @ApiModelProperty()
  doSortationStatusTitle: string;
}

export class DoSortationStatusResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [DoSortationStatusVm] })
  data: DoSortationStatusVm[];
}
