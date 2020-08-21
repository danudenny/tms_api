import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import {BaseMetaResponseVm} from '../../../shared/models/base-meta-response.vm';

export class MappingDoSmdVm {
  @ApiModelProperty()
  doSmdId: number;

  @ApiModelProperty()
  doSmdCode: string;
}
export class MappingDoSmdResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MappingDoSmdVm] })
  data: MappingDoSmdVm[];
}

export class MappingVendor {
  @ApiModelProperty()
  vendorId: number;

  @ApiModelProperty()
  vendorCode: string;

  @ApiModelProperty()
  vendorName: string;
}
export class MappingVendorResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MappingVendor] })
  data: MappingVendor[];
}
