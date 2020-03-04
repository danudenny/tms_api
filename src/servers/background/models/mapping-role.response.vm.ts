import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class MappingRoleResponseVm {
  @ApiModelProperty()
  code: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: [];
}
