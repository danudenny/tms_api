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
  awbNumber: string;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  shipperName: string;

  @ApiModelProperty()
  consigneeName: string;
}

export class PackageAwbResponseVm   {

  @ApiModelPropertyOptional({ type: () => AwbPackageDetail })
  data: AwbPackageDetail;

  // @ApiModelProperty()
  // total: number;

  @ApiModelProperty()
  districtName: string;

  @ApiModelProperty()
  districtId: number;

  @ApiModelPropertyOptional()
  bagNumber: string;

  @ApiModelPropertyOptional()
  bagItemId: number;
}
