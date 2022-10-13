import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseResponse } from '../../../../shared/models/base-response';

class DeleteBagData {
  @ApiModelProperty()
  bagNumbers: [string];
}

export class DeleteBagResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteBagData;
}
