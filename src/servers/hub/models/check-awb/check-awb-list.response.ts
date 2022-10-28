import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponse } from '../../../../shared/models/base-meta-response.vm';

export class CheckAwbListResponVm extends BaseMetaResponse {

  @ApiModelProperty({type: () => [ListDataCheckAwbRespon]})
  data: ListDataCheckAwbRespon[];
}

export class CheckAwbDetailResponVm extends BaseMetaResponse {

  @ApiModelProperty({type: () => [DetailCheckAwbRespon]})
  data: DetailCheckAwbRespon[];
}

export class ListDataCheckAwbRespon {

  @ApiModelProperty()
  awbCheckId: string;

  @ApiModelProperty()
  startTime: string;

  @ApiModelProperty()
  endTime: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchCode: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  totalAwb: string;

}

export class DetailCheckAwbRespon {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  branchToName: string;

}
