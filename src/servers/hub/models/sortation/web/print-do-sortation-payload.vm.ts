import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../../../shared/external/nestjs-swagger';

export class PrintDoSortationPayloadQueryVm {
  @ApiModelProperty()
  id: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  printCopy: number;

  @ApiModelPropertyOptional()
  isReprint: boolean;
}
