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
  awbStatusGrpId: number;

  @ApiModelProperty()
  awbStatusGrpName: string;

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

export class ListResiVm {

  @ApiModelPropertyOptional()
  limit: string;

  @ApiModelPropertyOptional()
  page: string;

  @ApiModelPropertyOptional()
  awbNumber: string;

  @ApiModelPropertyOptional()
  consigneePhone: string;

  @ApiModelPropertyOptional()
  senderPhone: string;

  @ApiModelPropertyOptional()
  status: string;

  @ApiModelPropertyOptional()
  partnerName: string;

  @ApiModelPropertyOptional()
  partnerId: number;

  @ApiModelPropertyOptional()
  excludePartnerId: number;

  @ApiModelProperty({
    example: '2021-12-07 00:00:00',
    format: 'date-time',
  })
  startDate: string;

  @ApiModelProperty({
    example: '2021-12-08 00:00:00',
    format: 'date-time',
  })
  endDate: string;
  
}