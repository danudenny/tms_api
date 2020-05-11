import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { IsDefined } from 'class-validator';
import {BaseMetaPayloadVm} from '../../../shared/models/base-meta-payload.vm';

// tslint:disable-next-line:class-name
export class RolePodManualPayloadStoreVm {
  @ApiModelProperty({
    example: 12345,
  })
  roleId: number;

  @ApiModelProperty()
  isBulky: boolean;

  @ApiModelProperty({
    example: 12345,
  })
  awbStatusId: number;
  @ApiModelProperty({
    example: '12345',
  })
  userIdCreated: string;
}

export class RolePodManualPayloadGetVm {
  @ApiModelProperty({
    example: 12345,
  })
  roleId: number;
}