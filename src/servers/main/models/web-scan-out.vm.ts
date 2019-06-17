import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebScanOutVm  {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty({
    example: '20000, 24500, 14000, 25000',
  })
  statusDOId: string;

  @ApiModelProperty({
    description: 'required when statusDO != Antar',
    example: '000123',
  })
  branchCode: string;

  @ApiModelProperty()
  employeeId: string;

  @ApiModelProperty()
  thirdPartyCode: string;

  @ApiModelProperty()
  vehicleNumPlate: string;

  @ApiModelProperty()
  dateDeliveryPlan: string;

  @ApiModelProperty()
  desc: string;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  reasonRetur: string;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
  })
  awbNumber: string[];
}

export class WebScanOutAwbResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  data: string;

}
