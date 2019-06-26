import { ApiModelProperty } from '../external/nestjs-swagger';

export class MetaPayloadPageSort {
  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}
