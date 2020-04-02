import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

export class ProofDeliveryPayloadVm extends BaseMetaPayloadVm{
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

  @ApiModelProperty()
  awbStatusDateLast: Date;
}

export class ProofTransitDataVm {
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

  @ApiModelProperty()
  awbStatusDateLast: Date;
}
export class ProofValidateTransitResponseVm {
  @ApiModelProperty()
  doPodId: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class  ProofDeliveryResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ProofDeliverDataVm] })
  data: ProofDeliverDataVm[];

  @ApiModelProperty()
  driverNik: string;

  @ApiModelProperty()
  driverFullName: string;

  @ApiModelProperty()
  doPodDeliverId: string;

  @ApiModelProperty()
  doPodDeliverCode: string;

  @ApiModelProperty()
  totalSuccessAwb: number;

  @ApiModelProperty()
  totalErrorAwb: number;
}
export class  ProofTransitResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ProofTransitDataVm] })
  data: ProofTransitDataVm[];
}
