import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseTimestampVm } from '../../../shared/models/base-internal-timestamp.vm';

export class AccessPermissionVm extends BaseTimestampVm {
  @ApiModelProperty()
  id: string;

  @ApiModelProperty()
  name: string;
}
