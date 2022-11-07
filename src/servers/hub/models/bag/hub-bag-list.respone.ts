import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponse } from '../../../../shared/models/base-meta-response.vm';

export class CheckBagGpListResponVm extends BaseMetaResponse {

  @ApiModelProperty({type: () => [ListDataBagRespon]})
  data: ListDataBagRespon[];
}

export class ListDataBagRespon {
  @ApiModelProperty()
  bagId: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  branchFromName: string;

  @ApiModelProperty()
  representativeCode: string;

  @ApiModelProperty()
  transportMode: string;

  @ApiModelProperty()
  totalResi: number;

  @ApiModelProperty()
  weight: string;

}

export class CheckBagDetailResponVm extends BaseMetaResponse {

  @ApiModelProperty({type: () => [DetailCheckBagRespon]})
  data: DetailCheckBagRespon[];
}

export class DetailCheckBagRespon {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  branchToName: string;
}
