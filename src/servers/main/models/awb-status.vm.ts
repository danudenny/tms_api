import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class AwbStatusVm {
  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  awbStatusTitle: string;

  @ApiModelProperty()
  awbStatusName: string;
}

export class AwbStatusSearchVm {
  @ApiModelProperty()
  search: string;

}

export class AwbStatusPayloadVm {
  @ApiModelProperty({ type: () => AwbStatusSearchVm })
  filters: AwbStatusSearchVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}

// response
export class AwbStatusFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [AwbStatusVm] })
  data: AwbStatusVm[];
}
