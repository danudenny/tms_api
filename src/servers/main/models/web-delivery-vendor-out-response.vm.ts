import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebDeliveryVendorOutResponse {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  awbNumber: string;
}

export class WebDeliveryVendorOutResponseVm {
  @ApiModelProperty({ type: () => [WebDeliveryVendorOutResponse] })
  data: WebDeliveryVendorOutResponse[];
}