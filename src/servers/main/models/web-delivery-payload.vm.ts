import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { WebDeliverySearchVm, SearchColumnsVm } from '../../../shared/models/base-filter-search.payload.vm';

export class WebDeliveryPayloadVm {

  @ApiModelProperty()
  startDeliveryDateTime: string;

  @ApiModelProperty()
  endDeliveryDateTime: string;

  @ApiModelProperty()
  branchScanId: number;

  @ApiModelProperty()
  branchOriginId: number;

}

export class WebDeliveryListFilterPayloadVm {
  @ApiModelProperty()
  permissionToken: string;

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

  @ApiModelProperty({ type: () => WebDeliverySearchVm })
  search: WebDeliverySearchVm;

  @ApiModelProperty({ type: [SearchColumnsVm] })
  searchColumns: SearchColumnsVm[];
}
