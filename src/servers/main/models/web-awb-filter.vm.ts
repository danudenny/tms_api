import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class WebAwbFilterScanBagVm {
  @ApiModelProperty({
      example: '00020001',
    })
  bagNumber: string;
}

export class WebAwbFilterScanAwbVm  {
  @ApiModelProperty()
  awbNumber: string[];
}
