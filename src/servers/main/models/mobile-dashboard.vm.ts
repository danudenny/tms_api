import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { DeliveryListVm } from './deliveryList.vm';

export class MobiledashboardVm {
  @ApiModelProperty()
  today_awb_cod: number;

  @ApiModelProperty()
  is_cod: string;

  @ApiModelProperty()
  today_pod_problem: number;

  @ApiModelProperty()
  today_delivery: number;

  @ApiModelProperty()
  today_cod_value_not_transfer: number;

  @ApiModelProperty()
  this_week_delivery: number;
}

export class MobiledashboardRequestVm {
  @ApiModelProperty()
  clientId: string;
}

export class MobileDashboardhistVm {
  @ApiModelProperty()
  historyDate: Date;

  @ApiModelProperty({ type: [DeliveryListVm] })
  List: DeliveryListVm[];

}

export class DeliveryPayloadVm {
  @ApiModelProperty()
  employeeId: string;

  @ApiModelProperty()
  startDeliveryDateTime: string;

  @ApiModelProperty()
  endDeliveryDateTime: string;

}

export class DeliveryListPayloadVm {

  @ApiModelProperty()
  startDeliveryDateTime: string;

  @ApiModelProperty()
  endDeliveryDateTime: string;

}
export class WebDeliveryListPayloadVm {

  @ApiModelProperty()
  startDeliveryDateTime: string;

  @ApiModelProperty()
  endDeliveryDateTime: string;

}
export class DeliveryFilterPayloadVm {
  @ApiModelProperty({ type: () => DeliveryListPayloadVm })
  filters: DeliveryListPayloadVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}

export class WebDeliveryListFilterPayloadVm {
  @ApiModelProperty({ type: () => WebDeliveryListPayloadVm })
  filters: WebDeliveryListPayloadVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}

