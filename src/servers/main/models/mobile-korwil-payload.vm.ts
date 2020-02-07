import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobilePostKorwilTransactionPayloadVm {
  @ApiModelPropertyOptional()
  isDone?: number;

  @ApiModelPropertyOptional()
  status?: string;

  @ApiModelProperty()
  note: number;

  @ApiModelProperty()
  longitude: number;

  @ApiModelProperty()
  latitude: number;

  @ApiModelProperty()
  branchId: string;
}