import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import {BaseMetaResponseVm} from '../../../shared/models/base-meta-response.vm';

export class SmdScanBaggingResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  baggingId: string;
}

export class ListBaggingDetailVm {
  @ApiModelProperty()
  baggingCode: string;

  @ApiModelProperty()
  branchBagging: string;

  @ApiModelProperty()
  baggingDate: string;

  @ApiModelProperty()
  baggingScanDate: string;

  @ApiModelProperty()
  totalItem: string;

  @ApiModelProperty()
  totalWeight: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  user: string;
}

export class ListBaggingResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ListBaggingDetailVm] })
  data: ListBaggingDetailVm[];
}
