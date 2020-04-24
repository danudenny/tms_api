import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';

export class PrintDoPodReturnPayloadQueryVm {
  @ApiModelPropertyOptional()
  id?: number;

  @ApiModelProperty()
  printCopy: number;

  @ApiModelProperty()
  userIdDriver: number;
}

export class AwbDetailDoReturnDataVm {
  @ApiModelProperty()
  branch: string;

  @ApiModelProperty()
  userName: string;
}

export class UserDetailDoReturnDataVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  doReturnAwbNumber: string;
}

export class PrintDoPodReturnAdmiStorePayloadVm {
  @ApiModelProperty({ type: () => [AwbDetailDoReturnDataVm] })
  awbDetail: AwbDetailDoReturnDataVm[];

  @ApiModelProperty()
  userDriver: string;

  @ApiModelProperty()
  userIdDriver: string;

  @ApiModelProperty({ type: () => [UserDetailDoReturnDataVm] })
  userDetail: UserDetailDoReturnDataVm[];
}
