import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class PrintSmdPayloadVm {
  @ApiModelProperty()
  id: number;

  @ApiModelPropertyOptional()
  printCopy: number;
}
