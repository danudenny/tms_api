import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class ScanAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

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
  bagItemId: number;

  @ApiModelProperty({ type: [DistrictVm] })
  data: DistrictVm[];
}
