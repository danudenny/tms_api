import { ApiModelProperty} from '../../../shared/external/nestjs-swagger';

export class WebReturUpdateListPayloadVm {
  @ApiModelProperty()
  originAwbNumber: string;

  @ApiModelProperty()
  partnerLogisticAwb: string;

}
