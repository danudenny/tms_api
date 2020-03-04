import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintDoPodDoReturnPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  printCopy: number;
}
