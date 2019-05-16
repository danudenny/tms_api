import { ApiModelProperty } from '../external/nestjs-swagger';

export class MetaResponseVm {
  @ApiModelProperty()
  currentPage: number;

  @ApiModelProperty()
  nextPage: number;

  @ApiModelProperty()
  prevPage: number;

  @ApiModelProperty()
  totalPage: number;

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  limit: number;
}

export class BaseMetaResponseVm {
  @ApiModelProperty({ type: () => MetaResponseVm })
  paging: MetaResponseVm;
}
