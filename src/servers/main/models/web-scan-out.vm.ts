import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebScanOutAwbVm  {
  @ApiModelProperty()
  doPodId: number;

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

export class WebScanOutCreateVm {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty({
    example: '20000, 24500, 14000, 25000',
  })
  doPodType: string;

  @ApiModelProperty({
    example: 'Internal, 3PL/Third Party',
  })
  doPodMethod: string;

  @ApiModelProperty({
    description: 'required when statusDO != Antar',
    example: '123',
  })
  branchIdTo: number;

  @ApiModelProperty()
  employeeIdDriver: number;

  @ApiModelProperty()
  partnerLogisticId: number;

  @ApiModelProperty({
    example: 'DPS-1701001-1234-ABC',
  })
  vehicleNumber: string;

  @ApiModelProperty({
    example: '2019-05-01 00:00:00',
  })
  doPodDateTime: string;

  @ApiModelProperty()
  desc: string;

  @ApiModelProperty()
  totalBag: number;

  @ApiModelProperty()
  reasonRetur: string;
}

export class WebScanOutCreateResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  doPodId: number;

}
