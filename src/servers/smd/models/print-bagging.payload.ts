import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger/decorators';

export class PrintBaggingDataVm {
  @ApiModelProperty()
  weight: string;

  @ApiModelProperty()
  baggingCode: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  representativeCode: string;
}

export class PrintBaggingVm {
  @ApiModelProperty({ type: () => PrintBaggingDataVm })
  data: PrintBaggingDataVm = new PrintBaggingDataVm();

  @ApiModelProperty()
  baggingId: string;
}
