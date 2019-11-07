import { ApiModelProperty} from '../../../shared/external/nestjs-swagger';

export class WebReturUpdateListPayloadVm {
  @ApiModelProperty()
  awbReturnId: string;

  @ApiModelProperty()
  partnerLogisticAwb: string;

}
