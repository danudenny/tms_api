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