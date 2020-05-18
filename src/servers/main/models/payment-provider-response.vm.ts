import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';

export class PaymentProviderDetailVm {
  @ApiModelProperty()
  paymentProviderServiceId: string;

  @ApiModelProperty()
  paymentProviderServiceName: string;

  @ApiModelProperty()
  paymentProviderServiceLink: string;

  @ApiModelProperty()
  paymentProviderServiceLogo: string;
}

export class ListProviderResponseVm {
  @ApiModelProperty({ type: () => [PaymentProviderDetailVm] })
  data: PaymentProviderDetailVm[];
}
