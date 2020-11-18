import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

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
}

export class MobileDeviceInfoResponseVm {
  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  isSucces: boolean;

  @ApiModelProperty()
  mobileDeviceInfoId: number;

  @ApiModelProperty({type : () => MobileDeviceInfoDetailResponseVm})
  detail: MobileDeviceInfoDetailResponseVm;
}
