import { MobileInitDataResponseVm } from './mobile-init-data-response.vm';
import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MobileSyncResponseVm extends MobileInitDataResponseVm {}

export class MobileSyncImageResponseVm {

  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  url: string;
}
