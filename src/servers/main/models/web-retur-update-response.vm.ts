import { ApiModelProperty} from '../../../shared/external/nestjs-swagger';

export class WebReturUpdateListPayloadVm {
  @ApiModelProperty()
  awbReturnId: string;

  @ApiModelProperty()
  awbReturnNumber: string;

  @ApiModelProperty()
  partnerLogisticId: string;
}
