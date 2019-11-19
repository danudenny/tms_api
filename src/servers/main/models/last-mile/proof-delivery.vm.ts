import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class ProofDeliveryPayloadVm {
  @ApiModelProperty()
  doPodDeliverCode: string;
}

export class ProofDeliverDataVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  refConsigneeName: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  awbStatusCode: string;

  @ApiModelProperty()
  awbStatusName: string;
}

export class ProofDeliveryResponseVm {
  @ApiModelProperty({ type: [ProofDeliverDataVm] })
  data: ProofDeliverDataVm[];
}
