import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class MobileGoPayloadVm {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  longitudeStart: string;

  @ApiModelProperty()
  latitudeStart: string;

  @ApiModelPropertyOptional()
  branchIdStart?: string;

  @ApiModelPropertyOptional()
  branchCode?: string;

}
