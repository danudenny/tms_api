import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PrintDoPodDoReturnPayloadQueryVm {
  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty()
  printCopy: number;
}
