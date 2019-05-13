import { ApiModelProperty } from '../external/nestjs-swagger';

export class MetaResponseVm {
  @ApiModelProperty()
  current_page: number;

  @ApiModelProperty()
  next_page: number;

  @ApiModelProperty()
  prev_page: number;

  @ApiModelProperty()
  total_pages: number;

  @ApiModelProperty()
  total_count: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  status: string;
}

export class BaseMetaResponseVm {
  @ApiModelProperty({ type: () => MetaResponseVm })
  meta: MetaResponseVm;
}
