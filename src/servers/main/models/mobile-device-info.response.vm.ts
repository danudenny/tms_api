import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
export class MobileDeviceInfoResponseVm {
  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  isSucces: boolean;

  @ApiModelProperty()
  mobileDeviceInfoId: string;
}

export class MobileDeviceInfoDetailResponseVm {
  @ApiModelProperty()
  imei: string;

  @ApiModelProperty()
  manufacture: string;

  @ApiModelProperty()
  brand: string;

  @ApiModelProperty()
  product: string;

  @ApiModelProperty()
  model: string;

  @ApiModelProperty()
  token: string;

  @ApiModelProperty()
  version: string;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  dateTime: Date;
}

export class ListMobileDeviceInfoResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MobileDeviceInfoDetailResponseVm] })
  data: MobileDeviceInfoDetailResponseVm[];
}

