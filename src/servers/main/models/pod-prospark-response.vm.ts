import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class PodProsparkResponse {
  @ApiModelProperty()
  status: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  callback: string;
}