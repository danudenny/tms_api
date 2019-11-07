import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class WebReturUpdateResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

}