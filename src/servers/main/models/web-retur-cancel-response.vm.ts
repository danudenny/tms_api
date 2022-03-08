import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

//VM for item List
export class ItemReturCancelResponse {
  @ApiModelProperty()
  awbReturnCancelId: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbItemId: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  updatedTime: string;

  @ApiModelProperty()
  notes: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  branchName: string;
}

export class WebReturCancelListResponse extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ItemReturCancelResponse] })
  data: ItemReturCancelResponse[];
}

//VM for create
export class ScanAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class WebAwbReturnCancelCreateResponse {
  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm[];
}

