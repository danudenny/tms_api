import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebScanOutAwbVm  {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
  })
  awbNumber: string[];
}

export class ScanAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class WebScanOutAwbResponseVm {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm[];
}
export class WebScanOutCreateVm {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelProperty({
    example: 8000,
  })
  doPodType: number;

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
