import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { Type } from 'class-transformer';

export class BagOrderResponseVm {
  @ApiModelProperty()
  @Type(() => String)
  awbNumber: string[];
}

export class AuditHistVm {
  @ApiModelProperty({ format: 'date-time' })
  createdTime: Date;

  @ApiModelProperty()
  note: string;

  @ApiModelProperty()
  username: string;

  // @ApiModelProperty()
  // cabang: string;
}

export class BranchSearchVm {
  @ApiModelProperty()
  search: string;

}

export class BagDeliveryDetailResponseVm {
  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  createdName: string;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  totalScanOutAwb: number;

  @ApiModelProperty()
  totalScanOutBag: number;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => [AuditHistVm] })
  history: AuditHistVm[];
}

export class BagDetailResponseVm {
  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  createdName: string;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  totalScanOutAwb: number;

  @ApiModelProperty()
  totalScanOutBag: number;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => [AuditHistVm] })
  history: AuditHistVm[];
}

export class PhotoDetailResponseVm {
  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  type: string;

  @ApiModelProperty()
  awbNumber: string;
}

export class PhotoResponseVm {
  @ApiModelProperty({ type: () => [PhotoDetailResponseVm] })
  data: PhotoDetailResponseVm[];
}