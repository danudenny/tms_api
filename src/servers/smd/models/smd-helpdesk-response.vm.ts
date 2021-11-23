import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class UpdateRepresentativeManualResponse {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;
}