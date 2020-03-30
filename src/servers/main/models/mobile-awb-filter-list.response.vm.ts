import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { MobileScanInBranchResponseVm } from './mobile-scanin.vm';

export class MobileAwbFilterListResponseVm {

  @ApiModelProperty({ type: () => [MobileScanInBranchResponseVm] })
  data: MobileScanInBranchResponseVm[];

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}
