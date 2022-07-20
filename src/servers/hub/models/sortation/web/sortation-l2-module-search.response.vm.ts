import { ApiModelProperty } from '../../../../../shared/external/nestjs-swagger';

export class SortationL2ModuleSearchResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: any[];
}
