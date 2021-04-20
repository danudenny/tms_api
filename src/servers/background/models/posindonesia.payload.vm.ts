import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class PosindonesiaPayloadVm {
  @ApiModelProperty()
  awb: number;

  @ApiModelProperty()
  branch_code: number;

  @ApiModelPropertyOptional()
  partner_id: string;

}
