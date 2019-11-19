import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { RepresentativeVm } from './representative.vm';

export class RepresentativeFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [RepresentativeVm] })
  data: RepresentativeVm[];
}
