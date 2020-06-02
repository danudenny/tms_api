import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class MobileProviderPaymentDivaPayloadVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  noReference: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty({
    example: 'cash' || 'cashless',
  })
  codPaymentMethod: string;

  @ApiModelPropertyOptional()
  codPaymentService: string;

  @ApiModelPropertyOptional()
  note: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;
}
