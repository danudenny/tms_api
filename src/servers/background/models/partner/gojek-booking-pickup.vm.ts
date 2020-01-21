import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class GojekBookingPickupVm {
  @ApiModelProperty()
  workOrderId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  userId: number;
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

export class GojekBookingPickupResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => GojekBookingPayloadVm })
  data: GojekBookingPayloadVm;

  @ApiModelProperty({ type: () => GojekBookingResponseVm })
  response: GojekBookingResponseVm;
}
