import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
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
