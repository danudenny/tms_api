import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class AwbPatchStatusPayloadVm {
  @ApiModelProperty()
  data: string[];
}

export class AwbPatchStatusSuccessResponseVm {
  @ApiModelProperty()
  errors: string[];

  @ApiModelProperty({ example: 'Update Status Success' })
  message: string;

  @ApiModelProperty({ example: 200 })
  status: number;
}

export class AwbPatch3PLResiPayloadVm {
  @ApiModelProperty()
  resi: string[];

  @ApiModelProperty()
  resiPengganti: string[];
}