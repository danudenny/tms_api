import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class AwbPatchDataSuccessResponseVm {
  @ApiModelProperty()
  errors: string[];

  @ApiModelProperty({ example: 'Insert Data Success' })
  message: string;

  @ApiModelProperty({ example: 200 })
  status: number;
}
