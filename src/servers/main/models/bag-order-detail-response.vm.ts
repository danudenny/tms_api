import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { Type } from 'class-transformer';

export class BagOrderResponseVm {
  @ApiModelProperty()
  @Type(() => String)
  awbNumber: string[];
}

export class BagDetailResponseVm {
  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  userIdCreated: number;

  @ApiModelProperty()
  userIdDriver: number;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty()
  branchToName: string;

  @ApiModelProperty()
  totalScanOutAwb: number;

  @ApiModelProperty()
  totalScanOutBag: number;

  @ApiModelProperty()
  description: string;
}
