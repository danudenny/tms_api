import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class CentralSortirPayloadVm {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelProperty()
  isSucceed: number;

  @ApiModelPropertyOptional()
  branchId: number;
}

export class CentralSortirListPayloadVm {

  @ApiModelProperty()
  limit: number;

  @ApiModelPropertyOptional()
  page: number;
}
