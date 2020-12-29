import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';

export class PartnerOneidPayloadVm extends BaseMetaPayloadVm {
  @ApiModelProperty({ type: 'string' })
  oneId: string;
}

export class ListOneidOrderActivityDetailVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  partnerId: number;

  @ApiModelProperty()
  partnerName: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  totalItemPrice: string;

  @ApiModelProperty()
  awbStatusIdLast: string;

  @ApiModelProperty()
  awbHistoryDateLast: Date;

  @ApiModelProperty()
  packageTypeName: string;
}

export class ListOneidOrderActivityResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  status: boolean;

  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [ListOneidOrderActivityDetailVm] })
  data: ListOneidOrderActivityDetailVm[];
}