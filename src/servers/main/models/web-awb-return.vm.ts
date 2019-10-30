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
  provinceCode: string;

  @ApiModelProperty()
  provinceName: string;

  @ApiModelProperty()
  cityId: number;

  @ApiModelProperty()
  cityCode: string;

  @ApiModelProperty()
  cityName: string;

  @ApiModelProperty()
  districtId: number;

  @ApiModelProperty()
  districtCode: string;

  @ApiModelProperty()
  districtName: string;
}

export class WebAwbReturnCreatePayload {
  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneePhone: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneeZip: string;

  @ApiModelPropertyOptional()
  base64Image?: string;
}
