import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class DoReturnPayloadVm {
  @ApiModelProperty()
  returnAwbId: string[];

  @ApiModelProperty()
  returnStatus: number;
}
