import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class CheckAwbListResponVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ListDataCheckAwbRespon]})
  data: ListDataCheckAwbRespon[];
}

export class CheckAwbDetailResponVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

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
  districtName: string;

}
