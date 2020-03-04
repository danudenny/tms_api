import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintDoPodReturnPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  printCopy: number;
}
