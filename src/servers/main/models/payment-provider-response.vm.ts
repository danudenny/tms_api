import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../shared/external/nestjs-swagger';
import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import {MobileProviderPaymentDivaPayloadVm} from './payment-provider-payload';

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

export class MobileProviderPaymentDivaResponseVm {
  @ApiModelProperty()
  data: MobileProviderPaymentDivaPayloadVm;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}
