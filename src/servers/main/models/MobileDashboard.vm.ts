import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { DeliveryListVm } from './DeliveryList.vm';

export class MobiledashboardVm {
  @ApiModelProperty()
  today_awb_cod: number;

  @ApiModelProperty()
  today_pod_problem: number;

  @ApiModelProperty()
  today_delivery: number;

  @ApiModelProperty()
  today_cod_value: number;

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



