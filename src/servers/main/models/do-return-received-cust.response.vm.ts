import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class ReturnReceivedCustFindAllResponseVm {
  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  doId: string;

  @ApiModelProperty()
  notes: string;

}
