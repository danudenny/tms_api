import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class GojekBookingPodVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  doPodDeliverId: string;
}
export class GojekCancelBookingVm {
  @ApiModelProperty()
  orderNo: string;
}

export class GojekBookingResponseVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  orderNo: string;

  @ApiModelProperty()
  bookingType: string;

  @ApiModelProperty()
  errorMessage: string;
}

export class GojekBookingPayloadVm {
  @ApiModelProperty()
  originContactName: string;

  @ApiModelProperty()
  originContactPhone: string;

  @ApiModelProperty()
  originLatLong: string;

  @ApiModelProperty()
  originAddress: string;

  @ApiModelProperty()
  destinationContactName: string;

  @ApiModelProperty()
  destinationContactPhone: string;

  @ApiModelProperty()
  destinationLatLong: string;

  @ApiModelProperty()
  destinationAddress: string;

  @ApiModelProperty()
  item: string;
}

export class GojekBookingPodResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => GojekBookingPayloadVm })
  data: GojekBookingPayloadVm;

  @ApiModelProperty({ type: () => GojekBookingResponseVm })
  response: GojekBookingResponseVm;
}
