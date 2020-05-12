import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

// tslint:disable-next-line:class-name
export class RolePodManualResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class RolePodManualResponseGetDataVm {
  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  isBulky: boolean;
  @ApiModelProperty()
  isReturn: boolean;

}

export class PodManualStatusResponseGetVm {
  @ApiModelProperty({ type: () => [RolePodManualResponseGetDataVm] })
  data: any[];
  @ApiModelProperty()
  message: string;
  @ApiModelProperty()
  status: string;
}
