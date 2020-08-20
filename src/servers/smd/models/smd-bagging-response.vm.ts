import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import {BaseMetaResponseVm} from '../../../shared/models/base-meta-response.vm';

export class SmdScanBaggingResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  baggingId: string;

  @ApiModelProperty()
  baggingCode: string;

  @ApiModelProperty()
  validRepresentativeCode: string;
}

export class SmdScanBaggingDataMoreResponseVm extends SmdScanBaggingResponseVm {
  @ApiModelProperty()
  bagNumber: string;
}

export class SmdScanBaggingMoreResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [SmdScanBaggingDataMoreResponseVm] })
  data: SmdScanBaggingDataMoreResponseVm[];
}

export class ListBaggingDetailVm {
  @ApiModelProperty()
  baggingId: string;

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
  representativeName: string;

  @ApiModelProperty()
  user: string;
}

export class ListBaggingResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ListBaggingDetailVm] })
  data: ListBaggingDetailVm[];
}

export class ListDetailBaggingDataVm {
  @ApiModelProperty()
  baggingItemId: string;

  @ApiModelProperty()
  baggingId: string;

  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  bagNumber: string;
}

export class ListDetailBaggingResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ListDetailBaggingDataVm] })
  data: ListDetailBaggingDataVm[];
}
