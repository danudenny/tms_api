import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { SearchColumnsVm, WebDeliverySearchVm } from '../../../shared/models/base-filter-search.payload.vm';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

// Scan Out Awb
export class WebScanOutAwbVm  {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
  })
  awbNumber: string[];
}

// Scan Out Bag
export class WebScanOutBagVm {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty({
    example: ['00020001', '00020002'],
  })
  bagNumber: string[];
}

// Scan Out Awb List
export class FilterScanOutAwbListVm {

  @ApiModelProperty()
  name: string;

  @ApiModelProperty()
  doPodCode: string;

}

export class WebScanOutAwbListPayloadVm extends BaseMetaPayloadVm {
}

// Create DO POD
export class WebScanOutCreateVm {
  @ApiModelProperty({
    example: 8000,
  })
  doPodType: number;

  @ApiModelPropertyOptional({
    example: 'internal, 3pl',
  })
  doPodMethod?: string;

  @ApiModelPropertyOptional({
    description: 'required when statusDO != Antar',
    example: 123,
  })
  branchIdTo?: number;

  @ApiModelProperty()
  employeeIdDriver: number;

  @ApiModelPropertyOptional()
  partnerLogisticId?: number;

  @ApiModelPropertyOptional({
    example: 'DPS-1701001-1234-ABC',
  })
  vehicleNumber?: string;

  @ApiModelProperty({
    example: '2019-05-01 00:00:00',
  })
  doPodDateTime: string;

  @ApiModelPropertyOptional()
  desc?: string;

  @ApiModelPropertyOptional()
  totalBag?: number;

}

// Create DO POD Delivery
export class WebScanOutCreateDeliveryVm {
  @ApiModelProperty({
    example: 123,
  })
  employeeIdDriver: number;

  @ApiModelProperty({
    example: '2019-05-01 00:00:00',
  })
  doPodDateTime: string;

  @ApiModelPropertyOptional({
    example: 'keterangan',
  })
  desc?: string;
}
