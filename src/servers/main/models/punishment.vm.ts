import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PunishmentBranchListPayload {
  @ApiModelProperty()
  employeeId: string;
}