import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../../shared/external/nestjs-swagger';

export class SortationReportListPayloadVm {

  @ApiModelProperty()
  limit: number;

  @ApiModelPropertyOptional()
  page: number;
}

export class SortationReportGeneratePayloladVm {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelPropertyOptional()
  branchId: number;
}
