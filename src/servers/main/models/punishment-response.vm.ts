import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class PunishmentBranchListResponse {
  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchId: string;

  @ApiModelProperty()
  branchName: string;
}