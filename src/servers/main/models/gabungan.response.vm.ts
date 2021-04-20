import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

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
  consigneeNumber: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  isTrouble: boolean;
}

export class MachinePackageResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [MachinePackageAwbResponseVm]})
  data: MachinePackageAwbResponseVm[];
}

export class MachinePackageAwbResponseVm {

  @ApiModelProperty()
  state: number;

  @ApiModelProperty()
  no_gabung_sortir: string;
}


export class PackageAwbResponseVm {

  @ApiModelPropertyOptional({ type: () => AwbPackageDetail })
  data: AwbPackageDetail;

  @ApiModelPropertyOptional({ type: () => [AwbPackageDetail] })
  dataBag: AwbPackageDetail[];

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelPropertyOptional()
  bagNumber: string;

  @ApiModelPropertyOptional()
  bagItemId: number;

  @ApiModelPropertyOptional()
  podScanInHubId: string;

  @ApiModelProperty()
  isAllow: boolean;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelPropertyOptional()
  bagSeq: number;

  @ApiModelPropertyOptional()
  bagWeight: number;

  @ApiModelPropertyOptional()
  weight: number;

  @ApiModelProperty()
  message: string;

}

export class PackageAwbBackupResponseVm   {

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
