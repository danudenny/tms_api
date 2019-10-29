import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebAwbReturnGetAwbPayloadVm {
  @ApiModelProperty()
  awbNumber: string;
}

export class WebAwbReturnGetAwbResponseVm {
  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string[];

  @ApiModelProperty()
  consigneeZipCode: string;

  @ApiModelProperty()
  workOrderId: number;

  @ApiModelProperty()
  customerAccountId: number;

  @ApiModelProperty()
  provinceId: number;

  @ApiModelProperty()
  cityId: number;

  @ApiModelProperty()
  districtId: number;
}

export class WebAwbReturnCreatePayload {
  @ApiModelProperty()
  awbId: number;

  @ApiModelPropertyOptional()
  base64Image?: string;
}
