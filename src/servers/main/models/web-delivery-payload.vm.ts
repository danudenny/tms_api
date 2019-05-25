import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';


export class WebDeliveryPayloadVm {
  @ApiModelProperty()
  startDeliveryDateTime: string;

  @ApiModelProperty()
  endDeliveryDateTime: string;

}