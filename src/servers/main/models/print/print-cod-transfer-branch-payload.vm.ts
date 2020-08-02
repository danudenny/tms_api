import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class PrintCodTransferBranchPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  printCopy: number;
}
