import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { DeliveryPayloadVm } from './mobile-dashboard.vm';
import { WebDeliveryPayloadVm } from './web-delivery-payload.vm';


export class WebDeliveryVm {
  @ApiModelProperty()
  scanInDateTime: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  branchNameScan: string;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  scanInStatus: string;

}

export class WebDeliveryFilterPayloadVm {
  @ApiModelProperty({ type: () => WebDeliveryPayloadVm })
  filters: WebDeliveryPayloadVm;

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
  @ApiModelProperty({ type: () => WebDeliveryPayloadVm })
  filters: WebDeliveryPayloadVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}
