import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
// import { GabunganSearchVm } from './gabungan-payload.vm';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { GabunganVm } from './gabungan.vm';

export class GabunganFindAllResponseVm   {

  @ApiModelProperty({ type: [GabunganVm] })
  data: GabunganVm[];

}
export class AwbPackageDetail {
  @ApiModelProperty()
  awbNumber: number;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  totalWeightFinalRounded: number;

  @ApiModelProperty()
  shipperName: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  isTrouble: boolean;
}

export class PackageAwbResponseVm   {

  @ApiModelPropertyOptional({ type: () => AwbPackageDetail })
  data: AwbPackageDetail;

  @ApiModelPropertyOptional({ type: () => [AwbPackageDetail] })
  dataBag: AwbPackageDetail[];

  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  districtCode: string;

  @ApiModelProperty()
  districtName: string;

  @ApiModelPropertyOptional()
  bagItemId: number;

  @ApiModelPropertyOptional()
  bagNumber: string;

  @ApiModelPropertyOptional()
  bagSeq: number;

  @ApiModelPropertyOptional()
  bagItemWeight: number;

  @ApiModelPropertyOptional()
  podScanInHubId: string;

  @ApiModelProperty()
  isAllow: boolean;
}
