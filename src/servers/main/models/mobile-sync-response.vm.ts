import { MobileInitDataResponseVm } from './mobile-init-data-response.vm';
import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileSyncResponseVm extends MobileInitDataResponseVm {}

export class MobileSyncAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  process: boolean;

  @ApiModelProperty()
  message: string;
}

export class MobileSyncDataResponseVm {
  @ApiModelProperty({ type: [MobileSyncAwbVm] })
  data: MobileSyncAwbVm[];
}

export class MobileSyncImageResponseVm {

  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  url: string;
}

export class MobileSyncImageDataResponseVm {
  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  totalData: number;
}
