import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';

export class CheckAwbReportListPayloadVm {

  @ApiModelProperty()
  limit: number;

  @ApiModelPropertyOptional()
  page: number;
}

export class CheckAwbReportGeneratePayloadVm {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelProperty()
  branchId: number;
}
