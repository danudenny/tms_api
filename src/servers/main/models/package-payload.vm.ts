import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { AwbPackageDetail } from './gabungan.response.vm';

export class OpenSortirCombineVM {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  podScanInHubId: string;

  @ApiModelProperty({ type: () => [AwbPackageDetail] })
  dataBag: AwbPackageDetail[];

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  bagSeq: number;

  @ApiModelProperty()
  weight: number;
}

export class PackageBagDetailVM {
  @ApiModelProperty()
  bagNumber: number;

  @ApiModelProperty()
  bagId: number;

  @ApiModelProperty()
  bagItemId: number;
}

export class CreateBagNumberResponseVM {
  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  podScanInHubId: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  bagSeq: number;
}

export class UnloadAwbPayloadVm {

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  bagNumber: string;
}

export class UnloadAwbResponseVm {
  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  bagItemId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  weight: number;
}

export class AwbScanPackageDetailVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  awbStatusIdLast: number;

  @ApiModelProperty()
  isPackageCombined: boolean;

  @ApiModelProperty()
  toId: number;

  @ApiModelProperty()
  totalWeightRealRounded: number;

  @ApiModelProperty()
  refReseller: string;

  @ApiModelProperty()
  pickupMerchant: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeNumber: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  customerAccountId: number;
}
