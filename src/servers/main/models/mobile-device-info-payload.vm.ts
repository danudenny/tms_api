import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileDeviceInfoPayloadVm {
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
