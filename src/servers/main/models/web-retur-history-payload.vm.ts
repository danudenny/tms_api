import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { ApiModelProperty, ApiModelPropertyOptional} from '../../../shared/external/nestjs-swagger';

export class WebReturHistoryPayloadVm extends BaseMetaPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelPropertyOptional()
  isManual: boolean;
}
