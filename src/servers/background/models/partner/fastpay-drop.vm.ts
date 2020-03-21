import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DropCashlessVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  branchCode: string;

}

export class DropCashLessResponseVM {
  @ApiModelProperty()
  noRef: string;

  @ApiModelProperty()
  refAwbNumber: string;

  @ApiModelProperty()
  recipientCity: string;

  @ApiModelProperty()
  deliveryType: string;

  @ApiModelProperty()
  shipperName: string;

  @ApiModelProperty()
  shipperAddress: string;

  @ApiModelProperty()
  shipperDistrict: string;

  @ApiModelProperty()
  shipperCity: string;

  @ApiModelProperty()
  shipperProvince: string;

  @ApiModelProperty()
  shipperZip: string;

  @ApiModelProperty()
  shipperPhone: string;

  @ApiModelProperty()
  recipientName: string;

  @ApiModelProperty()
  recipientAddress: string;

  @ApiModelProperty()
  recipientDistrict: string;

  @ApiModelProperty()
  recipientProvince: string;

  @ApiModelProperty()
  recipientZip: string;

  @ApiModelProperty()
  recipientPhone: string;
}
