import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class AwbHighValueUploadResponseVm {
  @ApiModelProperty()
  notValid: string[];

  @ApiModelProperty()
  totalNotValid: number;

  @ApiModelProperty()
  totalValid: number;
}
