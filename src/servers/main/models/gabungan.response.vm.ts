import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
// import { GabunganSearchVm } from './gabungan-payload.vm';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { GabunganVm } from './gabungan.vm';

export class GabunganFindAllResponseVm   {

  @ApiModelProperty({ type: [GabunganVm] })
  data: GabunganVm[];

}

