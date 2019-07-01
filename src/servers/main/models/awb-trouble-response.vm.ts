import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { AwbTroubleVm } from './awb-trouble.vm';

export class AwbTroubleResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [AwbTroubleVm] })
  data: AwbTroubleVm[];
}
