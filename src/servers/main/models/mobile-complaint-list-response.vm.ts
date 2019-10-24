import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from 'src/shared/models/base-meta-response.vm';

export class MobileComplaintListResponseVm {
  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  recipient: string;

  @ApiModelProperty()
  subject: string;
}

export class MobileComplaintListResponseAllVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [MobileComplaintListResponseVm] })
  data: MobileComplaintListResponseVm[];
}
