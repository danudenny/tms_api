import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ScanBaggingVm {
  @ApiModelProperty()
  baggingNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}
export class WebScanInBaggingResponseVm  {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanBaggingVm] })
  data: ScanBaggingVm[];
}

export class ScanBagRepresentativeVm {
  @ApiModelProperty()
  bagRepresentativeNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}
export class WebScanInBagRepresentativeResponseVm  {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanBagRepresentativeVm] })
  data: ScanBagRepresentativeVm[];
}

export class WebScanInHubBagRepresentativeSortListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInHubBagRepresentativeSortResponseVm] })
  data: WebScanInHubBagRepresentativeSortResponseVm[];
}

export class WebScanInHubBagRepresentativeSortResponseVm {

  @ApiModelProperty()
  dropoffHubBagRepresentativeId: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  bagRepresentativeCode: string;

  @ApiModelProperty()
  branchNameScan: string;

  @ApiModelProperty()
  branchIdScan: number;

  @ApiModelProperty()
  branchNameFrom: string;

  @ApiModelProperty()
  branchIdFrom: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  representativeFrom: string;
}

export class WebScanInHubBagRepresentativeDetailSortListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInHubBagRepresentativeDetailSortResponseVm] })
  data: WebScanInHubBagRepresentativeDetailSortResponseVm[];
}

export class WebScanInHubBagRepresentativeDetailSortResponseVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  districtName: string;

}

export class SmdHubBaggingListDataResponseVm {
  @ApiModelProperty()
  baggingCode: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  dropoffHubBaggingId: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchScanName: string;

  @ApiModelProperty()
  totalAwb: string;

  @ApiModelProperty()
  weight: string;
}

export class SmdHubBaggingListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmdHubBaggingListDataResponseVm] })
  data: SmdHubBaggingListDataResponseVm[];
}

export class SmdHubBaggingDetailResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [SmdHubBaggingDetailDataResponseVm] })
  data: SmdHubBaggingDetailDataResponseVm[];
}

export class SmdHubBaggingDetailDataResponseVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  districtName: string;
}
