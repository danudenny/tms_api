import { ApiModelProperty, ApiModelPropertyOptional } from '../external/nestjs-swagger';

export class BaseResponse {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: any;

  @ApiModelPropertyOptional()
  code?: string;
}
