import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';

export class BagReportListPayloadVm {

  @ApiModelProperty()
  limit: number;

  @ApiModelPropertyOptional()
  page: number;
}

export class BagReportGeneratePayloadVm {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelProperty()
  branchId: number;
}
