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

// consigneeDistrict: { value: 112, label: 'DPS33 - Cicurug' }
export class ConsigneeDistrict {
  @ApiModelProperty()
  value: number;

  @ApiModelProperty()
  label: string;

}

export class WebAwbReturnCreatePayload {
  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  partnerLogisticId: number;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  doPodVia: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneePhone: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneeZipCode: string;

  @ApiModelProperty()
  consigneeDistrict: ConsigneeDistrict;

  @ApiModelProperty()
  description: string;

  @ApiModelPropertyOptional()
  base64Image?: string;
}

export class WebAwbReturnCreateResponse {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  awbReturnNumber: string;

  @ApiModelProperty()
  message: string;
}
