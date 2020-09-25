import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class AwbStatusVm {
  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  awbStatusCode: string;

  @ApiModelProperty()
  awbStatusTitle: string;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty()
  isDeleted: boolean;
}
export class AwbStatusNonDeliveVm {
  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  isBulky: boolean;

  @ApiModelProperty()
  awbStatusCode: string;

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

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'awb_status_name',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}

// response
export class AwbStatusFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [AwbStatusVm] })
  data: AwbStatusVm[];
}

export class AwbStatusNonDeliveFindAllResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [AwbStatusNonDeliveVm] })
  data: AwbStatusNonDeliveVm[];
}
