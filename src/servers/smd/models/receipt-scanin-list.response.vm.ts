import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ReceiptScaninListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ReceiptScaninListDataResponseVm] })
  data: ReceiptScaninListDataResponseVm[];
}

export class ReceiptScaninListDataResponseVm {
  @ApiModelProperty()
  receivedBagId: string;

  @ApiModelProperty()
  receivedBagCode: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  userId: string;

  @ApiModelProperty()
  fullName: string;

  @ApiModelProperty()
  receivedBagDate: string;

  @ApiModelProperty()
  totalBagNumber: string;

  @ApiModelProperty()
  totalBagWeight: string;
}

export class ReceiptScaninDetailListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ReceiptScaninDetailListDataResponseVm] })
  data: ReceiptScaninDetailListDataResponseVm[];
}

export class ReceiptScaninDetailListDataResponseVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  bagWeight: string;

  @ApiModelProperty()
  receivedBagDetailId: string;
}
