import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

// response
export class VehicleSmdFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [VehicleVm] })
  data: VehicleVm[];
}

export class VehicleVm {
  @ApiModelProperty()
  vehicle_id: number;

  @ApiModelProperty()
  vehicle_number: string;

  @ApiModelProperty()
  vehicle_name: string;

}
