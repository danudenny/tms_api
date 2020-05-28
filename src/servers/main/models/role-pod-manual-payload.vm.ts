import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import {BaseMetaPayloadVm} from '../../../shared/models/base-meta-payload.vm';

// tslint:disable-next-line:class-name
export class RolePodManualPayloadStoreVm {

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  isBulky: boolean;
}

export class RolePodManualPayloadPostVm {
  @ApiModelProperty({ type: () => [RolePodManualPayloadStoreVm]})
  data: RolePodManualPayloadStoreVm[];
  @ApiModelProperty({
    example: 12345,
  })
  roleId: number;
}

export class RolePodManualPayloadGetVm {
  @ApiModelProperty({
    example: 12345,
  })
  roleId: number;
}