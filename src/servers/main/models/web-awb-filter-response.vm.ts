import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class WebAwbFilterFinishScanResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class ScanAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebAwbFilterScanAwbResponseVm {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm[];
}

export class DistrictVm {
  @ApiModelProperty()
  districtCode: string;

  @ApiModelProperty()
  districtName: string;

  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalFiltered: number;
}

export class WebAwbFilterScanBagResponseVm {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  podFilterId: number;

  @ApiModelProperty()
  podFilterDetailId: number;

  @ApiModelProperty()
  podFilterCode: string;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty({ type: [DistrictVm] })
  data: DistrictVm[];
}

export class WebAwbFilterResponseVm {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagNumberSeq: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalFiltered: number;

  @ApiModelProperty()
  diffFiltered: number;

  @ApiModelProperty()
  moreFiltered: number;

  @ApiModelProperty()
  totalItem: number;

}

export class WebAwbFilterGetLatestResponseVm {

  @ApiModelProperty({ type: [DistrictVm] })
  data: WebAwbFilterScanBagResponseVm[];
}
