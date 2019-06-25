import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { SearchColumnsVm, WebDeliverySearchVm } from '../../../shared/models/base-filter-search.payload.vm';

// Scan Out Awb
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

// Scan Out Awb List
export class FilterScanOutAwbListVm {

  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  doPodCode: string;

}

export class WebScanOutAwbListPayloadVm {
  @ApiModelProperty()
  permissionToken: string;

  @ApiModelPropertyOptional({ type: () => FilterScanOutAwbListVm })
  filters?: FilterScanOutAwbListVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;

  @ApiModelPropertyOptional()
  search?: string;

  @ApiModelPropertyOptional({ type: [SearchColumnsVm] })
  searchColumns?: SearchColumnsVm[];
}

// Create DO POD
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
