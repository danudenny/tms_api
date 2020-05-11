import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import { BaseMetaResponseVm } from 'src/shared/models/base-meta-response.vm';

// tslint:disable-next-line:class-name
export class RolePodManualResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class RolePodManualResponseGetDataVm {

  @ApiModelProperty()
  settingStatusRoleId: string;
  @ApiModelProperty()
  roleId: number;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  isBulky: boolean;

}

export class PodManualStatusResponseGetVm {
  @ApiModelProperty({ type: () => [RolePodManualResponseGetDataVm] })
  data: any[];
  @ApiModelProperty()
  message: string;
  @ApiModelProperty()
  status: string;
}
