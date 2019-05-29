import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { GabunganSearchVm } from './gabungan.vm';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class GabunganFindAllResponseVm extends BaseMetaResponseVm  {

  @ApiModelProperty({ type: () => [GabunganSearchVm] })
  data: GabunganSearchVm[];
}

