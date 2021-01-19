import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';

export class PartnerOrchestraPayloadVm {
  @ApiModelProperty({ type: 'string' })
  receipt_number: string;

  @ApiModelProperty({ type: 'string', format: 'date-time' })
  timestamp: Date;
}

export class PartnerOrchestraResponseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  statusCode: number;
}